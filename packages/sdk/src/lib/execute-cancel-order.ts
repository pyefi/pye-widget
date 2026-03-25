import "./manifest-parser"; // BigInt Buffer polyfills
import {
  Market,
  createBatchUpdateInstruction,
  getVaultAddress,
  getGlobalAddress,
  getGlobalVaultAddress,
} from "@cks-systems/manifest-sdk";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import type { WalletContextState } from "@solana/wallet-adapter-react";

export interface ExecuteCancelOrderParams {
  connection: Connection;
  wallet: WalletContextState;
  marketPubkey: string;
  sequenceNumber: string;
}

export interface ExecuteCancelOrderResult {
  signature: string;
}

export async function executeCancelOrder({
  connection,
  wallet,
  marketPubkey,
  sequenceNumber,
}: ExecuteCancelOrderParams): Promise<ExecuteCancelOrderResult> {
  if (!wallet.publicKey || !wallet.sendTransaction) {
    throw new Error("Wallet not connected");
  }

  const payer = wallet.publicKey;
  const marketPk = new PublicKey(marketPubkey);

  const market = await Market.loadFromAddress({ connection, address: marketPk });
  const baseMint = market.baseMint();
  const quoteMint = market.quoteMint();

  const cancelIx = createBatchUpdateInstruction(
    {
      payer,
      market: marketPk,
      baseMint,
      baseGlobal: getGlobalAddress(baseMint),
      baseGlobalVault: getGlobalVaultAddress(baseMint),
      baseMarketVault: getVaultAddress(marketPk, baseMint),
      baseTokenProgram: TOKEN_PROGRAM_ID,
      quoteMint,
      quoteGlobal: getGlobalAddress(quoteMint),
      quoteGlobalVault: getGlobalVaultAddress(quoteMint),
      quoteMarketVault: getVaultAddress(marketPk, quoteMint),
      quoteTokenProgram: TOKEN_PROGRAM_ID,
    },
    {
      params: {
        cancels: [
          {
            orderSequenceNumber: BigInt(sequenceNumber),
            orderIndexHint: null,
          },
        ],
        orders: [],
        traderIndexHint: null,
      },
    },
  );

  const latestBlockhash = await connection.getLatestBlockhash("confirmed");
  const tx = new Transaction();
  tx.recentBlockhash = latestBlockhash.blockhash;
  tx.feePayer = payer;
  tx.add(cancelIx);
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
