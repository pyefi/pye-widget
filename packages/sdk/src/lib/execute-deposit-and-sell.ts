import "./manifest-parser"; // BigInt Buffer polyfills
import { ManifestClient } from "@cks-systems/manifest-sdk";
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  StakeProgram,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createCloseAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import type { WalletContextState } from "@solana/wallet-adapter-react";
import { PYE_TREASURY_WALLET, calculateFeeLamports } from "../constants/fees";
import { BONDS_PROGRAM_ID, deriveStakeAccount } from "./pdas";
import { solToLamports, validateStakeDepositAmount, validateSolDepositAmount, DepositValidationError } from "./deposit-validation";
import { getStakeMinimumDelegationLamports, getStakeRentExemptLamports } from "./stake-requirements";
import { buildDepositSolInstruction } from "./execute-stake-deposit";

const DEPOSIT_STAKE_DISCRIMINATOR = new Uint8Array([
  21, 14, 117, 220, 1, 60, 23, 13,
]);

const SYSVAR_CLOCK = new PublicKey("SysvarC1ock11111111111111111111111111111111");
const STAKE_PROGRAM = new PublicKey("Stake11111111111111111111111111111111111111");
const SYSVAR_STAKE_HISTORY = new PublicKey("SysvarStakeHistory1111111111111111111111111");
const SYSVAR_RENT = new PublicKey("SysvarRent111111111111111111111111111111111");
const STAKE_CONFIG = new PublicKey("StakeConfig11111111111111111111111111111111");

function deriveGlobalSettings(): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("global_settings")],
    BONDS_PROGRAM_ID,
  );
  return pda;
}

async function fetchProtocolFeeWallet(
  connection: Connection,
  globalSettingsPda: PublicKey,
): Promise<PublicKey> {
  const info = await connection.getAccountInfo(globalSettingsPda);
  if (!info?.data) throw new Error("GlobalSettings account not found");
  return new PublicKey(info.data.subarray(40, 72));
}

