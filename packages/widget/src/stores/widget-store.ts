import { createStore } from "zustand/vanilla";
import { immer } from "zustand/middleware/immer";
import { createContext, useContext } from "react";
import { useStore } from "zustand";
import type { MaturityId } from "@pye/sdk";

export type WidgetScreen =
  | "yield-forward-intro"
  | "connect-wallet"
  | "welcome"
  | "redeem-list"
  | "select-position"
  | "choose-amount"
  | "choose-duration"
  | "review-quote"
  | "complete"
  | "redeem-complete";

export interface WidgetState {
  screen: WidgetScreen;
  screenHistory: WidgetScreen[];

  selectedStakeAccountPubkey: string | null;
  selectedStakeAccountBalance: number;
  selectedValidatorName: string | null;
  selectedValidatorIcon: string | null;
  selectedValidatorVoteAccount: string | null;
  selectedValidatorAltPubkey: string | null;
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

  /** Which PT mint is currently being redeemed */
  redeemingMint: string | null;
  /** Error surfaced by the redeem flow */
  redeemError: string | null;
  /** SOL amount received from redeem, set after transaction completes */
  redeemAmountSol: number | null;
  /** Redeem transaction signature */
  redeemTxSignature: string | null;
}

export interface WidgetActions {
  navigate(screen: WidgetScreen): void;
  goBack(): void;
  selectStakeAccount(pubkey: string, balance: number, validatorName?: string, validatorIcon?: string, validatorVoteAccount?: string, validatorAltPubkey?: string | null): void;
  setDepositAmount(amount: string): void;
  setSelectedMaturity(id: MaturityId): void;
  setAdvancedOpen(open: boolean): void;
  setSlippageBps(bps: number): void;
  setSellAmountSol(amount: number): void;
  setRedeemingMint(mint: string | null): void;
  setRedeemError(error: string | null): void;
  setRedeemAmountSol(amount: number): void;
  setRedeemTxSignature(sig: string): void;
  setTxStep(step: WidgetState["txStep"]): void;
  setTxStatus(
    status: WidgetState["txStatus"],
    signature?: string | null,
    error?: string | null,
  ): void;
  reset(): void;
  resetForWalletChange(): void;
}

export type WidgetStoreType = WidgetState & WidgetActions;

const initialState: WidgetState = {
  screen: "yield-forward-intro",
  screenHistory: [],

  selectedStakeAccountPubkey: null,
  selectedStakeAccountBalance: 0,
  selectedValidatorName: null,
  selectedValidatorIcon: null,
  selectedValidatorVoteAccount: null,
  selectedValidatorAltPubkey: null,
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
          if (s.txStatus === "error") {
            s.txStatus = "idle";
            s.txStep = "idle";
            s.txError = null;
          }
          s.redeemError = null;
        });
      },

      selectStakeAccount(pubkey, balance, validatorName, validatorIcon, validatorVoteAccount, validatorAltPubkey) {
        set((s) => {
          s.selectedStakeAccountPubkey = pubkey;
          s.selectedStakeAccountBalance = balance;
          s.selectedValidatorName = validatorName ?? null;
          s.selectedValidatorIcon = validatorIcon ?? null;
          s.selectedValidatorVoteAccount = validatorVoteAccount ?? null;
          s.selectedValidatorAltPubkey = validatorAltPubkey ?? null;
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

      setRedeemAmountSol(amount) {
        set((s) => {
          s.redeemAmountSol = amount;
        });
      },

      setRedeemTxSignature(sig) {
        set((s) => {
          s.redeemTxSignature = sig;
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

      resetForWalletChange() {
        set((s) => {
          s.selectedStakeAccountPubkey = null;
          s.selectedStakeAccountBalance = 0;
          s.selectedValidatorName = null;
          s.selectedValidatorIcon = null;
          s.selectedValidatorVoteAccount = null;
          s.selectedValidatorAltPubkey = null;
          s.depositAmount = "";
          s.selectedMaturityId = null;
          s.txStatus = "idle";
          s.txStep = "idle";
          s.depositTxSignature = null;
          s.sellTxSignature = null;
          s.txSignature = null;
          s.txError = null;
          s.sellAmountSol = null;
          s.redeemingMint = null;
          s.redeemError = null;
          s.redeemAmountSol = null;
          s.redeemTxSignature = null;
          if (
            s.screen === "choose-amount" ||
            s.screen === "choose-duration" ||
            s.screen === "review-quote" ||
            s.screen === "complete" ||
            s.screen === "redeem-complete" ||
            s.screen === "redeem-list"
          ) {
            s.screen = "welcome";
            s.screenHistory = [];
          }
        });
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
