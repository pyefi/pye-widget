import { createClient } from "@supabase/supabase-js";
import { parseOrderBook, type IndividualOrder } from "./manifest-parser";
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
  const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);

  // Fetch markets and bonds in parallel (same logic as the old /api/markets endpoint)
  const allowedVoteAccounts = ALLOWED_VALIDATORS.map((v) => v.vote_account);

  const [marketsRes, bondsRes] = await Promise.all([
    supabase
      .from("manifest_markets")
      .select("pubkey, base_mint, account_data"),
    supabase
      .from("solo_validator_bonds")
      .select(
        "pubkey, validator_vote_account, principal_token_mint, yield_token_mint, maturity_ts",
      )
      .in("validator_vote_account", allowedVoteAccounts),
  ]);

  if (marketsRes.error) throw marketsRes.error;
  if (bondsRes.error) throw bondsRes.error;
  if (!marketsRes.data?.length || !bondsRes.data?.length) return [];

  // Build mint → bond lookup
  const ptMintToBond = new Map<string, (typeof bondsRes.data)[0]>();
  const rtMintToBond = new Map<string, (typeof bondsRes.data)[0]>();
  for (const bond of bondsRes.data) {
    ptMintToBond.set(bond.principal_token_mint, bond);
    rtMintToBond.set(bond.yield_token_mint, bond);
  }

  // Match markets to bonds, parse order books, and filter to known validators/maturities
  const matched: MatchedMarket[] = [];
  for (const market of marketsRes.data) {
    const ptBond = ptMintToBond.get(market.base_mint);
    const rtBond = rtMintToBond.get(market.base_mint);
    const bond = ptBond ?? rtBond;
    if (!bond) continue;

    const validatorId = voteAccountToValidatorId.get(bond.validator_vote_account);
    if (!validatorId) continue;

    const maturityId = matchMaturity(Number(bond.maturity_ts));
    if (!maturityId) continue;

    let orderBook = {
      totalAskSize: 0,
      bestAskPrice: null as number | null,
      totalBidSize: 0,
      bestBidPrice: null as number | null,
      askCount: 0,
      bidCount: 0,
      asks: [] as IndividualOrder[],
      bids: [] as IndividualOrder[],
    };
    if (market.account_data) {
      try {
        orderBook = parseOrderBook(market.pubkey, market.account_data);
      } catch (e) {
        console.error(
          `Failed to parse order book for ${market.pubkey}:`,
          e instanceof Error ? e.message : e,
        );
      }
    }

    matched.push({
      marketPubkey: market.pubkey,
      bondPubkey: bond.pubkey,
      validatorId,
      maturityId,
      tokenType: ptBond ? "PT" : "RT",
      ...orderBook,
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