async function fetchTransientStakeAccount(
  connection: Connection,
  bond: PublicKey,
): Promise<PublicKey> {
  const info = await connection.getAccountInfo(bond);
  if (!info?.data) throw new Error("Bond account not found");
  return new PublicKey(info.data.subarray(72, 104));
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ExecuteDepositAndSellParams {
  connection: Connection;
  wallet: WalletContextState;
  // deposit
  bondPubkey: string;
  principalTokenMint: string;
  yieldTokenMint: string;
  validatorVoteAccount: string;
  stakeAccountPubkey: string;
  amountSol: number;
  stakeBalanceSol: number;
  // sell
  marketPubkey: string;
  /**
   * Expected RT tokens the Bonds program will mint to the user for this
   * deposit. The Bonds program mints RT proportional to remaining time in the
   * issuance window, so this is always ≤ amountSol — compute with
   * `estimateRtFromStake` using an epoch-synced `nowTs`.
   */
  rtAmountToSell: number;
  minReceiveTokens: number;
  /** Gross SOL out (pre-fee) used to size the Pye taker-fee transfer. */
  expectedSolOut: number;
  // v0 lookup table containing this validator's static accounts
  altPubkey: string;
}

export interface ExecuteDepositAndSellResult {
  signature: string;
}

// ─── Bundled transaction ──────────────────────────────────────────────────────

/**
 * Deposits a stake account into the Pye lockup and immediately sells the
 * resulting RT tokens on Manifest — all in a single atomic transaction.
 *
 * Instruction order:
 *   1. ComputeBudget (limit + price)
 *   2. StakeProgram.split (only if partial deposit)
 *   3. createATA: ownerPt, ownerYt (RT), feeWalletPt, feeWalletYt, wSOL, treasuryWsol
 *   4. Bonds deposit → mints PT + RT into ownerPt / ownerYt
 *   5. Manifest swapIx → sells RT for wSOL
 *   6. transfer → Pye taker fee (wSOL) from owner's wsolAta to treasuryWsol
 *   7. closeAccount → unwraps remaining wSOL to native SOL
 */
/** Build params are the execute params minus the wallet, plus the owner pubkey
 *  — so the same builder serves both signing (execute) and simulation. */
export type BuildDepositAndSellParams = Omit<ExecuteDepositAndSellParams, "wallet"> & {
  owner: PublicKey;
};

export interface BuiltDepositAndSellTx {
  vtx: VersionedTransaction;
  splitKeypair: Keypair | null;
  latestBlockhash: Awaited<ReturnType<Connection["getLatestBlockhash"]>>;
}

/**
 * Builds (but does not send) the bundled deposit-and-sell v0 transaction.
 * Shared by `executeDepositAndSell` (signs + sends) and
 * `simulateDepositAndSellNetSol` (simulates to preview the wallet delta).
 */
export async function buildDepositAndSellTx({
  connection,
  owner,
  bondPubkey,
  principalTokenMint,
  yieldTokenMint,
  validatorVoteAccount,
  stakeAccountPubkey,
  amountSol,
  stakeBalanceSol,
  marketPubkey,
  rtAmountToSell,
  minReceiveTokens,
  expectedSolOut,
  altPubkey,
}: BuildDepositAndSellParams): Promise<BuiltDepositAndSellTx> {
  const bond = new PublicKey(bondPubkey);
  const ptMint = new PublicKey(principalTokenMint);
  const ytMint = new PublicKey(yieldTokenMint);
  const voteAccount = new PublicKey(validatorVoteAccount);
  const userStake = new PublicKey(stakeAccountPubkey);
  const marketPk = new PublicKey(marketPubkey);

  const globalSettingsPda = deriveGlobalSettings();
  const stakeAccountPda = deriveStakeAccount(bond);

  // Fetch all on-chain prerequisites in parallel
  const [
    protocolFeeWallet,
    transientStakeAccount,
    rentExemptReserve,
    latestBlockhash,
    manifestClient,
    altResponse,
    minDelegationLamports,
  ] = await Promise.all([
    fetchProtocolFeeWallet(connection, globalSettingsPda),
    fetchTransientStakeAccount(connection, bond),
    getStakeRentExemptLamports(connection),
    connection.getLatestBlockhash("confirmed"),
    ManifestClient.getClientReadOnly(connection, marketPk),
    connection.getAddressLookupTable(new PublicKey(altPubkey)),
    getStakeMinimumDelegationLamports(connection),
  ]);

  const altAccount = altResponse.value;
  if (!altAccount) {
    throw new Error(
      `Address Lookup Table ${altPubkey} not found on-chain — it may not be deployed yet.`,
    );
  }

  // Derive ATAs — `allowOwnerOffCurve: true` so PDA-backed wallets
  // (Squads multisig vaults, other smart-account adapters) don't trip
  // TokenOwnerOffCurveError during address derivation.
  const ownerPt   = getAssociatedTokenAddressSync(ptMint, owner, true);
  const ownerYt   = getAssociatedTokenAddressSync(ytMint, owner, true);
  const feeWalletPt = getAssociatedTokenAddressSync(ptMint, protocolFeeWallet, true);
  const feeWalletYt = getAssociatedTokenAddressSync(ytMint, protocolFeeWallet, true);
  const wsolAta   = getAssociatedTokenAddressSync(NATIVE_MINT, owner, true, TOKEN_PROGRAM_ID);
  const treasuryWsol = getAssociatedTokenAddressSync(
    NATIVE_MINT, PYE_TREASURY_WALLET, true, TOKEN_PROGRAM_ID,
  );

  // Pre-check which ATAs already exist so we can skip their createIdempotent ixs.
  // Each skipped ix shaves ~11 bytes off the tx; fee-wallet ATAs are almost
  // always present in steady state.
  const ataInfos = await connection.getMultipleAccountsInfo([
    ownerPt, ownerYt, feeWalletPt, feeWalletYt, wsolAta, treasuryWsol,
  ]);
  const [
    ownerPtExists, ownerYtExists, feeWalletPtExists, feeWalletYtExists,
    wsolAtaExists, treasuryWsolExists,
  ] = ataInfos.map((info) => info !== null);

  // `stakeBalanceSol` is the account's DELEGATED stake (see the widget wiring in
  // fetch-user-stake-accounts.ts), not the account total.
  const amountLamports = solToLamports(amountSol);

  const validation = validateStakeDepositAmount({
    amountLamports,
    delegatedLamports: solToLamports(stakeBalanceSol),
    minDelegationLamports,
  });
  if (!validation.ok) throw new DepositValidationError(validation.code, validation.message);
  const { isPartial } = validation;

  // Swap parameters — RT minted is proportional to remaining issuance window,
  // so the caller computes the expected RT with `estimateRtFromStake` and
  // passes it in. Using amountSol here would overshoot what the Bonds program
  // actually mints and cause Manifest to reject the swap.
  //
  // Apply a 2 bps safety buffer (floored + min 100 atoms) to absorb clock
  // drift between the caller's quote and the on-chain Bonds mint. The chain
  // clock ticks forward while the tx sits in the user's wallet, shrinking
  // the actual mint ratio; asking for even 1 atom more than what's minted
  // fails the swap with "Insufficient base in atoms".
  const baseDecimals  = manifestClient.market.baseDecimals();
  const quoteDecimals = manifestClient.market.quoteDecimals();
  const rawInAtoms      = Math.floor(rtAmountToSell * 10 ** baseDecimals);
  const safetyBuffer    = Math.max(Math.ceil(rawInAtoms * 0.0002), 100);
  const inAtoms  = BigInt(Math.max(rawInAtoms - safetyBuffer, 0));
  const outAtoms = BigInt(Math.floor(minReceiveTokens * 10 ** quoteDecimals));

  // ── Build instructions ─────────────────────────────────────────────────────

  const instructions: TransactionInstruction[] = [];

  // Combined compute budget for deposit (~400k) + Manifest swap (~150k)
  instructions.push(ComputeBudgetProgram.setComputeUnitLimit({ units: 550_000 }));
  instructions.push(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1_000 }));

  // Optional stake split for partial deposits
  let depositStakeAccount: PublicKey;
  let splitKeypair: Keypair | null = null;

  if (isPartial) {
    splitKeypair = Keypair.generate();
    instructions.push(
      ...StakeProgram.split(
        {
          stakePubkey: userStake,
          authorizedPubkey: owner,
          splitStakePubkey: splitKeypair.publicKey,
          lamports: amountLamports,
        },
        rentExemptReserve,
      ).instructions,
    );
    depositStakeAccount = splitKeypair.publicKey;
  } else {
    depositStakeAccount = userStake;
  }

  // Create only the token accounts that don't already exist.
  if (!ownerPtExists)       instructions.push(createAssociatedTokenAccountIdempotentInstruction(owner, ownerPt,     owner,             ptMint));
  if (!ownerYtExists)       instructions.push(createAssociatedTokenAccountIdempotentInstruction(owner, ownerYt,     owner,             ytMint));
  if (!feeWalletPtExists)   instructions.push(createAssociatedTokenAccountIdempotentInstruction(owner, feeWalletPt, protocolFeeWallet, ptMint));
  if (!feeWalletYtExists)   instructions.push(createAssociatedTokenAccountIdempotentInstruction(owner, feeWalletYt, protocolFeeWallet, ytMint));
  if (!wsolAtaExists)       instructions.push(createAssociatedTokenAccountIdempotentInstruction(owner, wsolAta,     owner,             NATIVE_MINT));
  if (!treasuryWsolExists)  instructions.push(createAssociatedTokenAccountIdempotentInstruction(owner, treasuryWsol, PYE_TREASURY_WALLET, NATIVE_MINT));

  // Bonds deposit instruction — mints PT + RT into ownerPt / ownerYt
  // remaining_accounts for deposit_stake:
  //   - transient stake account (only when the bond already has one set; the
  //     program locates it by key when merging)
  //   - the Bonds program itself — required so the program's `transfer_native`
  //     self-CPI (hit on the first deposit to a bond, the Empty branch) can
  //     resolve its own program account. Omitting it fails with MissingAccount.
  const isTransientSet = !transientStakeAccount.equals(PublicKey.default);
  const remainingAccounts = [
    ...(isTransientSet
      ? [{ pubkey: transientStakeAccount, isSigner: false, isWritable: true }]
      : []),
    { pubkey: BONDS_PROGRAM_ID, isSigner: false, isWritable: false },
  ];

  instructions.push(
    new TransactionInstruction({
      programId: BONDS_PROGRAM_ID,
      keys: [
        { pubkey: owner,             isSigner: true,  isWritable: true  },
        { pubkey: depositStakeAccount, isSigner: false, isWritable: true },
        { pubkey: ownerPt,           isSigner: false, isWritable: true  },
        { pubkey: ownerYt,           isSigner: false, isWritable: true  },
        { pubkey: bond,              isSigner: false, isWritable: true  },
        { pubkey: voteAccount,       isSigner: false, isWritable: false },
        { pubkey: stakeAccountPda,   isSigner: false, isWritable: true  },
        { pubkey: ptMint,            isSigner: false, isWritable: true  },
        { pubkey: ytMint,            isSigner: false, isWritable: true  },
        { pubkey: globalSettingsPda, isSigner: false, isWritable: false },
        { pubkey: protocolFeeWallet, isSigner: false, isWritable: false },
        { pubkey: feeWalletPt,       isSigner: false, isWritable: true  },
        { pubkey: feeWalletYt,       isSigner: false, isWritable: true  },
        { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID,  isSigner: false, isWritable: false },
        { pubkey: PublicKey.default, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_CLOCK,      isSigner: false, isWritable: false },
        { pubkey: STAKE_PROGRAM,     isSigner: false, isWritable: false },
        { pubkey: SYSVAR_STAKE_HISTORY, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_RENT,       isSigner: false, isWritable: false },
        { pubkey: STAKE_CONFIG,      isSigner: false, isWritable: false },
        ...remainingAccounts,
      ],
      data: Buffer.from(DEPOSIT_STAKE_DISCRIMINATOR),
    }),
  );

  // Manifest swap — sells RT (ownerYt) for wSOL
  instructions.push(
    manifestClient.swapIx(owner, {
      inAtoms,
      outAtoms,
      isBaseIn: true,
      isExactIn: true,
    }),
  );

  // Pye taker fee on SOL out → transfer wSOL to treasury before unwrap.
  // Fee is sized off the quoted gross amount (expectedSolOut); this amount is
  // guaranteed present because swap minReceive > fee for any valid slippage.
  const feeLamports = calculateFeeLamports(expectedSolOut);
  if (feeLamports > BigInt(0)) {
    instructions.push(
      createTransferInstruction(wsolAta, treasuryWsol, owner, feeLamports),
    );
  }

  // Unwrap wSOL → native SOL
  instructions.push(createCloseAccountInstruction(wsolAta, owner, owner));

  // ── Compile to v0 with ALT ─────────────────────────────────────────────────

  const message = new TransactionMessage({
    payerKey: owner,
    recentBlockhash: latestBlockhash.blockhash,
    instructions,
  }).compileToV0Message([altAccount]);

  const vtx = new VersionedTransaction(message);
  if (splitKeypair) vtx.sign([splitKeypair]);

  return { vtx, splitKeypair, latestBlockhash };
}

