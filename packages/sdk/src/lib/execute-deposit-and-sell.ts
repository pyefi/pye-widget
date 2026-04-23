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

// ─── Shared constants (mirrors execute-stake-deposit.ts) ──────────────────────

const BONDS_PROGRAM_ID = new PublicKey(
  "PYEQZ2qYHPQapnw8Ms8MSPMNzoq59NHHfNwAtuV26wx",
);

const DEPOSIT_STAKE_DISCRIMINATOR = new Uint8Array([
  21, 14, 117, 220, 1, 60, 23, 13,
]);

const SYSVAR_CLOCK = new PublicKey("SysvarC1ock11111111111111111111111111111111");
const STAKE_PROGRAM = new PublicKey("Stake11111111111111111111111111111111111111");
const SYSVAR_STAKE_HISTORY = new PublicKey("SysvarStakeHistory1111111111111111111111111");

function deriveGlobalSettings(): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("global_settings")],
    BONDS_PROGRAM_ID,
  );
  return pda;
}

function deriveStakeAccount(bond: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("stake"), bond.toBuffer()],
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
export async function executeDepositAndSell({
  connection,
  wallet,
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
}: ExecuteDepositAndSellParams): Promise<ExecuteDepositAndSellResult> {
  if (!wallet.publicKey || !wallet.sendTransaction) {
    throw new Error("Wallet not connected");
  }

  const owner = wallet.publicKey;
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
  ] = await Promise.all([
    fetchProtocolFeeWallet(connection, globalSettingsPda),
    fetchTransientStakeAccount(connection, bond),
    connection.getMinimumBalanceForRentExemption(StakeProgram.space),
    connection.getLatestBlockhash("confirmed"),
    ManifestClient.getClientReadOnly(connection, marketPk),
    connection.getAddressLookupTable(new PublicKey(altPubkey)),
  ]);

  const altAccount = altResponse.value;
  if (!altAccount) {
    throw new Error(
      `Address Lookup Table ${altPubkey} not found on-chain — it may not be deployed yet.`,
    );
  }

  // Derive ATAs
  const ownerPt   = getAssociatedTokenAddressSync(ptMint, owner);
  const ownerYt   = getAssociatedTokenAddressSync(ytMint, owner);
  const feeWalletPt = getAssociatedTokenAddressSync(ptMint, protocolFeeWallet, true);
  const feeWalletYt = getAssociatedTokenAddressSync(ytMint, protocolFeeWallet, true);
  const wsolAta   = getAssociatedTokenAddressSync(NATIVE_MINT, owner, false, TOKEN_PROGRAM_ID);
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

  const amountLamports = Math.round(amountSol * 1e9);
  const totalLamports  = Math.round(stakeBalanceSol * 1e9);
  const isPartial      = amountLamports < totalLamports;

  // Swap parameters — RT minted is proportional to remaining issuance window,
  // so the caller computes the expected RT with `estimateRtFromStake` and
  // passes it in. Using amountSol here would overshoot what the Bonds program
  // actually mints and cause Manifest to reject the swap.
  const baseDecimals  = manifestClient.market.baseDecimals();
  const quoteDecimals = manifestClient.market.quoteDecimals();
  const inAtoms  = BigInt(Math.round(rtAmountToSell * 10 ** baseDecimals));
  const outAtoms = BigInt(Math.round(minReceiveTokens * 10 ** quoteDecimals));

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
  const isTransientSet = !transientStakeAccount.equals(PublicKey.default);
  const remainingAccounts = isTransientSet
    ? [{ pubkey: transientStakeAccount, isSigner: false, isWritable: true }]
    : [];

  instructions.push(
    new TransactionInstruction({
      programId: BONDS_PROGRAM_ID,
      keys: [
        { pubkey: owner,             isSigner: true,  isWritable: true  },
        { pubkey: depositStakeAccount, isSigner: false, isWritable: true },
        { pubkey: ownerPt,           isSigner: false, isWritable: true  },
        { pubkey: ownerYt,           isSigner: false, isWritable: true  },
        { pubkey: bond,              isSigner: false, isWritable: false },
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

  // Log serialized size so we can verify we're under the 1232-byte limit.
  try {
    const serialized = vtx.serialize();
    console.log(
      `[executeDepositAndSell] v0 tx size=${serialized.length}B ` +
      `(limit=1232) alt=${altPubkey.slice(0, 8)}... skipped=[ownerPt:${ownerPtExists},ownerYt:${ownerYtExists},` +
      `feeWalletPt:${feeWalletPtExists},feeWalletYt:${feeWalletYtExists},` +
      `wsolAta:${wsolAtaExists},treasuryWsol:${treasuryWsolExists}] feeLamports=${feeLamports}`,
    );
  } catch (err) {
    console.warn("[executeDepositAndSell] could not measure tx size:", err);
  }

  // ── Send & confirm ─────────────────────────────────────────────────────────

  const signature = await wallet.sendTransaction(vtx, connection);

  const confirmation = await connection.confirmTransaction(
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
