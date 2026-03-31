import { createStore } from "zustand/vanilla";
import { immer } from "zustand/middleware/immer";
import { createClient } from "@supabase/supabase-js";
import { getPyeConfig } from "../config";

function getSupabase() {
  const config = getPyeConfig();
  return createClient(config.supabaseUrl, config.supabaseAnonKey);
}

export interface ApyState {
  /** APY keyed by vote account address (as a decimal, e.g. 0.07 for 7%) */
  apyByVoteAccount: Record<string, number>;
  loading: boolean;
  lastFetched: number | null;
}

export interface ApyActions {
  /** Fetch APY for specific vote accounts. Merges into existing data. */
  fetchApyForVoteAccounts: (voteAccounts: string[], force?: boolean) => Promise<void>;
}

export type ApyStore = ApyState & ApyActions;

const initialState: ApyState = {
  apyByVoteAccount: {},
  loading: false,
  lastFetched: null,
};

export function createApyStore() {
  return createStore<ApyStore>()(
    immer((set, get) => ({
      ...initialState,

      async fetchApyForVoteAccounts(voteAccounts: string[], force?: boolean) {
        if (voteAccounts.length === 0) return;

        // Skip vote accounts we already have (unless force refresh)
        const toFetch = force
          ? voteAccounts
          : voteAccounts.filter((va) => !(va in get().apyByVoteAccount));
        if (toFetch.length === 0) return;

        set((s) => { s.loading = true; });

        try {
          const supabase = getSupabase();

          // Fetch APY for each vote account in parallel
          const results = await Promise.all(
            toFetch.map((va) =>
              supabase
                .from("stakewiz_apy")
                .select("apy, vote_account")
                .eq("vote_account", va)
                .order("updated_at", { ascending: false })
                .limit(1)
                .single()
                .then((res) => res.data),
            ),
          );

          set((s) => {
            for (const row of results) {
              if (row?.vote_account && row.apy != null) {
                s.apyByVoteAccount[row.vote_account] = Number(row.apy) / 100;
              }
            }
            s.lastFetched = Date.now();
          });
        } catch (err) {
          console.error("[ApyStore] fetch failed:", err);
        } finally {
          set((s) => { s.loading = false; });
        }
      },
    })),
  );
}