/**
 * Builds, signs, sends, and confirms the bundled deposit-and-sell transaction.
 */
export async function executeDepositAndSell({
  wallet,
  ...rest
}: ExecuteDepositAndSellParams): Promise<ExecuteDepositAndSellResult> {
  if (!wallet.publicKey || !wallet.sendTransaction) {
    throw new Error("Wallet not connected");
  }

  const { vtx, latestBlockhash } = await buildDepositAndSellTx({
    owner: wallet.publicKey,
    ...rest,
  });

  const signature = await wallet.sendTransaction(vtx, rest.connection);

  const confirmation = await rest.connection.confirmTransaction(
    {
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    },
    "confirmed",
  );

  if (confirmation.value.err) {
    throw new Error(
      `Transaction failed on-chain: ${JSON.stringify(confirmation.value.err)}`,
    );
  }

  return { signature };
}

/** Compute-budget priority fee for this tx (550k CU × 1000 µLamports). */
const PRIORITY_FEE_LAMPORTS = Math.ceil((550_000 * 1_000) / 1_000_000);

/**
 * Simulates a built bundled transaction and returns the **net SOL change** to
 * the owner's wallet — exactly what a wallet preview (Phantom) shows. Captures
 * every real cost (token-account rent, the Manifest market expansion only when
 * it actually happens, fresh-bond split rent, slippage) without modeling any of
 * them. `simulateTransaction` doesn't charge the network fee, so we subtract it
 * using the same priority fee the sender applies.
 *
 * Throws if the transaction would fail to simulate.
 */
