import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  StakeProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction,
} from "@solana/spl-token";
import type { WalletContextState } from "@solana/wallet-adapter-react";
import { BONDS_PROGRAM_ID, deriveStakeAccount } from "./pdas";
import { solToLamports, validateStakeDepositAmount, validateSolDepositAmount, DepositValidationError } from "./deposit-validation";
import { getStakeMinimumDelegationLamports, getStakeRentExemptLamports } from "./stake-requirements";

/** soloValidatorDepositSol discriminator */
const DEPOSIT_SOL_DISCRIMINATOR = new Uint8Array([
  253, 10, 62, 175, 159, 90, 55, 142,
]);

/** soloValidatorDepositStake discriminator */
const DEPOSIT_STAKE_DISCRIMINATOR = new Uint8Array([
  21, 14, 117, 220, 1, 60, 23, 13,
]);

const SYSVAR_CLOCK = new PublicKey(
  "SysvarC1ock11111111111111111111111111111111",
);
const STAKE_PROGRAM = new PublicKey(
  "Stake11111111111111111111111111111111111111",
);
const SYSVAR_RENT = new PublicKey(
  "SysvarRent111111111111111111111111111111111",
);
const SYSVAR_STAKE_HISTORY = new PublicKey(
  "SysvarStakeHistory1111111111111111111111111",
);
const STAKE_CONFIG = new PublicKey(
  "StakeConfig11111111111111111111111111111111",
);

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
  if (!info || !info.data) {
    throw new Error("GlobalSettings account not found");
  }
  return new PublicKey(info.data.subarray(40, 72));
}

async function fetchTransientStakeAccount(
  connection: Connection,
  bond: PublicKey,
): Promise<PublicKey> {
  const info = await connection.getAccountInfo(bond);
  if (!info || !info.data) {
    throw new Error("Bond account not found");
  }
  return new PublicKey(info.data.subarray(72, 104));
}

function encodeDepositData(amountLamports: bigint): Uint8Array {
  const buf = new ArrayBuffer(16);
  const bytes = new Uint8Array(buf);
  bytes.set(DEPOSIT_SOL_DISCRIMINATOR, 0);
  new DataView(buf).setBigUint64(8, amountLamports, true);
  return bytes;
}

export interface BuildDepositSolInstructionParams {
  connection: Connection;
  owner: PublicKey;
  bond: PublicKey;
  voteAccount: PublicKey;
  ptMint: PublicKey;
  ytMint: PublicKey;
  ownerPt: PublicKey;
  ownerYt: PublicKey;
  feeWalletPt: PublicKey;
  feeWalletYt: PublicKey;
  protocolFeeWallet: PublicKey;
  amountLamports: number; // validated, integer
}

export interface BuiltDepositSolInstruction {
  ix: TransactionInstruction;
  transientKeypair: Keypair | null;
}

/**
 * Builds the `deposit_sol` instruction for the Bonds program, generating a
 * transient keypair when the bond has no existing transient stake account.
 */
export async function buildDepositSolInstruction({
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
  amountLamports,
}: BuildDepositSolInstructionParams): Promise<BuiltDepositSolInstruction> {
  const stakeAccountPda = deriveStakeAccount(bond);
  const globalSettingsPda = deriveGlobalSettings();

  const transientStakeAccount = await fetchTransientStakeAccount(connection, bond);

  const isTransientUninitialized = transientStakeAccount.equals(PublicKey.default);
  const transientKeypair = isTransientUninitialized ? Keypair.generate() : null;
  const transientPubkey = transientKeypair?.publicKey ?? transientStakeAccount;

  const ix = new TransactionInstruction({
    programId: BONDS_PROGRAM_ID,
    keys: [
      { pubkey: owner,                       isSigner: true,               isWritable: true  },
      { pubkey: ownerPt,                     isSigner: false,              isWritable: true  },
      { pubkey: ownerYt,                     isSigner: false,              isWritable: true  },
      { pubkey: bond,                        isSigner: false,              isWritable: true  },
      { pubkey: voteAccount,                 isSigner: false,              isWritable: false },
      { pubkey: stakeAccountPda,             isSigner: false,              isWritable: true  },
      { pubkey: ptMint,                      isSigner: false,              isWritable: true  },
      { pubkey: ytMint,                      isSigner: false,              isWritable: true  },
      { pubkey: globalSettingsPda,           isSigner: false,              isWritable: false },
      { pubkey: protocolFeeWallet,           isSigner: false,              isWritable: true  },
      { pubkey: feeWalletPt,                 isSigner: false,              isWritable: true  },
      { pubkey: feeWalletYt,                 isSigner: false,              isWritable: true  },
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false,              isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID,            isSigner: false,              isWritable: false },
      { pubkey: PublicKey.default,           isSigner: false,              isWritable: false },
      { pubkey: SYSVAR_CLOCK,                isSigner: false,              isWritable: false },
      { pubkey: STAKE_PROGRAM,               isSigner: false,              isWritable: false },
      { pubkey: SYSVAR_RENT,                 isSigner: false,              isWritable: false },
      { pubkey: SYSVAR_STAKE_HISTORY,        isSigner: false,              isWritable: false },
      { pubkey: STAKE_CONFIG,                isSigner: false,              isWritable: false },
      { pubkey: transientPubkey,             isSigner: !!transientKeypair, isWritable: true  },
      { pubkey: BONDS_PROGRAM_ID,            isSigner: false,              isWritable: false },
    ],
    data: Buffer.from(encodeDepositData(BigInt(amountLamports))),
  });

  return { ix, transientKeypair };
}

