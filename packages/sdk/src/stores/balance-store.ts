import { createStore } from "zustand/vanilla";
import { immer } from "zustand/middleware/immer";
import { allTokenAddresses } from "../constants/tokens";

export type Balances = Record<string, number>;

export type StakeAccountState =
  | "active"
  | "activating"
  | "deactivating"
  | "inactive";

export interface UserStakeAccount {
  pubkey: string;
  validatorVoteAccount: string;
  validatorName: string;
  validatorIcon: string;
  lamports: number;
  state: StakeAccountState;
}

export interface OpenOrder {
  /** Manifest market pubkey that holds this order */
  marketKey: string;
  /** Whether this is a bid (buy) or ask (sell) */
  isBid: boolean;
  /** Number of base tokens in the order */
  numBaseTokens: number;
  /** Price in quote tokens per base token */
  tokenPrice: number;
  /** Exchange-defined unique order id */
  sequenceNumber: string;
}

export interface BalanceState {
  walletBalances: Balances;
  exchangeBalances: Balances;
  /** PT/RT open-orders balances keyed by mint address */
  openOrdersBalances: Balances;
  /** Per-market SOL (quote) withdrawable balances, keyed by "validatorId-maturityId-tokenType" */
  solBalances: Balances;
  /** Per-market SOL (quote) open-orders balances, keyed by "validatorId-maturityId-tokenType" */
  solOpenOrdersBalances: Balances;
  /** Individual open orders for the connected trader */
  openOrders: OpenOrder[];
  /** Per-market base (PT/RT) withdrawable balance keyed by marketPubkey */
  perMarketBaseBalances: Record<string, number>;
  /** User's native stake accounts */
  userStakeAccounts: UserStakeAccount[];
  userStakeAccountsLoading: boolean;
}

export interface BalanceActions {
  setWalletBalances: (updates: Balances) => void;
  setExchangeBalances: (updates: Balances) => void;
  setOpenOrdersBalances: (updates: Balances) => void;
  setSolBalances: (updates: Balances) => void;
  setSolOpenOrdersBalances: (updates: Balances) => void;
  setOpenOrders: (orders: OpenOrder[]) => void;
  setPerMarketBaseBalances: (balances: Record<string, number>) => void;
  setUserStakeAccounts: (accounts: UserStakeAccount[]) => void;
  setUserStakeAccountsLoading: (loading: boolean) => void;
  resetBalances: () => void;
}

export type BalanceStore = BalanceState & BalanceActions;

function buildInitialBalances(): Balances {
  const balances: Balances = {};
  for (const address of allTokenAddresses()) {
    balances[address] = 0;
  }
  return balances;
}

const initialBalances = buildInitialBalances();

export function createBalanceStore() {
  return createStore<BalanceStore>()(
    immer((set) => ({
      walletBalances: { ...initialBalances },
      exchangeBalances: { ...initialBalances },
      openOrdersBalances: {},
      solBalances: {},
      solOpenOrdersBalances: {},
      openOrders: [],
      perMarketBaseBalances: {},
      userStakeAccounts: [],
      userStakeAccountsLoading: false,

      setWalletBalances(updates) {
        set((s) => {
          for (const [mint, amount] of Object.entries(updates)) {
            s.walletBalances[mint] = amount;
          }
        });
      },

      setExchangeBalances(updates) {
        set((s) => {
          for (const [mint, amount] of Object.entries(updates)) {
            s.exchangeBalances[mint] = amount;
          }
        });
      },

      setOpenOrdersBalances(updates) {
        set((s) => {
          s.openOrdersBalances = updates;
        });
      },

      setSolBalances(updates) {
        set((s) => {
          for (const [key, amount] of Object.entries(updates)) {
            s.solBalances[key] = amount;
          }
        });
      },

      setSolOpenOrdersBalances(updates) {
        set((s) => {
          for (const [key, amount] of Object.entries(updates)) {
            s.solOpenOrdersBalances[key] = amount;
          }
        });
      },

      setOpenOrders(orders) {
        set((s) => {
          s.openOrders = orders;
        });
      },

      setPerMarketBaseBalances(balances) {
        set((s) => {
          s.perMarketBaseBalances = balances;
        });
      },

      setUserStakeAccounts(accounts) {
        set((s) => {
          s.userStakeAccounts = accounts;
        });
      },

      setUserStakeAccountsLoading(loading) {
        set((s) => {
          s.userStakeAccountsLoading = loading;
        });
      },

      resetBalances() {
        set((s) => {
          s.walletBalances = { ...initialBalances };
          s.exchangeBalances = { ...initialBalances };
          s.openOrdersBalances = {};
          s.solBalances = {};
          s.solOpenOrdersBalances = {};
          s.openOrders = [];
          s.perMarketBaseBalances = {};
          s.userStakeAccounts = [];
          s.userStakeAccountsLoading = false;
        });
      },
    })),
  );
}