async function simulateNetSolChange(
  connection: Connection,
  owner: PublicKey,
  vtx: VersionedTransaction,
  priorityFeeLamports: number,
): Promise<number> {
  const [preLamports, sim] = await Promise.all([
    connection.getBalance(owner, "confirmed"),
    connection.simulateTransaction(vtx, {
      replaceRecentBlockhash: true,
      commitment: "confirmed",
      accounts: { encoding: "base64", addresses: [owner.toBase58()] },
    }),
  ]);

  if (sim.value.err) {
    throw new Error(`Simulation failed: ${JSON.stringify(sim.value.err)}`);
  }
  const postLamports = sim.value.accounts?.[0]?.lamports;
  if (postLamports == null) {
    throw new Error("Simulation returned no balance for the owner");
  }

  const numSigs = vtx.message.header.numRequiredSignatures;
  const networkFeeLamports = 5_000 * numSigs + priorityFeeLamports;

  return (postLamports - preLamports - networkFeeLamports) / 1e9;
}

/** Simulate the stake-account deposit-and-sell; see {@link simulateNetSolChange}. */
export async function simulateDepositAndSellNetSol(
  params: BuildDepositAndSellParams,
): Promise<number> {
  const { vtx } = await buildDepositAndSellTx(params);
  return simulateNetSolChange(params.connection, params.owner, vtx, PRIORITY_FEE_LAMPORTS);
}