export interface ExecuteStakeDepositParams {
  connection: Connection;
  wallet: WalletContextState;
  bondPubkey: string;
  principalTokenMint: string;
  yieldTokenMint: string;
  validatorVoteAccount: string;
  amountSol: number;
}

export interface ExecuteStakeDepositResult {
  signature: string;
}

export interface ExecuteStakeAccountDepositParams {
  connection: Connection;
  wallet: WalletContextState;
  bondPubkey: string;
  principalTokenMint: string;
  yieldTokenMint: string;
  validatorVoteAccount: string;
  stakeAccountPubkey: string;
  amountSol: number;
  stakeBalanceSol: number;
}

export async function executeStakeAccountDeposit({
  connection,
  wallet,
  bondPubkey,
  principalTokenMint,
  yieldTokenMint,
  validatorVoteAccount,
  stakeAccountPubkey,
  amountSol,
  stakeBalanceSol,
}: ExecuteStakeAccountDepositParams): Promise<ExecuteStakeDepositResult> {
  if (!wallet.publicKey || !wallet.sendTransaction) {
    throw new Error("Wallet not connected");
  }

  const owner = wallet.publicKey;
  const bond = new PublicKey(bondPubkey);
  const ptMint = new PublicKey(principalTokenMint);
  const ytMint = new PublicKey(yieldTokenMint);
  const voteAccount = new PublicKey(validatorVoteAccount);
  const userStake = new PublicKey(stakeAccountPubkey);

  const globalSettingsPda = deriveGlobalSettings();
  const stakeAccountPda = deriveStakeAccount(bond);

  const [protocolFeeWallet, transientStakeAccount, rentExemptReserve, latestBlockhash, minDelegationLamports] =
    await Promise.all([
      fetchProtocolFeeWallet(connection, globalSettingsPda),
      fetchTransientStakeAccount(connection, bond),
      getStakeRentExemptLamports(connection),
      connection.getLatestBlockhash("confirmed"),
      getStakeMinimumDelegationLamports(connection),
    ]);

  // allowOwnerOffCurve: true for PDA-backed wallets (Squads vaults, etc.)
  const ownerPt = getAssociatedTokenAddressSync(ptMint, owner, true);
  const ownerYt = getAssociatedTokenAddressSync(ytMint, owner, true);
  const feeWalletPt = getAssociatedTokenAddressSync(ptMint, protocolFeeWallet, true);
  const feeWalletYt = getAssociatedTokenAddressSync(ytMint, protocolFeeWallet, true);

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

  const tx = new Transaction();
  tx.recentBlockhash = latestBlockhash.blockhash;
  tx.feePayer = owner;

  tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 }));
  tx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1_000 }));

  let depositStakeAccount: PublicKey;
  let splitKeypair: Keypair | null = null;

  if (isPartial) {
    splitKeypair = Keypair.generate();
    tx.add(
      StakeProgram.split(
        {
          stakePubkey: userStake,
          authorizedPubkey: owner,
          splitStakePubkey: splitKeypair.publicKey,
          lamports: amountLamports,
        },
        rentExemptReserve,
      ),
    );
    depositStakeAccount = splitKeypair.publicKey;
  } else {
    depositStakeAccount = userStake;
  }

  tx.add(
    createAssociatedTokenAccountIdempotentInstruction(owner, ownerPt, owner, ptMint),
  );
  tx.add(
    createAssociatedTokenAccountIdempotentInstruction(owner, ownerYt, owner, ytMint),
  );
  tx.add(
    createAssociatedTokenAccountIdempotentInstruction(owner, feeWalletPt, protocolFeeWallet, ptMint),
  );
  tx.add(
    createAssociatedTokenAccountIdempotentInstruction(owner, feeWalletYt, protocolFeeWallet, ytMint),
  );

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

  const depositIx = new TransactionInstruction({
    programId: BONDS_PROGRAM_ID,
    keys: [
      { pubkey: owner, isSigner: true, isWritable: true },
      { pubkey: depositStakeAccount, isSigner: false, isWritable: true },
      { pubkey: ownerPt, isSigner: false, isWritable: true },
      { pubkey: ownerYt, isSigner: false, isWritable: true },
      { pubkey: bond, isSigner: false, isWritable: true },
      { pubkey: voteAccount, isSigner: false, isWritable: false },
      { pubkey: stakeAccountPda, isSigner: false, isWritable: true },
      { pubkey: ptMint, isSigner: false, isWritable: true },
      { pubkey: ytMint, isSigner: false, isWritable: true },
      { pubkey: globalSettingsPda, isSigner: false, isWritable: false },
      // Writable: the program withdraws post-merge excess rent to this wallet
      // (audit round-2 — `protocol_fee_wallet` is `#[account(mut)]`).
      { pubkey: protocolFeeWallet, isSigner: false, isWritable: true },
      { pubkey: feeWalletPt, isSigner: false, isWritable: true },
      { pubkey: feeWalletYt, isSigner: false, isWritable: true },
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: PublicKey.default, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_CLOCK, isSigner: false, isWritable: false },
      { pubkey: STAKE_PROGRAM, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_STAKE_HISTORY, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT, isSigner: false, isWritable: false },
      { pubkey: STAKE_CONFIG, isSigner: false, isWritable: false },
      ...remainingAccounts,
    ],
    data: Buffer.from(DEPOSIT_STAKE_DISCRIMINATOR),
  });
  tx.add(depositIx);

  const signers = splitKeypair ? [splitKeypair] : [];
  const signature = await wallet.sendTransaction(tx, connection, { signers });
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

