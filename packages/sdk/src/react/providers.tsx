import { createContext, useContext, useRef, type ReactNode } from "react";
import { useStore } from "zustand";
import { createWalletStore, type WalletStore } from "../stores/wallet-store";
import { createBalanceStore, type BalanceStore } from "../stores/balance-store";
import { createMarketStore, type MarketStore } from "../stores/market-store";
import { createApyStore, type ApyStore } from "../stores/apy-store";
import { createValidatorStore, type ValidatorStore } from "../stores/validator-store";
import { createLockupStore, type LockupStore } from "../stores/lockup-store";

// ── Wallet Store ──

type WalletStoreApi = ReturnType<typeof createWalletStore>;
const WalletStoreContext = createContext<WalletStoreApi | null>(null);

export function WalletStoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<WalletStoreApi>(undefined);
  if (!storeRef.current) {
    storeRef.current = createWalletStore();
  }
  return (
    <WalletStoreContext.Provider value={storeRef.current}>
      {children}
    </WalletStoreContext.Provider>
  );
}

export function useWalletStore<T>(selector: (state: WalletStore) => T): T {
  const store = useContext(WalletStoreContext);
  if (!store) {
    throw new Error("useWalletStore must be used within WalletStoreProvider");
  }
  return useStore(store, selector);
}

// ── Balance Store ──

type BalanceStoreApi = ReturnType<typeof createBalanceStore>;
const BalanceStoreContext = createContext<BalanceStoreApi | null>(null);

export function BalanceStoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<BalanceStoreApi>(undefined);
  if (!storeRef.current) {
    storeRef.current = createBalanceStore();
  }
  return (
    <BalanceStoreContext.Provider value={storeRef.current}>
      {children}
    </BalanceStoreContext.Provider>
  );
}

export function useBalanceStore<T>(selector: (state: BalanceStore) => T): T {
  const store = useContext(BalanceStoreContext);
  if (!store) {
    throw new Error("useBalanceStore must be used within BalanceStoreProvider");
  }
  return useStore(store, selector);
}

// ── Market Store ──

type MarketStoreApi = ReturnType<typeof createMarketStore>;
const MarketStoreContext = createContext<MarketStoreApi | null>(null);

export function MarketStoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<MarketStoreApi>(undefined);
  if (!storeRef.current) {
    storeRef.current = createMarketStore();
  }
  return (
    <MarketStoreContext.Provider value={storeRef.current}>
      {children}
    </MarketStoreContext.Provider>
  );
}

export function useMarketStore<T>(selector: (state: MarketStore) => T): T {
  const store = useContext(MarketStoreContext);
  if (!store) {
    throw new Error("useMarketStore must be used within MarketStoreProvider");
  }
  return useStore(store, selector);
}

// ── APY Store ──

type ApyStoreApi = ReturnType<typeof createApyStore>;
const ApyStoreContext = createContext<ApyStoreApi | null>(null);

export function ApyStoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<ApyStoreApi>(undefined);
  if (!storeRef.current) {
    storeRef.current = createApyStore();
  }
  return (
    <ApyStoreContext.Provider value={storeRef.current}>
      {children}
    </ApyStoreContext.Provider>
  );
}

export function useApyStore<T>(selector: (state: ApyStore) => T): T {
  const store = useContext(ApyStoreContext);
  if (!store) {
    throw new Error("useApyStore must be used within ApyStoreProvider");
  }
  return useStore(store, selector);
}

// ── Validator Store ──

type ValidatorStoreApi = ReturnType<typeof createValidatorStore>;
const ValidatorStoreContext = createContext<ValidatorStoreApi | null>(null);

export function ValidatorStoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<ValidatorStoreApi>(undefined);
  if (!storeRef.current) {
    storeRef.current = createValidatorStore();
  }
  return (
    <ValidatorStoreContext.Provider value={storeRef.current}>
      {children}
    </ValidatorStoreContext.Provider>
  );
}

export function useValidatorStore<T>(selector: (state: ValidatorStore) => T): T {
  const store = useContext(ValidatorStoreContext);
  if (!store) {
    throw new Error("useValidatorStore must be used within ValidatorStoreProvider");
  }
  return useStore(store, selector);
}

// ── Lockup Store ──

type LockupStoreApi = ReturnType<typeof createLockupStore>;
const LockupStoreContext = createContext<LockupStoreApi | null>(null);

export function LockupStoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<LockupStoreApi>(undefined);
  if (!storeRef.current) {
    storeRef.current = createLockupStore();
  }
  return (
    <LockupStoreContext.Provider value={storeRef.current}>
      {children}
    </LockupStoreContext.Provider>
  );
}

export function useLockupStore<T>(selector: (state: LockupStore) => T): T {
  const store = useContext(LockupStoreContext);
  if (!store) {
    throw new Error("useLockupStore must be used within LockupStoreProvider");
  }
  return useStore(store, selector);
}

// ── Composed Provider ──

export function PyeSDKProvider({ children }: { children: ReactNode }) {
  return (
    <WalletStoreProvider>
      <BalanceStoreProvider>
        <ValidatorStoreProvider>
          <LockupStoreProvider>
            <MarketStoreProvider>
              <ApyStoreProvider>
                {children}
              </ApyStoreProvider>
            </MarketStoreProvider>
          </LockupStoreProvider>
        </ValidatorStoreProvider>
      </BalanceStoreProvider>
    </WalletStoreProvider>
  );
}
