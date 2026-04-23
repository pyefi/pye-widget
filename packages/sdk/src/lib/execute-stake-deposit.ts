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

const BONDS_PROGRAM_ID = new PublicKey(
  "PYEQZ2qYHPQapnw8Ms8MSPMNzoq59NHHfNwAtuV26wx",
);

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

  const [protocolFeeWallet, transientStakeAccount, rentExemptReserve, latestBlockhash] =
    await Promise.all([
      fetchProtocolFeeWallet(connection, globalSettingsPda),
      fetchTransientStakeAccount(connection, bond),
      connection.getMinimumBalanceForRentExemption(StakeProgram.space),
      connection.getLatestBlockhash("confirmed"),
    ]);

  // allowOwnerOffCurve: true for PDA-backed wallets (Squads vaults, etc.)
  const ownerPt = getAssociatedTokenAddressSync(ptMint, owner, true);
  const ownerYt = getAssociatedTokenAddressSync(ytMint, owner, true);
  const feeWalletPt = getAssociatedTokenAddressSync(ptMint, protocolFeeWallet, true);
  const feeWalletYt = getAssociatedTokenAddressSync(ytMint, protocolFeeWallet, true);

  const amountLamports = Math.round(amountSol * 1e9);
  const totalLamports = Math.round(stakeBalanceSol * 1e9);
  const isPartial = amountLamports < totalLamports;

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

  const isTransientSet = !transientStakeAccount.equals(PublicKey.default);
  const remainingAccounts = isTransientSet
    ? [{ pubkey: transientStakeAccount, isSigner: false, isWritable: true }]
    : [];

  const depositIx = new TransactionInstruction({
    programId: BONDS_PROGRAM_ID,
    keys: [
      { pubkey: owner, isSigner: true, isWritable: true },
      { pubkey: depositStakeAccount, isSigner: false, isWritable: true },
      { pubkey: ownerPt, isSigner: false, isWritable: true },
      { pubkey: ownerYt, isSigner: false, isWritable: true },
      { pubkey: bond, isSigner: false, isWritable: false },
      { pubkey: voteAccount, isSigner: false, isWritable: false },
      { pubkey: stakeAccountPda, isSigner: false, isWritable: true },
      { pubkey: ptMint, isSigner: false, isWritable: true },
      { pubkey: ytMint, isSigner: false, isWritable: true },
      { pubkey: globalSettingsPda, isSigner: false, isWritable: false },
      { pubkey: protocolFeeWallet, isSigner: false, isWritable: false },
      { pubkey: feeWalletPt, isSigner: false, isWritable: true },
      { pubkey: feeWalletYt, isSigner: false, isWritable: true },
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: PublicKey.default, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_CLOCK, isSigner: false, isWritable: false },
      { pubkey: STAKE_PROGRAM, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_STAKE_HISTORY, isSigner: false, isWritable: false },
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
  const stakeAccountPda = deriveStakeAccount(bond);

  const [protocolFeeWallet, transientStakeAccount, latestBlockhash] = await Promise.all([
    fetchProtocolFeeWallet(connection, globalSettingsPda),
    fetchTransientStakeAccount(connection, bond),
    connection.getLatestBlockhash("confirmed"),
  ]);

  // allowOwnerOffCurve: true for PDA-backed wallets (Squads vaults, etc.)
  const ownerPt = getAssociatedTokenAddressSync(ptMint, owner, true);
  const ownerYt = getAssociatedTokenAddressSync(ytMint, owner, true);
  const feeWalletPt = getAssociatedTokenAddressSync(ptMint, protocolFeeWallet, true);
  const feeWalletYt = getAssociatedTokenAddressSync(ytMint, protocolFeeWallet, true);

  const amountLamports = BigInt(Math.round(amountSol * 1e9));

  const isTransientUninitialized = transientStakeAccount.equals(PublicKey.default);
  const transientKeypair = isTransientUninitialized ? Keypair.generate() : null;
  const transientPubkey = transientKeypair?.publicKey ?? transientStakeAccount;

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

  const depositIx = new TransactionInstruction({
    programId: BONDS_PROGRAM_ID,
    keys: [
      { pubkey: owner, isSigner: true, isWritable: true },
      { pubkey: ownerPt, isSigner: false, isWritable: true },
      { pubkey: ownerYt, isSigner: false, isWritable: true },
      { pubkey: bond, isSigner: false, isWritable: true },
      { pubkey: voteAccount, isSigner: false, isWritable: false },
      { pubkey: stakeAccountPda, isSigner: false, isWritable: true },
      { pubkey: ptMint, isSigner: false, isWritable: true },
      { pubkey: ytMint, isSigner: false, isWritable: true },
      { pubkey: globalSettingsPda, isSigner: false, isWritable: false },
      { pubkey: protocolFeeWallet, isSigner: false, isWritable: true },
      { pubkey: feeWalletPt, isSigner: false, isWritable: true },
      { pubkey: feeWalletYt, isSigner: false, isWritable: true },
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: PublicKey.default, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_CLOCK, isSigner: false, isWritable: false },
      { pubkey: STAKE_PROGRAM, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_STAKE_HISTORY, isSigner: false, isWritable: false },
      { pubkey: STAKE_CONFIG, isSigner: false, isWritable: false },
      { pubkey: transientPubkey, isSigner: !!transientKeypair, isWritable: true },
      { pubkey: BONDS_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: Buffer.from(encodeDepositData(amountLamports)),
  });
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