export async function executeStakeDeposit({
  connection,
  wallet,
  bondPubkey,
  principalTokenMint,
  yieldTokenMint,
  validatorVoteAccount,
  amountSol,
}: ExecuteStakeDepositParams): Promise<ExecuteStakeDepositResult> {
  if (!wallet.publicKey || !wallet.sendTransaction) {
    throw new Error("Wallet not connected");
  }

  const owner = wallet.publicKey;
  const bond = new PublicKey(bondPubkey);
  const ptMint = new PublicKey(principalTokenMint);
  const ytMint = new PublicKey(yieldTokenMint);
  const voteAccount = new PublicKey(validatorVoteAccount);

  const globalSettingsPda = deriveGlobalSettings();

  const [protocolFeeWallet, latestBlockhash, minDelegationLamports] = await Promise.all([
    fetchProtocolFeeWallet(connection, globalSettingsPda),
    connection.getLatestBlockhash("confirmed"),
    getStakeMinimumDelegationLamports(connection),
  ]);

  // allowOwnerOffCurve: true for PDA-backed wallets (Squads vaults, etc.)
  const ownerPt = getAssociatedTokenAddressSync(ptMint, owner, true);
  const ownerYt = getAssociatedTokenAddressSync(ytMint, owner, true);
  const feeWalletPt = getAssociatedTokenAddressSync(ptMint, protocolFeeWallet, true);
  const feeWalletYt = getAssociatedTokenAddressSync(ytMint, protocolFeeWallet, true);

  const amountLamportsNum = solToLamports(amountSol);
  const validation = validateSolDepositAmount({
    amountLamports: amountLamportsNum,
    minDelegationLamports,
  });
  if (!validation.ok) throw new DepositValidationError(validation.code, validation.message);

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

  const tx = new Transaction();
  tx.recentBlockhash = latestBlockhash.blockhash;
  tx.feePayer = owner;

  tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 285_000 }));
  tx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1_000 }));

  tx.add(
    createAssociatedTokenAccountIdempotentInstruction(owner, ownerPt, owner, ptMint),
  );
  tx.add(
    createAssociatedTokenAccountIdempotentInstruction(owner, ownerYt, owner, ytMint),
  );
  tx.add(
    createAssociatedTokenAccountIdempotentInstruction(owner, feeWalletPt, protocolFeeWallet, ptMint),
  );
  tx.add(
    createAssociatedTokenAccountIdempotentInstruction(owner, feeWalletYt, protocolFeeWallet, ytMint),
  );

  tx.add(depositIx);

  const signers = transientKeypair ? [transientKeypair] : [];
  const signature = await wallet.sendTransaction(tx, connection, { signers });
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
