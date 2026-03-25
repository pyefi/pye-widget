import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useMarketStore } from "./providers";
import { parseOrderBook } from "../lib/manifest-parser";
import { getPyeConfig } from "../config";

/**
 * Invisible component that:
 * 1. Fetches markets and RT backing on mount
 * 2. Polls RT backing every 60s
 * 3. Subscribes to Supabase Realtime for order book updates
 */
export default function MarketSyncer() {
  const fetchMarkets = useMarketStore((s) => s.fetchMarkets);
  const fetchRtBacking = useMarketStore((s) => s.fetchRtBacking);
  const updateMarketOrderBook = useMarketStore((s) => s.updateMarketOrderBook);
  const pubkeyIndex = useMarketStore((s) => s.pubkeyIndex);

  // Initial fetch
  useEffect(() => {
    fetchMarkets();
    fetchRtBacking();
  }, [fetchMarkets, fetchRtBacking]);

  // Re-poll rt_backing every 60s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRtBacking();
    }, 60_000);
    return () => clearInterval(interval);
  }, [fetchRtBacking]);

  // Supabase Realtime subscription for order book updates
  useEffect(() => {
    let config: ReturnType<typeof getPyeConfig>;
    try {
      config = getPyeConfig();
    } catch {
      return;
    }

    const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);

    const channel = supabase
      .channel("manifest-markets-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "manifest_markets",
        },
        (payload) => {
          const row = payload.new as { pubkey?: string; account_data?: string };
          if (!row.pubkey || !row.account_data) return;
          if (!pubkeyIndex[row.pubkey]) return;
          try {
            const summary = parseOrderBook(row.pubkey, row.account_data);
            updateMarketOrderBook(row.pubkey, summary);
          } catch (e) {
            console.error(
              `Realtime parse error for ${row.pubkey}:`,
              e instanceof Error ? e.message : e,
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pubkeyIndex, updateMarketOrderBook]);

  return null;
}