/**
 * Params for the atomic liquid-SOL deposit + sell — like
 * `BuildDepositAndSellParams` but with no stake account (deposits native SOL).
 */
export interface BuildDepositSolAndSellParams {
  connection: Connection;
  owner: PublicKey;
  // deposit
  bondPubkey: string;
  principalTokenMint: string;
  yieldTokenMint: string;
  validatorVoteAccount: string;
  amountSol: number;
  // sell
  marketPubkey: string;
  /**
   * Expected RT tokens the Bonds program will mint to the user for this
   * deposit. Compute with `estimateRtFromStake` using an epoch-synced `nowTs`.
   */
  rtAmountToSell: number;
  minReceiveTokens: number;
  /** Gross SOL out (pre-fee) used to size the Pye taker-fee transfer. */
  expectedSolOut: number;
  // v0 lookup table containing this validator's static accounts
  altPubkey: string;
}

export interface BuiltDepositSolAndSellTx {
  vtx: VersionedTransaction;
  transientKeypair: Keypair | null;
  latestBlockhash: Awaited<ReturnType<Connection["getLatestBlockhash"]>>;
}

/**
 * Builds (but does not send) the bundled liquid-SOL deposit-and-sell v0
 * transaction. Shared by `executeDepositSolAndSell` and
 * `simulateDepositSolAndSellNetSol`.
 */
