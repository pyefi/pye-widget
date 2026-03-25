import { createStore } from "zustand/vanilla";
import { immer } from "zustand/middleware/immer";
import type { Address } from "@solana/kit";

export type WalletStatus = "disconnected" | "connecting" | "connected";

export interface WalletState {
  status: WalletStatus;
  publicKey: Address | null;
  displayAddress: string | null;
  balanceLamports: number | null;
  error: string | null;
  /** True after WalletSyncer has read the adapter state at least once. */
  walletInitialized: boolean;
}

export interface WalletActions {
  setWalletStatus: (status: WalletStatus) => void;
  setWalletPublicKey: (publicKey: Address | null) => void;
  setDisplayAddress: (displayAddress: string | null) => void;
  setBalanceLamports: (lamports: number | null) => void;
  setError: (error: string | null) => void;
  setWalletInitialized: (initialized: boolean) => void;
  resetWallet: () => void;
}

export type WalletStore = WalletState & WalletActions;

const initialState: WalletState = {
  status: "disconnected",
  publicKey: null,
  displayAddress: null,
  balanceLamports: null,
  error: null,
  walletInitialized: false,
};

export function createWalletStore() {
  return createStore<WalletStore>()(
    immer((set) => ({
      ...initialState,

      setWalletStatus(status) {
        set((s) => {
          s.status = status;
        });
      },

      setWalletPublicKey(publicKey) {
        set((s) => {
          s.publicKey = publicKey;
        });
      },

      setDisplayAddress(displayAddress) {
        set((s) => {
          s.displayAddress = displayAddress;
        });
      },

      setBalanceLamports(lamports) {
        set((s) => {
          s.balanceLamports = lamports;
        });
      },

      setError(error) {
        set((s) => {
          s.error = error;
        });
      },

      setWalletInitialized(initialized) {
        set((s) => {
          s.walletInitialized = initialized;
        });
      },

      resetWallet() {
        set((s) => {
          s.status = "disconnected";
          s.publicKey = null;
          s.displayAddress = null;
          s.balanceLamports = null;
          s.error = null;
        });
      },
    })),
  );
}
