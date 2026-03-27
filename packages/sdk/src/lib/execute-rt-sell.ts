import "./manifest-parser"; // BigInt Buffer polyfills
import { ManifestClient } from "@cks-systems/manifest-sdk";
import {
  Connection,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import {
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createCloseAccountInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import type { WalletContextState } from "@solana/wallet-adapter-react";

export interface ExecuteRtSellParams {
  connection: Connection;
  wallet: WalletContextState;
  marketPubkey: string;
  rtMint: string;
  orderSizeTokens: number;
  minReceiveTokens: number;
}

export interface ExecuteRtSellResult {
  signature: string;
}

/**
 * Sell RT tokens on a Manifest order book for SOL.
 *
 * Flow: RT (base) → swap → wSOL (quote) → unwrap to native SOL.
 */
export async function executeRtSell({
  connection,
  wallet,
  marketPubkey,
  rtMint,
  orderSizeTokens,
  minReceiveTokens,
}: ExecuteRtSellParams): Promise<ExecuteRtSellResult> {
  if (!wallet.publicKey || !wallet.sendTransaction) {
    throw new Error("Wallet not connected");
  }

  const payer = wallet.publicKey;
  const marketPk = new PublicKey(marketPubkey);
  const rtMintPk = new PublicKey(rtMint);

  const client = await ManifestClient.getClientReadOnly(connection, marketPk);

  const baseDecimals = client.market.baseDecimals();
  const quoteDecimals = client.market.quoteDecimals();

  const inAtoms = BigInt(Math.round(orderSizeTokens * 10 ** baseDecimals));
  const outAtoms = BigInt(Math.round(minReceiveTokens * 10 ** quoteDecimals));

  const rtAta = getAssociatedTokenAddressSync(rtMintPk, payer, false, TOKEN_PROGRAM_ID);
  const wsolAta = getAssociatedTokenAddressSync(NATIVE_MINT, payer, false, TOKEN_PROGRAM_ID);

  const tx = new Transaction();

  // Ensure RT ATA exists (should already exist after deposit)
  tx.add(
    createAssociatedTokenAccountIdempotentInstruction(
      payer, rtAta, payer, rtMintPk,
    ),
  );
  // Create wSOL ATA to receive swap proceeds
  tx.add(
    createAssociatedTokenAccountIdempotentInstruction(
      payer, wsolAta, payer, NATIVE_MINT,
    ),
  );

  // Sell RT (base) for wSOL (quote)
  tx.add(
    client.swapIx(payer, {
      inAtoms,
      outAtoms,
      isBaseIn: true,
      isExactIn: true,
    }),
  );

  // Unwrap wSOL → native SOL
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
