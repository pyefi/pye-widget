import { createStore } from "zustand/vanilla";
import { immer } from "zustand/middleware/immer";
import { createClient } from "@supabase/supabase-js";
import { getPyeConfig } from "../config";

function getSupabase() {
  const config = getPyeConfig();
  return createClient(config.supabaseUrl, config.supabaseAnonKey);
}

/**
 * Row from `validator_metadata_configs`. The `widget` and `app` booleans are
 * the allowlist gates — only validators with `widget = true` should be
 * surfaced in the widget UI.
 */
export interface ValidatorRow {
  vote_pubkey: string;
  name: string;
  symbol: string;
  pt_image_url: string;
  yt_image_url: string;
  base_image_url: string | null;
  alt_pubkey: string | null;
  widget: boolean;
  app: boolean;
}

export interface ValidatorState {
  /** All validators fetched, keyed by vote_pubkey. */
  validators: Record<string, ValidatorRow>;
  loading: boolean;
  lastFetched: number | null;
  error: string | null;
}

export interface ValidatorActions {
  /**
   * Fetch every row in `validator_metadata_configs`. Caller filters by
   * `widget = true` (or `app = true`) at the selector level.
   */
  fetchAll: () => Promise<void>;
}

export type ValidatorStore = ValidatorState & ValidatorActions;

const initialState: ValidatorState = {
  validators: {},
  loading: false,
  lastFetched: null,
  error: null,
};

export function createValidatorStore() {
  return createStore<ValidatorStore>()(
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
            .from("validator_metadata_configs")
            .select(
              "vote_pubkey, name, symbol, pt_image_url, yt_image_url, base_image_url, alt_pubkey, widget, app",
            );

          if (error) throw error;

          set((s) => {
            s.validators = {};
            for (const row of (data ?? []) as ValidatorRow[]) {
              s.validators[row.vote_pubkey] = row;
            }
            s.lastFetched = Date.now();
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error("[ValidatorStore] fetch failed:", msg);
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

/** Selector helper: only rows where `widget = true`. */
export function selectWidgetValidators(state: ValidatorState): ValidatorRow[] {
  return Object.values(state.validators)
    .filter((v) => v.widget)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Selector helper: single validator by vote_pubkey, only if `widget = true`. */
export function selectWidgetValidator(
  state: ValidatorState,
  votePubkey: string,
): ValidatorRow | null {
  const row = state.validators[votePubkey];
  return row && row.widget ? row : null;
}
