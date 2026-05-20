import { createClient } from "@supabase/supabase-js";
import { parseOrderBook, type IndividualOrder } from "./manifest-parser";
import type { CanonicalMaturity } from "../stores/lockup-store";
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
  voteAccount: string;
  canonicalLabel: CanonicalMaturity;
  tokenType: "PT" | "RT";
  /** Mint address for this market's base token (PT or RT). */
  mint: string;
  totalAskSize: number;
  bestAskPrice: number | null;
  totalBidSize: number;
  bestBidPrice: number | null;
  askCount: number;
  bidCount: number;
  asks: IndividualOrder[];
  bids: IndividualOrder[];
}

export async function fetchManifestMarkets(): Promise<MatchedMarket[]> {
  const config = getPyeConfig();
  const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);

  const [marketsRes, bondsRes, validatorsRes] = await Promise.all([
    supabase
      .from("manifest_markets")
      .select("pubkey, base_mint, account_data"),
    supabase
      .from("solo_validator_bonds")
      .select(
        "pubkey, validator_vote_account, principal_token_mint, yield_token_mint, canonical_label",
      )
      .not("canonical_label", "is", null)
      .eq("is_hidden", false),
    supabase
      .from("validator_metadata_configs")
      .select("vote_pubkey")
      .eq("widget", true),
  ]);

  if (marketsRes.error) throw marketsRes.error;
  if (bondsRes.error) throw bondsRes.error;
  if (validatorsRes.error) throw validatorsRes.error;
  if (!marketsRes.data?.length || !bondsRes.data?.length) return [];

  const allowedVoteAccounts = new Set(
    (validatorsRes.data ?? []).map((r) => r.vote_pubkey),
  );

  const ptMintToBond = new Map<string, (typeof bondsRes.data)[number]>();
  const rtMintToBond = new Map<string, (typeof bondsRes.data)[number]>();
  for (const bond of bondsRes.data) {
    ptMintToBond.set(bond.principal_token_mint, bond);
    rtMintToBond.set(bond.yield_token_mint, bond);
  }

  const matched: MatchedMarket[] = [];
  for (const market of marketsRes.data) {
    const ptBond = ptMintToBond.get(market.base_mint);
    const rtBond = rtMintToBond.get(market.base_mint);
    const bond = ptBond ?? rtBond;
    if (!bond) continue;
    if (!allowedVoteAccounts.has(bond.validator_vote_account)) continue;

    const tokenType: "PT" | "RT" = ptBond ? "PT" : "RT";
    const mint = tokenType === "PT" ? bond.principal_token_mint : bond.yield_token_mint;

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
      voteAccount: bond.validator_vote_account,
      canonicalLabel: bond.canonical_label as CanonicalMaturity,
      tokenType,
      mint,
      ...orderBook,
    });
  }

  return matched;
}

/**
 * Build a lookup keyed by "${voteAccount}-${canonicalLabel}-${PT|RT}".
 * One market per key — first match wins (no merging across markets).
 */
export function buildMarketLookup(
  markets: MatchedMarket[],
): Record<string, MatchedMarket> {
  const lookup: Record<string, MatchedMarket> = {};
  for (const m of markets) {
    const key = `${m.voteAccount}-${m.canonicalLabel}-${m.tokenType}`;
    if (!lookup[key]) {
      lookup[key] = { ...m };
    }
  }
  return lookup;
}
