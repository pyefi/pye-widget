import { createStore } from "zustand/vanilla";
import { immer } from "zustand/middleware/immer";
import { createClient } from "@supabase/supabase-js";
import type { MatchedMarket } from "../lib/market-service";
import { fetchManifestMarkets, buildMarketLookup } from "../lib/market-service";
import type { OrderBookSummary } from "../lib/manifest-parser";
import { allowedLockups } from "../constants/lockups";
import { getPyeConfig } from "../config";

function getSupabase() {
  const config = getPyeConfig();
  return createClient(config.supabaseUrl, config.supabaseAnonKey);
}

export interface MarketState {
  /** Lookup keyed by "validatorId-maturityId-PT/RT" */
  markets: Record<string, MatchedMarket>;
  /** Reverse map: marketPubkey → store key */
  pubkeyIndex: Record<string, string>;
  /** RT backing per unit, keyed by bond pubkey */
  rtBacking: Record<string, number>;
  loading: boolean;
  lastFetched: number | null;
}

export interface MarketActions {
  fetchMarkets: () => Promise<void>;
  fetchRtBacking: () => Promise<void>;
  getMarket: (
    validatorId: string,
    maturityId: string,
    tokenType: "PT" | "RT",
  ) => MatchedMarket | null;
  updateMarketOrderBook: (
    marketPubkey: string,
    summary: OrderBookSummary,
  ) => void;
}

export type MarketStore = MarketState & MarketActions;

function buildInitialRtBacking(): Record<string, number> {
  const backing: Record<string, number> = {};
  const allowed = allowedLockups();
  for (const mats of Object.values(allowed)) {
    if (!mats) continue;
    for (const bond of Object.values(mats)) {
      if (!bond) continue;
      backing[bond.pubkey] = 0;
    }
  }
  return backing;
}

const initialState: MarketState = {
  markets: {},
  pubkeyIndex: {},
  rtBacking: buildInitialRtBacking(),
  loading: false,
  lastFetched: null,
};

export function createMarketStore() {
  return createStore<MarketStore>()(
    immer((set, get) => ({
      ...initialState,

      async fetchMarkets() {
        set((s) => {
          s.loading = true;
        });

        try {
          const matched = await fetchManifestMarkets();
          const lookup = buildMarketLookup(matched);
          const index: Record<string, string> = {};
          for (const [key, m] of Object.entries(lookup)) {
            index[m.marketPubkey] = key;
          }
          set((s) => {
            s.markets = lookup;
            s.pubkeyIndex = index;
            s.lastFetched = Date.now();
          });
        } finally {
          set((s) => {
            s.loading = false;
          });
        }
      },

      async fetchRtBacking() {
        const supabase = getSupabase();

        const { data: latest, error: latestErr } = await supabase
          .from("rt_backing")
          .select("snapshot_at")
          .order("snapshot_at", { ascending: false })
          .limit(1)
          .single();

        if (latestErr || !latest) {
          console.error("[fetchRtBacking] Failed to get latest snapshot:", latestErr?.message);
          return;
        }

        const latestDate = new Date(latest.snapshot_at);
        latestDate.setMinutes(0, 0, 0);
        const batchStart = latestDate.toISOString();

        const { data, error } = await supabase
          .from("rt_backing")
          .select("lockup_id, backing_per_rt")
          .gte("snapshot_at", batchStart)
          .order("snapshot_at", { ascending: true });

        if (error || !data) {
          console.error("[fetchRtBacking] Supabase error:", error?.message);
          return;
        }

        set((s) => {
          for (const row of data) {
            s.rtBacking[row.lockup_id] = row.backing_per_rt;
          }
        });
      },

      getMarket(validatorId, maturityId, tokenType) {
        const key = `${validatorId}-${maturityId}-${tokenType}`;
        return get().markets[key] ?? null;
      },

      updateMarketOrderBook(marketPubkey, summary) {
        const storeKey = get().pubkeyIndex[marketPubkey];
        if (!storeKey) return;
        set((s) => {
          const market = s.markets[storeKey];
          if (!market || market.marketPubkey !== marketPubkey) return;
          market.totalAskSize = summary.totalAskSize;
          market.bestAskPrice = summary.bestAskPrice;
          market.totalBidSize = summary.totalBidSize;
          market.bestBidPrice = summary.bestBidPrice;
          market.askCount = summary.askCount;
          market.bidCount = summary.bidCount;
          market.asks = summary.asks;
          market.bids = summary.bids;
        });
      },
    })),
  );
}
