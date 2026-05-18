import { useEffect, useRef } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useWalletStore, useBalanceStore, useMarketStore } from "./providers";
import { fetchBalances } from "../lib/fetch-balances";
import { fetchExchangeBalances } from "../lib/fetch-exchange-balances";
import { fetchUserStakeAccounts } from "../lib/fetch-user-stake-accounts";
import {
  readCachedStakeAccounts,
  writeCachedStakeAccounts,
} from "../lib/stake-accounts-cache";
import {
  readCachedWalletBalances,
  writeCachedWalletBalances,
} from "../lib/wallet-balances-cache";

const POLL_INTERVAL_MS = 5 * 60 * 1000;

export default function BalanceSyncer() {
  const { connection } = useConnection();
  const status = useWalletStore((s) => s.status);
  const publicKey = useWalletStore((s) => s.publicKey);
  const setWalletBalances = useBalanceStore((s) => s.setWalletBalances);
  const setExchangeBalances = useBalanceStore((s) => s.setExchangeBalances);
  const setOpenOrdersBalances = useBalanceStore((s) => s.setOpenOrdersBalances);
  const setSolBalances = useBalanceStore((s) => s.setSolBalances);
  const setSolOpenOrdersBalances = useBalanceStore((s) => s.setSolOpenOrdersBalances);
  const setOpenOrders = useBalanceStore((s) => s.setOpenOrders);
  const setPerMarketBaseBalances = useBalanceStore((s) => s.setPerMarketBaseBalances);
  const setUserStakeAccounts = useBalanceStore((s) => s.setUserStakeAccounts);
  const setUserStakeAccountsLoading = useBalanceStore((s) => s.setUserStakeAccountsLoading);
  const resetBalances = useBalanceStore((s) => s.resetBalances);
  const marketsRecord = useMarketStore((s) => s.markets);
  const markets = Object.values(marketsRecord);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPublicKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (status !== "connected" || !publicKey) {
      prevPublicKeyRef.current = null;
      resetBalances();
      return;
    }

    const walletChanged = prevPublicKeyRef.current !== publicKey;
    if (walletChanged) {
      console.log("[BalanceSyncer] wallet changed:", prevPublicKeyRef.current, "→", publicKey);
      prevPublicKeyRef.current = publicKey;
      resetBalances();

      // Hydrate from cache synchronously so WelcomeScreen can render enabled rows
      // before the expensive getParsedProgramAccounts scan finishes.
      const cachedStakes = readCachedStakeAccounts(publicKey);
      if (cachedStakes && cachedStakes.length > 0) {
        setUserStakeAccounts(cachedStakes);
      }
      const cachedBalances = readCachedWalletBalances(publicKey);
      if (cachedBalances) {
        setWalletBalances(cachedBalances);
      }
    }

    const owner = new PublicKey(publicKey);
    const pkAtStart = publicKey;

    // Fire the three fetches independently so each store slice updates the moment
    // its own request resolves, instead of waiting on the slowest of the batch.
    setUserStakeAccountsLoading(true);
    fetchUserStakeAccounts(connection, owner)
      .then((stakeAccounts) => {
        if (prevPublicKeyRef.current !== pkAtStart) return;
        setUserStakeAccounts(stakeAccounts);
        writeCachedStakeAccounts(pkAtStart, stakeAccounts);
      })
      .catch((err) => {
        console.error("[BalanceSyncer] stake-accounts fetch failed:", err);
      })
      .finally(() => {
        if (prevPublicKeyRef.current !== pkAtStart) return;
        setUserStakeAccountsLoading(false);
      });

    fetchBalances(connection, owner)
      .then((walletBals) => {
        if (prevPublicKeyRef.current !== pkAtStart) return;
        setWalletBalances(walletBals);
        writeCachedWalletBalances(pkAtStart, walletBals);
      })
      .catch((err) => {
        console.error("[BalanceSyncer] wallet-balances fetch failed:", err);
      });

    fetchExchangeBalances(connection, owner, markets)
      .then((exchangeResult) => {
        if (prevPublicKeyRef.current !== pkAtStart) return;
        setExchangeBalances(exchangeResult.exchangeBalances);
        setOpenOrdersBalances(exchangeResult.openOrdersBalances);
        setSolBalances(exchangeResult.solBalances);
        setSolOpenOrdersBalances(exchangeResult.solOpenOrdersBalances);
        setOpenOrders(exchangeResult.openOrders);
        setPerMarketBaseBalances(exchangeResult.perMarketBaseBalances);
      })
      .catch((err) => {
        console.error("[BalanceSyncer] exchange-balances fetch failed:", err);
      });

    intervalRef.current = setInterval(() => {
      if (prevPublicKeyRef.current !== pkAtStart) return;
      fetchUserStakeAccounts(connection, owner)
        .then((stakeAccounts) => {
          if (prevPublicKeyRef.current !== pkAtStart) return;
          setUserStakeAccounts(stakeAccounts);
          writeCachedStakeAccounts(pkAtStart, stakeAccounts);
        })
        .catch((err) => {
          console.error("[BalanceSyncer] stake-accounts poll failed:", err);
        });
      fetchBalances(connection, owner)
        .then((walletBals) => {
          if (prevPublicKeyRef.current !== pkAtStart) return;
          setWalletBalances(walletBals);
          writeCachedWalletBalances(pkAtStart, walletBals);
        })
        .catch((err) => {
          console.error("[BalanceSyncer] wallet-balances poll failed:", err);
        });
      fetchExchangeBalances(connection, owner, markets)
        .then((exchangeResult) => {
          if (prevPublicKeyRef.current !== pkAtStart) return;
          setExchangeBalances(exchangeResult.exchangeBalances);
          setOpenOrdersBalances(exchangeResult.openOrdersBalances);
          setSolBalances(exchangeResult.solBalances);
          setSolOpenOrdersBalances(exchangeResult.solOpenOrdersBalances);
          setOpenOrders(exchangeResult.openOrders);
          setPerMarketBaseBalances(exchangeResult.perMarketBaseBalances);
        })
        .catch((err) => {
          console.error("[BalanceSyncer] exchange-balances poll failed:", err);
        });
    }, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [
    status,
    publicKey,
    connection,
    marketsRecord,
    setWalletBalances,
    setExchangeBalances,
    setOpenOrdersBalances,
    setSolBalances,
    setSolOpenOrdersBalances,
    setOpenOrders,
    setPerMarketBaseBalances,
    setUserStakeAccounts,
    setUserStakeAccountsLoading,
    resetBalances,
  ]);

  return null;
}
