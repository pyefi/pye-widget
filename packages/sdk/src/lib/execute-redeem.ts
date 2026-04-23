import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import type { WalletContextState } from "@solana/wallet-adapter-react";

const BONDS_PROGRAM_ID = new PublicKey(
  "PYEQZ2qYHPQapnw8Ms8MSPMNzoq59NHHfNwAtuV26wx",
);

const HANDLE_MATURITY_DISC = new Uint8Array([127, 154, 109, 164, 119, 21, 34, 149]);
const REDEEM_PT_STAKE_DISC = new Uint8Array([131, 241, 170, 225, 20, 53, 106, 95]);
const REDEEM_YT_STAKE_DISC = new Uint8Array([143, 45, 75, 247, 229, 60, 80, 179]);

const SYSVAR_CLOCK = new PublicKey("SysvarC1ock11111111111111111111111111111111");
const STAKE_PROGRAM = new PublicKey("Stake11111111111111111111111111111111111111");
const SYSVAR_RENT = new PublicKey("SysvarRent111111111111111111111111111111111");
const SYSVAR_STAKE_HISTORY = new PublicKey("SysvarStakeHistory1111111111111111111111111");

export interface ExecuteRedeemParams {
  connection: Connection;
  wallet: WalletContextState;
  bondPubkey: string;
  principalTokenMint: string;
  yieldTokenMint: string;
  ptAmountLamports: number;
  rtAmountLamports: number;
}

export interface ExecuteRedeemResult {
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

interface BondData {
  transientStakeAccount: PublicKey;
  maturityHandled: boolean;
}

async function fetchBondData(
  connection: Connection,
  bond: PublicKey,
): Promise<BondData> {
  const info = await connection.getAccountInfo(bond);
  if (!info?.data) throw new Error("Bond account not found");
  return {
    transientStakeAccount: new PublicKey(info.data.subarray(72, 104)),
    maturityHandled: info.data[185] === 1,
  };
}

function encodeAmount(disc: Uint8Array, amount: bigint): Buffer {
  const ab = new ArrayBuffer(16);
  const view = new DataView(ab);
  for (let i = 0; i < 8; i++) view.setUint8(i, disc[i]);
  view.setBigUint64(8, amount, true);
  return Buffer.from(ab);
}

export async function executeRedeem({
  connection,
  wallet,
  bondPubkey,
  principalTokenMint,
  yieldTokenMint,
  ptAmountLamports,
  rtAmountLamports,
}: ExecuteRedeemParams): Promise<ExecuteRedeemResult> {
  if (!wallet.publicKey || !wallet.sendTransaction) {
    throw new Error("Wallet not connected");
  }

  const owner = wallet.publicKey;
  const bond = new PublicKey(bondPubkey);
  const ptMint = new PublicKey(principalTokenMint);
  const ytMint = new PublicKey(yieldTokenMint);
  const globalSettingsPda = deriveGlobalSettings();
  const stakeAccountPda = deriveStakeAccount(bond);

  // allowOwnerOffCurve: true for PDA-backed wallets (Squads vaults, etc.)
  const ownerPt = getAssociatedTokenAddressSync(ptMint, owner, true);
  const ownerYt = getAssociatedTokenAddressSync(ytMint, owner, true);

  const [bondData, latestBlockhash] = await Promise.all([
    fetchBondData(connection, bond),
    connection.getLatestBlockhash("confirmed"),
  ]);

  const tx = new Transaction();
  tx.recentBlockhash = latestBlockhash.blockhash;
  tx.feePayer = owner;

  tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 500_000 }));
  tx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1_000 }));

  if (!bondData.maturityHandled) {
    const isTransientSet = !bondData.transientStakeAccount.equals(PublicKey.default);
    tx.add(
      new TransactionInstruction({
        programId: BONDS_PROGRAM_ID,
        keys: [
          { pubkey: bond, isSigner: false, isWritable: true },
          { pubkey: stakeAccountPda, isSigner: false, isWritable: true },
          ...(isTransientSet
            ? [{ pubkey: bondData.transientStakeAccount, isSigner: false, isWritable: true }]
            : []),
          { pubkey: ptMint, isSigner: false, isWritable: false },
          { pubkey: ytMint, isSigner: false, isWritable: false },
          { pubkey: SYSVAR_CLOCK, isSigner: false, isWritable: false },
          { pubkey: STAKE_PROGRAM, isSigner: false, isWritable: false },
          { pubkey: SYSVAR_STAKE_HISTORY, isSigner: false, isWritable: false },
          { pubkey: globalSettingsPda, isSigner: false, isWritable: false },
        ],
        data: Buffer.from(HANDLE_MATURITY_DISC),
      }),
    );
  }

  const signers: Keypair[] = [];

  if (ptAmountLamports > 0) {
    const newStakeKp = Keypair.generate();
    signers.push(newStakeKp);

    tx.add(
      new TransactionInstruction({
        programId: BONDS_PROGRAM_ID,
        keys: [
          { pubkey: owner, isSigner: true, isWritable: true },
          { pubkey: newStakeKp.publicKey, isSigner: true, isWritable: true },
          { pubkey: ownerPt, isSigner: false, isWritable: true },
          { pubkey: bond, isSigner: false, isWritable: true },
          { pubkey: stakeAccountPda, isSigner: false, isWritable: true },
          { pubkey: ptMint, isSigner: false, isWritable: true },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: PublicKey.default, isSigner: false, isWritable: false },
          { pubkey: SYSVAR_CLOCK, isSigner: false, isWritable: false },
          { pubkey: STAKE_PROGRAM, isSigner: false, isWritable: false },
          { pubkey: SYSVAR_RENT, isSigner: false, isWritable: false },
          { pubkey: SYSVAR_STAKE_HISTORY, isSigner: false, isWritable: false },
          { pubkey: globalSettingsPda, isSigner: false, isWritable: false },
        ],
        data: encodeAmount(REDEEM_PT_STAKE_DISC, BigInt(ptAmountLamports)),
      }),
    );
  }

  if (rtAmountLamports > 0) {
    const newStakeKp = Keypair.generate();
    signers.push(newStakeKp);

    tx.add(
      new TransactionInstruction({
        programId: BONDS_PROGRAM_ID,
        keys: [
          { pubkey: owner, isSigner: true, isWritable: false },
          { pubkey: newStakeKp.publicKey, isSigner: true, isWritable: true },
          { pubkey: ownerYt, isSigner: false, isWritable: true },
          { pubkey: bond, isSigner: false, isWritable: true },
          { pubkey: stakeAccountPda, isSigner: false, isWritable: true },
          { pubkey: ytMint, isSigner: false, isWritable: true },
          { pubkey: ptMint, isSigner: false, isWritable: false },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: PublicKey.default, isSigner: false, isWritable: false },
          { pubkey: SYSVAR_CLOCK, isSigner: false, isWritable: false },
          { pubkey: STAKE_PROGRAM, isSigner: false, isWritable: false },
          { pubkey: SYSVAR_RENT, isSigner: false, isWritable: false },
          { pubkey: SYSVAR_STAKE_HISTORY, isSigner: false, isWritable: false },
          { pubkey: globalSettingsPda, isSigner: false, isWritable: false },
        ],
        data: encodeAmount(REDEEM_YT_STAKE_DISC, BigInt(rtAmountLamports)),
      }),
    );
  }

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