export async function buildDepositSolAndSellTx({
  connection,
  owner,
  bondPubkey,
  principalTokenMint,
  yieldTokenMint,
  validatorVoteAccount,
  amountSol,
  marketPubkey,
  rtAmountToSell,
  minReceiveTokens,
  expectedSolOut,
  altPubkey,
}: BuildDepositSolAndSellParams): Promise<BuiltDepositSolAndSellTx> {
  const bond = new PublicKey(bondPubkey);
  const ptMint = new PublicKey(principalTokenMint);
  const ytMint = new PublicKey(yieldTokenMint);
  const voteAccount = new PublicKey(validatorVoteAccount);
  const marketPk = new PublicKey(marketPubkey);

  const globalSettingsPda = deriveGlobalSettings();

  const [
    protocolFeeWallet,
    latestBlockhash,
    manifestClient,
    altResponse,
    minDelegationLamports,
  ] = await Promise.all([
    fetchProtocolFeeWallet(connection, globalSettingsPda),
    connection.getLatestBlockhash("confirmed"),
    ManifestClient.getClientReadOnly(connection, marketPk),
    connection.getAddressLookupTable(new PublicKey(altPubkey)),
    getStakeMinimumDelegationLamports(connection),
  ]);

  const altAccount = altResponse.value;
  if (!altAccount) {
    throw new Error(
      `Address Lookup Table ${altPubkey} not found on-chain — it may not be deployed yet.`,
    );
  }

  // allowOwnerOffCurve: true for PDA-backed wallets (Squads vaults, etc.)
  const ownerPt     = getAssociatedTokenAddressSync(ptMint, owner, true);
  const ownerYt     = getAssociatedTokenAddressSync(ytMint, owner, true);
  const feeWalletPt = getAssociatedTokenAddressSync(ptMint, protocolFeeWallet, true);
  const feeWalletYt = getAssociatedTokenAddressSync(ytMint, protocolFeeWallet, true);
  const wsolAta     = getAssociatedTokenAddressSync(NATIVE_MINT, owner, true, TOKEN_PROGRAM_ID);
  const treasuryWsol = getAssociatedTokenAddressSync(
    NATIVE_MINT, PYE_TREASURY_WALLET, true, TOKEN_PROGRAM_ID,
  );

  // Pre-check which ATAs already exist so we can skip their createIdempotent ixs.
  const ataInfos = await connection.getMultipleAccountsInfo([
    ownerPt, ownerYt, feeWalletPt, feeWalletYt, wsolAta, treasuryWsol,
  ]);
  const [
    ownerPtExists, ownerYtExists, feeWalletPtExists, feeWalletYtExists,
    wsolAtaExists, treasuryWsolExists,
  ] = ataInfos.map((info) => info !== null);

  const amountLamportsNum = solToLamports(amountSol);

  const validation = validateSolDepositAmount({
    amountLamports: amountLamportsNum,
    minDelegationLamports,
  });
  if (!validation.ok) throw new DepositValidationError(validation.code, validation.message);

  // 2 bps safety buffer absorbs clock drift between the caller's quote and the
  // on-chain mint — asking even 1 atom more than minted fails the swap with
  // "Insufficient base in atoms".
  const baseDecimals  = manifestClient.market.baseDecimals();
  const quoteDecimals = manifestClient.market.quoteDecimals();
  const rawInAtoms   = Math.floor(rtAmountToSell * 10 ** baseDecimals);
  const safetyBuffer = Math.max(Math.ceil(rawInAtoms * 0.0002), 100);
  const inAtoms      = BigInt(Math.max(rawInAtoms - safetyBuffer, 0));
  const outAtoms     = BigInt(Math.floor(minReceiveTokens * 10 ** quoteDecimals));

  const instructions: TransactionInstruction[] = [];

  // Combined compute budget for deposit_sol (~285k) + Manifest swap (~150k) + margin
  instructions.push(ComputeBudgetProgram.setComputeUnitLimit({ units: 600_000 }));
  instructions.push(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1_000 }));

  if (!ownerPtExists)      instructions.push(createAssociatedTokenAccountIdempotentInstruction(owner, ownerPt,      owner,               ptMint));
  if (!ownerYtExists)      instructions.push(createAssociatedTokenAccountIdempotentInstruction(owner, ownerYt,      owner,               ytMint));
  if (!feeWalletPtExists)  instructions.push(createAssociatedTokenAccountIdempotentInstruction(owner, feeWalletPt,  protocolFeeWallet,   ptMint));
  if (!feeWalletYtExists)  instructions.push(createAssociatedTokenAccountIdempotentInstruction(owner, feeWalletYt,  protocolFeeWallet,   ytMint));
  if (!wsolAtaExists)      instructions.push(createAssociatedTokenAccountIdempotentInstruction(owner, wsolAta,      owner,               NATIVE_MINT));
  if (!treasuryWsolExists) instructions.push(createAssociatedTokenAccountIdempotentInstruction(owner, treasuryWsol, PYE_TREASURY_WALLET, NATIVE_MINT));

  const { ix: depositIx, transientKeypair } = await buildDepositSolInstruction({
    connection,
    owner,
    bond,
    voteAccount,
    ptMint,
    ytMint,
    ownerPt,
    ownerYt,
    feeWalletPt,
    feeWalletYt,
    protocolFeeWallet,
    amountLamports: amountLamportsNum,
  });
  instructions.push(depositIx);

  instructions.push(
    manifestClient.swapIx(owner, {
      inAtoms,
      outAtoms,
      isBaseIn: true,
      isExactIn: true,
    }),
  );

  // Pye taker fee on SOL out → transfer wSOL to treasury before unwrap.
  const feeLamports = calculateFeeLamports(expectedSolOut);
  if (feeLamports > BigInt(0)) {
    instructions.push(
      createTransferInstruction(wsolAta, treasuryWsol, owner, feeLamports),
    );
  }

  instructions.push(createCloseAccountInstruction(wsolAta, owner, owner));

  const message = new TransactionMessage({
    payerKey: owner,
    recentBlockhash: latestBlockhash.blockhash,
    instructions,
  }).compileToV0Message([altAccount]);

  const vtx = new VersionedTransaction(message);
  if (transientKeypair) vtx.sign([transientKeypair]);

  return { vtx, transientKeypair, latestBlockhash };
}

