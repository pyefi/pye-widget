import { useEffect } from "react";
import { address as toAddress } from "@solana/kit";
import { useWalletStore, useBalanceStore } from "@pye/sdk/react";
import { demoWallet, buildDemoStakeAccounts, buildDemoWalletBalances } from "./demo-data";

/**
 * Replaces the real wallet/balance syncers when the widget is mounted in
 * demo mode. Seeds the wallet store as "connected" with a fake pubkey and
 * populates user stake accounts with synthetic fixtures so the widget can
 * run end-to-end without a wallet, RPC, or Supabase.
 *
 * Markets and APY are intentionally not seeded — ReviewQuote short-circuits
 * to a fake quote path when `demo` is true, so real order-book data isn't
 * needed for the demo flow.
 */
export default function DemoSeeder() {
  const setWalletStatus = useWalletStore((s) => s.setWalletStatus);
  const setWalletPublicKey = useWalletStore((s) => s.setWalletPublicKey);
  const setDisplayAddress = useWalletStore((s) => s.setDisplayAddress);
  const setBalanceLamports = useWalletStore((s) => s.setBalanceLamports);
  const setWalletInitialized = useWalletStore((s) => s.setWalletInitialized);

  const setUserStakeAccounts = useBalanceStore((s) => s.setUserStakeAccounts);
  const setUserStakeAccountsLoading = useBalanceStore((s) => s.setUserStakeAccountsLoading);
  const setWalletBalances = useBalanceStore((s) => s.setWalletBalances);

  useEffect(() => {
    setWalletInitialized(true);
    setWalletStatus("connected");
    setWalletPublicKey(toAddress(demoWallet.publicKey));
    setDisplayAddress(demoWallet.displayAddress);
    setBalanceLamports(demoWallet.balanceLamports);

    setUserStakeAccounts(buildDemoStakeAccounts());
    setUserStakeAccountsLoading(false);
    setWalletBalances(buildDemoWalletBalances());
  }, [
    setWalletStatus,
    setWalletPublicKey,
    setDisplayAddress,
    setBalanceLamports,
    setWalletInitialized,
    setUserStakeAccounts,
    setUserStakeAccountsLoading,
    setWalletBalances,
  ]);

  return null;
}
