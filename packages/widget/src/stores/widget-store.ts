import { createStore } from "zustand/vanilla";
import { immer } from "zustand/middleware/immer";
import { createContext, useContext } from "react";
import { useStore } from "zustand";
import type { MaturityId } from "@pye/sdk";

export type WidgetScreen =
  | "home"
  | "yield-forward-intro"
  | "connect-wallet"
  | "select-position"
  | "choose-amount"
  | "choose-duration"
  | "review-quote"
  | "complete";

export type HomeTab = "earn" | "positions" | "learn";

export interface WidgetState {
  screen: WidgetScreen;
  screenHistory: WidgetScreen[];
  homeTab: HomeTab;

  selectedStakeAccountPubkey: string | null;
  selectedStakeAccountBalance: number;
  depositAmount: string;
  selectedMaturityId: MaturityId | null;

  advancedOpen: boolean;
  discountRateBps: number;

  txStatus: "idle" | "loading" | "success" | "error";
  txSignature: string | null;
  txError: string | null;
}

export interface WidgetActions {
  navigate(screen: WidgetScreen): void;
  goBack(): void;
  setHomeTab(tab: HomeTab): void;
  selectStakeAccount(pubkey: string, balance: number): void;
  setDepositAmount(amount: string): void;
  setSelectedMaturity(id: MaturityId): void;
  setAdvancedOpen(open: boolean): void;
  setDiscountRateBps(bps: number): void;
  setTxStatus(
    status: WidgetState["txStatus"],
    signature?: string | null,
    error?: string | null,
  ): void;
  reset(): void;
}

export type WidgetStoreType = WidgetState & WidgetActions;

const initialState: WidgetState = {
  screen: "home",
  screenHistory: [],
  homeTab: "earn",

  selectedStakeAccountPubkey: null,
  selectedStakeAccountBalance: 0,
  depositAmount: "",
  selectedMaturityId: null,

  advancedOpen: false,
  discountRateBps: 100,

  txStatus: "idle",
  txSignature: null,
  txError: null,
};

export function createWidgetStore() {
  return createStore<WidgetStoreType>()(
    immer((set) => ({
      ...initialState,

      navigate(screen) {
        set((s) => {
          s.screenHistory.push(s.screen);
          s.screen = screen;
        });
      },

      goBack() {
        set((s) => {
          const prev = s.screenHistory.pop();
          if (prev) s.screen = prev;
        });
      },

      setHomeTab(tab) {
        set((s) => {
          s.homeTab = tab;
        });
      },

      selectStakeAccount(pubkey, balance) {
        set((s) => {
          s.selectedStakeAccountPubkey = pubkey;
          s.selectedStakeAccountBalance = balance;
        });
      },

      setDepositAmount(amount) {
        set((s) => {
          s.depositAmount = amount;
        });
      },

      setSelectedMaturity(id) {
        set((s) => {
          s.selectedMaturityId = id;
        });
      },

      setAdvancedOpen(open) {
        set((s) => {
          s.advancedOpen = open;
        });
      },

      setDiscountRateBps(bps) {
        set((s) => {
          s.discountRateBps = bps;
        });
      },

      setTxStatus(status, signature, error) {
        set((s) => {
          s.txStatus = status;
          s.txSignature = signature ?? null;
          s.txError = error ?? null;
        });
      },

      reset() {
        set(() => ({ ...initialState }));
      },
    })),
  );
}

// Context
type WidgetStoreApi = ReturnType<typeof createWidgetStore>;
export const WidgetStoreContext = createContext<WidgetStoreApi | null>(null);

export function useWidgetStore<T>(selector: (state: WidgetStoreType) => T): T {
  const store = useContext(WidgetStoreContext);
  if (!store) {
    throw new Error("useWidgetStore must be used within WidgetStoreProvider");
  }
  return useStore(store, selector);
}
