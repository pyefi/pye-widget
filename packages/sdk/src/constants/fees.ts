import { PublicKey } from "@solana/web3.js";

/**
 * Pye protocol taker fee charged on RT sales, expressed in basis points.
 * 50 bps = 0.50%. Applied to the SOL out of the Manifest swap.
 */
export const PYE_TRADING_FEE_BPS = 50;

/**
 * Destination for taker-fee proceeds. Fees are transferred as wSOL to the
 * treasury's wSOL ATA; the treasury unwraps out-of-band.
 */
export const PYE_TREASURY_WALLET = new PublicKey(
  "D3LKi2CUFmudj4fT8izGeBky84oYPZY7UWwvcLUhh2ch",
);

/** Gross SOL out × feeBps/10_000, rounded to integer lamports. */
export function calculateFeeLamports(expectedSolOut: number): bigint {
  return BigInt(
    Math.round((expectedSolOut * 1e9 * PYE_TRADING_FEE_BPS) / 10_000),
  );
}

/** Apply fee deduction to a gross SOL quote to get the user-facing net. */
export function applyTradingFee(grossSolOut: number): number {
  return grossSolOut * (1 - PYE_TRADING_FEE_BPS / 10_000);
}
