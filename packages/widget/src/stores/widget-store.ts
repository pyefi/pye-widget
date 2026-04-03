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
  | "complete"
  | "redeem-complete";

export type HomeTab = "earn" | "positions" | "learn";

export interface WidgetState {
  screen: WidgetScreen;
  screenHistory: WidgetScreen[];
  homeTab: HomeTab;

  selectedStakeAccountPubkey: string | null;
  selectedStakeAccountBalance: number;
  selectedValidatorName: string | null;
  selectedValidatorIcon: string | null;
  selectedValidatorVoteAccount: string | null;
  depositAmount: string;
  selectedMaturityId: MaturityId | null;

  advancedOpen: boolean;
  slippageBps: number;

  txStatus: "idle" | "loading" | "success" | "error";
  txStep: "idle" | "depositing" | "selling" | "complete";
  depositTxSignature: string | null;
  sellTxSignature: string | null;
  txSignature: string | null;
  txError: string | null;
  /** Actual SOL received from RT sell, set after transaction completes */
  sellAmountSol: number | null;

  /** Which PT mint is currently being redeemed (Manage tab) */
  redeemingMint: string | null;
  /** Redeem error message (Manage tab) */
  redeemError: string | null;
  /** Currently viewed learn article */
  selectedLearnArticle: { title: string; teaser: string; body: string[] } | null;
  /** Wallet name currently connecting */
  connectingWallet: string | null;
  /** SOL amount received from redeem, set after transaction completes */
  redeemAmountSol: number | null;
  /** Redeem transaction signature */
  redeemTxSignature: string | null;
}

export interface WidgetActions {
  navigate(screen: WidgetScreen): void;
  goBack(): void;
  setHomeTab(tab: HomeTab): void;
  selectStakeAccount(pubkey: string, balance: number, validatorName?: string, validatorIcon?: string, validatorVoteAccount?: string): void;
  setDepositAmount(amount: string): void;
  setSelectedMaturity(id: MaturityId): void;
  setAdvancedOpen(open: boolean): void;
  setSlippageBps(bps: number): void;
  setSellAmountSol(amount: number): void;
  setRedeemingMint(mint: string | null): void;
  setRedeemError(error: string | null): void;
  setSelectedLearnArticle(article: WidgetState["selectedLearnArticle"]): void;
  setConnectingWallet(name: string | null): void;
  setTxStep(step: WidgetState["txStep"]): void;
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
  selectedValidatorName: null,
  selectedValidatorIcon: null,
  selectedValidatorVoteAccount: null,
  depositAmount: "",
  selectedMaturityId: null,

  advancedOpen: false,
  slippageBps: 100,

  txStatus: "idle",
  txStep: "idle",
  depositTxSignature: null,
  sellTxSignature: null,
  txSignature: null,
  txError: null,
  sellAmountSol: null,

  redeemingMint: null,
  redeemError: null,
  selectedLearnArticle: null,
  connectingWallet: null,
  redeemAmountSol: null,
  redeemTxSignature: null,
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

      selectStakeAccount(pubkey, balance, validatorName, validatorIcon, validatorVoteAccount) {
        set((s) => {
          s.selectedStakeAccountPubkey = pubkey;
          s.selectedStakeAccountBalance = balance;
          s.selectedValidatorName = validatorName ?? null;
          s.selectedValidatorIcon = validatorIcon ?? null;
          s.selectedValidatorVoteAccount = validatorVoteAccount ?? null;
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

      setSlippageBps(bps) {
        set((s) => {
          s.slippageBps = bps;
        });
      },

      setSellAmountSol(amount) {
        set((s) => {
          s.sellAmountSol = amount;
        });
      },

      setRedeemingMint(mint) {
        set((s) => {
          s.redeemingMint = mint;
        });
      },

      setRedeemError(error) {
        set((s) => {
          s.redeemError = error;
        });
      },

      setSelectedLearnArticle(article) {
        set((s) => {
          s.selectedLearnArticle = article;
        });
      },

      setConnectingWallet(name) {
        set((s) => {
          s.connectingWallet = name;
        });
      },

      setTxStep(step) {
        set((s) => {
          s.txStep = step;
        });
      },

      setTxStatus(status, signature, error) {
        set((s) => {
          s.txStatus = status;
          s.txSignature = signature ?? null;
          s.txError = error ?? null;
          if (status === "idle") {
            s.txStep = "idle";
            s.depositTxSignature = null;
            s.sellTxSignature = null;
          }
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
