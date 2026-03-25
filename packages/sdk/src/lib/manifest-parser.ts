import { Market } from "@cks-systems/manifest-sdk";
import { PublicKey } from "@solana/web3.js";

/* ── BigInt Buffer polyfills for browser environments ──────────────────────
 * The browser Buffer polyfill (feross/buffer) lacks BigInt read methods
 * that the Manifest SDK uses internally. Add them so client-side Realtime
 * parsing works identically to server-side.
 * ────────────────────────────────────────────────────────────────────────── */
if (typeof Buffer !== "undefined") {
  if (!Buffer.prototype.readBigUInt64LE) {
    Buffer.prototype.readBigUInt64LE = function (offset = 0) {
      const lo = BigInt(this.readUInt32LE(offset));
      const hi = BigInt(this.readUInt32LE(offset + 4));
      return lo + (hi << BigInt(32));
    };
  }
  if (!Buffer.prototype.readBigInt64LE) {
    Buffer.prototype.readBigInt64LE = function (offset = 0) {
      const lo = BigInt(this.readUInt32LE(offset));
      const hi = BigInt(this.readInt32LE(offset + 4));
      return lo + (hi << BigInt(32));
    };
  }
}

export interface IndividualOrder {
  sequenceNumber: string;
  size: number;
  price: number;
  /** The Manifest market pubkey this order belongs to (set during market merge) */
  marketPubkey?: string;
}

export interface OrderBookSummary {
  totalAskSize: number;
  bestAskPrice: number | null;
  totalBidSize: number;
  bestBidPrice: number | null;
  askCount: number;
  bidCount: number;
  asks: IndividualOrder[];
  bids: IndividualOrder[];
}

/**
 * Parse a Manifest market's raw account_data (hex) into an order book summary.
 */
export function parseOrderBook(
  marketPubkey: string,
  hexData: string,
): OrderBookSummary {
  const hex = hexData.startsWith("0x") ? hexData.slice(2) : hexData;
  const buffer = Buffer.from(hex, "hex");
  const market = Market.loadFromBuffer({
    address: new PublicKey(marketPubkey),
    buffer,
  });

  const asks = market.asks();
  const bids = market.bids();

  const totalAskSize = asks.reduce(
    (sum, o) => sum + Number(o.numBaseTokens.toString()),
    0,
  );
  const totalBidSize = bids.reduce(
    (sum, o) => sum + Number(o.numBaseTokens.toString()),
    0,
  );

  const individualAsks: IndividualOrder[] = asks.map((o) => ({
    sequenceNumber: o.sequenceNumber.toString(),
    size: Number(o.numBaseTokens.toString()),
    price: o.tokenPrice,
  }));
  const individualBids: IndividualOrder[] = bids.map((o) => ({
    sequenceNumber: o.sequenceNumber.toString(),
    size: Number(o.numBaseTokens.toString()),
    price: o.tokenPrice,
  }));

  return {
    totalAskSize,
    bestAskPrice: market.bestAskPrice() ?? null,
    totalBidSize,
    bestBidPrice: market.bestBidPrice() ?? null,
    askCount: asks.length,
    bidCount: bids.length,
    asks: individualAsks,
    bids: individualBids,
  };
}