export type ExecuteDepositSolAndSellParams = Omit<BuildDepositSolAndSellParams, "owner"> & {
  wallet: WalletContextState;
};

export interface ExecuteDepositSolAndSellResult {
  signature: string;
}

/**
 * Builds, signs, sends, and confirms the bundled liquid-SOL deposit-and-sell
 * transaction.
 */
export async function executeDepositSolAndSell({
  wallet,
  ...rest
}: ExecuteDepositSolAndSellParams): Promise<ExecuteDepositSolAndSellResult> {
  if (!wallet.publicKey || !wallet.sendTransaction) {
    throw new Error("Wallet not connected");
  }
  const { vtx, latestBlockhash } = await buildDepositSolAndSellTx({
    owner: wallet.publicKey,
    ...rest,
  });
  const signature = await wallet.sendTransaction(vtx, rest.connection);
  const confirmation = await rest.connection.confirmTransaction(
    { signature, blockhash: latestBlockhash.blockhash, lastValidBlockHeight: latestBlockhash.lastValidBlockHeight },
    "confirmed",
  );
  if (confirmation.value.err) {
    throw new Error(`Transaction failed on-chain: ${JSON.stringify(confirmation.value.err)}`);
  }
  return { signature };
}

/** Compute-budget priority fee for liquid-SOL deposit-and-sell (600k CU × 1000 µLamports). */
const DEPOSIT_SOL_PRIORITY_FEE_LAMPORTS = Math.ceil((600_000 * 1_000) / 1_000_000);

/**
 * Simulates the bundled liquid-SOL deposit-and-sell for the net SOL change;
 * same semantics as `simulateDepositAndSellNetSol` on the native-SOL path.
 */
export async function simulateDepositSolAndSellNetSol(
  params: BuildDepositSolAndSellParams,
): Promise<number> {
  const { vtx } = await buildDepositSolAndSellTx(params);
  return simulateNetSolChange(
    params.connection,
    params.owner,
    vtx,
    DEPOSIT_SOL_PRIORITY_FEE_LAMPORTS,
  );
}
