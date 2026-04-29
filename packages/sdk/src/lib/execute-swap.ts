import "./manifest-parser"; // BigInt Buffer polyfills
import { ManifestClient } from "@cks-systems/manifest-sdk";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createCloseAccountInstruction,
  createSyncNativeInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import type { WalletContextState } from "@solana/wallet-adapter-react";

export interface ExecuteSwapParams {
  connection: Connection;
  wallet: WalletContextState;
  marketPubkey: string;
  orderSizeTokens: number;
  maxPayTokens: number;
  slippageBps: number;
}

export interface ExecuteSwapResult {
  signature: string;
}

export async function executeSwap({
  connection,
  wallet,
  marketPubkey,
  orderSizeTokens,
  maxPayTokens,
  slippageBps,
}: ExecuteSwapParams): Promise<ExecuteSwapResult> {
  if (!wallet.publicKey || !wallet.sendTransaction) {
    throw new Error("Wallet not connected");
  }

  const payer = wallet.publicKey;
  const marketPk = new PublicKey(marketPubkey);

  const client = await ManifestClient.getClientReadOnly(connection, marketPk);

  const baseDecimals = client.market.baseDecimals();
  const quoteDecimals = client.market.quoteDecimals();
  const baseMint = client.market.baseMint();

  const outAtoms = BigInt(Math.round(orderSizeTokens * 10 ** baseDecimals));
  const inAtoms = BigInt(
    Math.round(maxPayTokens * (1 + slippageBps / 10_000) * 10 ** quoteDecimals),
  );

  // allowOwnerOffCurve: true for PDA-backed wallets (Squads vaults, etc.)
  const baseAta = getAssociatedTokenAddressSync(baseMint, payer, true, TOKEN_PROGRAM_ID);
  const wsolAta = getAssociatedTokenAddressSync(NATIVE_MINT, payer, true, TOKEN_PROGRAM_ID);

  const tx = new Transaction();

  tx.add(
    createAssociatedTokenAccountIdempotentInstruction(
      payer, baseAta, payer, baseMint,
    ),
  );
  tx.add(
    createAssociatedTokenAccountIdempotentInstruction(
      payer, wsolAta, payer, NATIVE_MINT,
    ),
  );
  tx.add(
    SystemProgram.transfer({
      fromPubkey: payer,
      toPubkey: wsolAta,
      lamports: inAtoms,
    }),
  );
  tx.add(createSyncNativeInstruction(wsolAta));
  tx.add(
    client.swapIx(payer, {
      inAtoms,
      outAtoms,
      isBaseIn: false,
      isExactIn: false,
    }),
  );
  tx.add(createCloseAccountInstruction(wsolAta, payer, payer));

  const latestBlockhash = await connection.getLatestBlockhash("confirmed");
  tx.recentBlockhash = latestBlockhash.blockhash;
  tx.feePayer = payer;

  const signature = await wallet.sendTransaction(tx, connection);
  const confirmation = await connection.confirmTransaction(
    { signature, ...latestBlockhash },
    "confirmed",
  );

  if (confirmation.value.err) {
    throw new Error(
      `Transaction failed on-chain: ${JSON.stringify(confirmation.value.err)}`,
    );
  }

  return { signature };
}
