import { createStore } from "zustand/vanilla";
import { immer } from "zustand/middleware/immer";
import { createClient } from "@supabase/supabase-js";
import { getPyeConfig } from "../config";

function getSupabase() {
  const config = getPyeConfig();
  return createClient(config.supabaseUrl, config.supabaseAnonKey);
}

export type CanonicalMaturity = "q12026" | "q22026" | "q32026" | "q42026";

/**
 * Row from `solo_validator_bonds`. The widget only ever surfaces bonds with
 * a non-null `canonical_label` — the partial unique index guarantees one
 * bond per (validator, canonical_label) pair, so this is safe to key on.
 */
export interface BondRow {
  pubkey: string;
  validator_vote_account: string;
  pt_mint: string;
  rt_mint: string;
  maturity_ts: number;
  canonical_label: CanonicalMaturity;
  is_hidden: boolean;
}

export interface LockupState {
  /**
   * Bonds keyed by `${validator_vote_account}:${canonical_label}`.
   * One row per slot, by construction of the DB unique index.
   */
  bonds: Record<string, BondRow>;
  loading: boolean;
  lastFetched: number | null;
  error: string | null;
}

export interface LockupActions {
  /**
   * Fetch every visible, canonical bond. Filters applied server-side:
   * `canonical_label IS NOT NULL` and `is_hidden = false`.
   */
  fetchAll: () => Promise<void>;
}

export type LockupStore = LockupState & LockupActions;

function keyOf(votePubkey: string, label: CanonicalMaturity): string {
  return `${votePubkey}:${label}`;
}

const initialState: LockupState = {
  bonds: {},
  loading: false,
  lastFetched: null,
  error: null,
};

export function createLockupStore() {
  return createStore<LockupStore>()(
    immer((set) => ({
      ...initialState,

      async fetchAll() {
        set((s) => {
          s.loading = true;
          s.error = null;
        });

        try {
          const supabase = getSupabase();
          const { data, error } = await supabase
            .from("solo_validator_bonds")
            .select(
              "pubkey, validator_vote_account, pt_mint:principal_token_mint, rt_mint:yield_token_mint, maturity_ts, canonical_label, is_hidden",
            )
            .not("canonical_label", "is", null)
            .eq("is_hidden", false);

          if (error) throw error;

          set((s) => {
            s.bonds = {};
            for (const row of (data ?? []) as BondRow[]) {
              s.bonds[keyOf(row.validator_vote_account, row.canonical_label)] =
                row;
            }
            s.lastFetched = Date.now();
          });
        } catch (err) {
          const msg =
            err instanceof Error
              ? err.message
              : err && typeof err === "object" && "message" in err
                ? String((err as { message: unknown }).message)
                : JSON.stringify(err);
          console.error("[LockupStore] fetch failed:", msg, err);
          set((s) => {
            s.error = msg;
          });
        } finally {
          set((s) => {
            s.loading = false;
          });
        }
      },
    })),
  );
}

/** Selector: every bond for a given validator, sorted by maturity. */
export function selectBondsForValidator(
  state: LockupState,
  votePubkey: string,
): BondRow[] {
  return Object.values(state.bonds)
    .filter((b) => b.validator_vote_account === votePubkey)
    .sort((a, b) => a.maturity_ts - b.maturity_ts);
}

/** Selector: the bond for (validator, canonical_label), or null. */
export function selectBond(
  state: LockupState,
  votePubkey: string,
  label: CanonicalMaturity,
): BondRow | null {
  return state.bonds[keyOf(votePubkey, label)] ?? null;
}
