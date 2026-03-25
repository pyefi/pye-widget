import type { IndividualOrder } from "./manifest-parser";
import { ALLOWED_VALIDATORS, type ValidatorId } from "../constants/validators";
import {
  maturities,
  maturityIdsArray,
  type MaturityId,
} from "../constants/maturities";
import { getPyeConfig } from "../config";

export interface ManifestMarketRecord {
  marketPubkey: string;
  bondPubkey: string;
  voteAccount: string;
  tokenType: "PT" | "RT";
  maturityTs: number;
  totalAskSize: number;
  bestAskPrice: number | null;
  totalBidSize: number;
  bestBidPrice: number | null;
  askCount: number;
  bidCount: number;
  asks: IndividualOrder[];
  bids: IndividualOrder[];
}

export interface MatchedMarket {
  marketPubkey: string;
  bondPubkey: string;
  validatorId: ValidatorId;
  maturityId: MaturityId;
  tokenType: "PT" | "RT";
  totalAskSize: number;
  bestAskPrice: number | null;
  totalBidSize: number;
  bestBidPrice: number | null;
  askCount: number;
  bidCount: number;
  asks: IndividualOrder[];
  bids: IndividualOrder[];
}

// Tolerance for matching maturity timestamps (24 hours in seconds)
const MATURITY_TOLERANCE = 86_400;

// Reverse lookup: vote_account → ValidatorId (only allowed validators)
const voteAccountToValidatorId = new Map<string, ValidatorId>();
for (const v of ALLOWED_VALIDATORS) {
  voteAccountToValidatorId.set(v.vote_account, v.id);
}

function matchMaturity(maturityTs: number): MaturityId | null {
  for (const id of maturityIdsArray) {
    const m = maturities[id];
    const mTs = Number(m.maturity_timestamp);
    if (Math.abs(maturityTs - mTs) <= MATURITY_TOLERANCE) {
      return id;
    }
  }
  return null;
}

export async function fetchManifestMarkets(): Promise<MatchedMarket[]> {
  const config = getPyeConfig();
  const res = await fetch(`${config.apiBaseUrl}/api/markets`);
  if (!res.ok) throw new Error(`Failed to fetch markets: ${res.status}`);
  const records: ManifestMarketRecord[] = await res.json();

  const matched: MatchedMarket[] = [];
  for (const record of records) {
    const validatorId = voteAccountToValidatorId.get(record.voteAccount);
    if (!validatorId) continue;

    const maturityId = matchMaturity(record.maturityTs);
    if (!maturityId) continue;

    matched.push({
      marketPubkey: record.marketPubkey,
      bondPubkey: record.bondPubkey,
      validatorId,
      maturityId,
      tokenType: record.tokenType,
      totalAskSize: record.totalAskSize,
      bestAskPrice: record.bestAskPrice,
      totalBidSize: record.totalBidSize,
      bestBidPrice: record.bestBidPrice,
      askCount: record.askCount,
      bidCount: record.bidCount,
      asks: record.asks,
      bids: record.bids,
    });
  }

  return matched;
}

/** Build a lookup keyed by "validatorId-maturityId-PT/RT".
 *  One market per key — first match wins (no merging across markets). */
export function buildMarketLookup(
  markets: MatchedMarket[],
): Record<string, MatchedMarket> {
  const lookup: Record<string, MatchedMarket> = {};
  for (const m of markets) {
    const key = `${m.validatorId}-${m.maturityId}-${m.tokenType}`;
    if (!lookup[key]) {
      lookup[key] = { ...m };
    }
  }
  return lookup;
}
