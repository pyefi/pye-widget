import { useEffect, useRef } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useWalletStore, useBalanceStore, useMarketStore } from "./providers";
import { fetchBalances } from "../lib/fetch-balances";
import { fetchExchangeBalances } from "../lib/fetch-exchange-balances";
import { fetchUserStakeAccounts } from "../lib/fetch-user-stake-accounts";

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
  const userStakeAccounts = useBalanceStore((s) => s.userStakeAccounts);
  const stakeAccountsRef = useRef(userStakeAccounts);
  stakeAccountsRef.current = userStakeAccounts;
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
    }

    const owner = new PublicKey(publicKey);

    async function sync() {
      try {
        if (stakeAccountsRef.current.length === 0) {
          setUserStakeAccountsLoading(true);
        }
        const [walletBals, exchangeResult, stakeAccounts] = await Promise.all([
          fetchBalances(connection, owner),
          fetchExchangeBalances(connection, owner, markets),
          fetchUserStakeAccounts(connection, owner),
        ]);
        setWalletBalances(walletBals);
        setExchangeBalances(exchangeResult.exchangeBalances);
        setOpenOrdersBalances(exchangeResult.openOrdersBalances);
        setSolBalances(exchangeResult.solBalances);
        setSolOpenOrdersBalances(exchangeResult.solOpenOrdersBalances);
        setOpenOrders(exchangeResult.openOrders);
        setPerMarketBaseBalances(exchangeResult.perMarketBaseBalances);
        setUserStakeAccounts(stakeAccounts);
      } catch (err) {
        console.error("[BalanceSyncer] fetch failed:", err);
      } finally {
        setUserStakeAccountsLoading(false);
      }
    }

    sync();
    intervalRef.current = setInterval(sync, POLL_INTERVAL_MS);

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
