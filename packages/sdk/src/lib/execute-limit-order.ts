import "./manifest-parser"; // BigInt Buffer polyfills
import { ManifestClient, OrderType } from "@cks-systems/manifest-sdk";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import type { WalletContextState } from "@solana/wallet-adapter-react";

export interface ExecuteLimitOrderParams {
  connection: Connection;
  wallet: WalletContextState;
  marketPubkey: string;
  orderSizeTokens: number;
  limitPrice: number;
}

export interface ExecuteLimitOrderResult {
  signature: string;
  setupSignature?: string;
}

export async function executeLimitOrder({
  connection,
  wallet,
  marketPubkey,
  orderSizeTokens,
  limitPrice,
}: ExecuteLimitOrderParams): Promise<ExecuteLimitOrderResult> {
  if (!wallet.publicKey || !wallet.sendTransaction) {
    throw new Error("Wallet not connected");
  }

  const payer = wallet.publicKey;
  const marketPk = new PublicKey(marketPubkey);
  let setupSignature: string | undefined;

  const setupData = await ManifestClient.getSetupIxs(
    connection,
    marketPk,
    payer,
  );

  if (setupData.setupNeeded) {
    const setupTx = new Transaction();
    for (const ix of setupData.instructions) {
      setupTx.add(ix);
    }

    const signers = setupData.wrapperKeypair
      ? [setupData.wrapperKeypair]
      : [];

    const setupBlockhash = await connection.getLatestBlockhash("confirmed");
    setupTx.recentBlockhash = setupBlockhash.blockhash;
    setupTx.feePayer = payer;

    setupSignature = await wallet.sendTransaction(setupTx, connection, {
      signers,
    });
    const setupConfirmation = await connection.confirmTransaction(
      { signature: setupSignature, ...setupBlockhash },
      "confirmed",
    );
    if (setupConfirmation.value.err) {
      throw new Error(
        `Setup transaction failed on-chain: ${JSON.stringify(setupConfirmation.value.err)}`,
      );
    }
  }

  const client = await ManifestClient.getClientForMarketNoPrivateKey(
    connection,
    marketPk,
    payer,
  );

  const orderIxs = await client.placeOrderWithRequiredDepositIxs(payer, {
    numBaseTokens: orderSizeTokens,
    tokenPrice: limitPrice,
    isBid: false,
    lastValidSlot: 4_000_000_000,
    orderType: OrderType.Limit,
    clientOrderId: BigInt(Date.now()),
  });

  const latestBlockhash = await connection.getLatestBlockhash("confirmed");
  const tx = new Transaction();
  tx.recentBlockhash = latestBlockhash.blockhash;
  tx.feePayer = payer;
  for (const ix of orderIxs) tx.add(ix);
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

  return { signature, setupSignature };
}
