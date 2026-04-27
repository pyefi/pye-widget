import { useEffect } from "react";
import { address as toAddress } from "@solana/kit";
import { createClient } from "@supabase/supabase-js";
import { useWalletStore, useBalanceStore } from "@pye/sdk/react";
import { getPyeConfig } from "@pye/sdk";
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

    const accounts = buildDemoStakeAccounts();
    setUserStakeAccounts(accounts);
    setUserStakeAccountsLoading(false);
    setWalletBalances(buildDemoWalletBalances());

    // Hydrate validator logos from Supabase just like the real fetch path.
    // Fails silently if the demo site isn't configured with real Supabase
    // creds — logos simply won't show, which is the current baseline.
    let cancelled = false;
    (async () => {
      const voteAccounts = Array.from(new Set(accounts.map((a) => a.validatorVoteAccount)));
      if (voteAccounts.length === 0) return;
      try {
        const config = getPyeConfig();
        const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
        const { data, error } = await supabase
          .from("validator_metadata_configs")
          .select("vote_pubkey, base_image_url")
          .in("vote_pubkey", voteAccounts);
        if (error || !data || cancelled) return;
        const logoByVote = new Map<string, string | null>();
        for (const row of data) logoByVote.set(row.vote_pubkey, row.base_image_url ?? null);
        const hydrated = accounts.map((a) => ({
          ...a,
          validatorLogo: logoByVote.get(a.validatorVoteAccount) ?? null,
        }));
        setUserStakeAccounts(hydrated);
      } catch {
        // noop — leave accounts as-is
      }
    })();
    return () => { cancelled = true; };
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
