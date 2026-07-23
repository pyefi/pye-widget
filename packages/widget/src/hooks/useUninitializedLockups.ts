import { useEffect, useMemo, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { useLockupStore } from "@pyefi/sdk/react";
import {
  getPyeConfig,
  getUninitializedLockups,
  getStakeMinimumDelegationLamports,
  getStakeRentExemptLamports,
} from "@pyefi/sdk";

interface UseUninitializedLockupsResult {
  hasUninitializedLockup: boolean;
  liquidMinLamports: number | null; // min + rent, NO FEE_BUFFER
}

/**
 * Whether the configured validator has any uninitialized lockup bonds, plus the
 * base liquid-SOL minimum (min delegation + rent). FEE_BUFFER_LAMPORTS is NOT
 * included — add it at the call site.
 */
export function useUninitializedLockups(): UseUninitializedLockupsResult {
  const { connection } = useConnection();
  const bonds = useLockupStore((s) => s.bonds);

  const configuredVoteAccount = (() => {
    try { return getPyeConfig().voteAccount; } catch { return undefined; }
  })();

  const validatorBondPubkeys = useMemo(() => {
    if (!configuredVoteAccount) return [];
    return Object.entries(bonds)
      .filter(([k]) => k.startsWith(`${configuredVoteAccount}:`))
      .map(([, b]) => b.pubkey);
  }, [bonds, configuredVoteAccount]);

  const [hasUninitializedLockup, setHasUninitializedLockup] = useState(false);
  const [liquidMinLamports, setLiquidMinLamports] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!configuredVoteAccount || validatorBondPubkeys.length === 0) {
      setHasUninitializedLockup(false);
      setLiquidMinLamports(null);
      return;
    }
    getUninitializedLockups(connection, validatorBondPubkeys)
      .then((set) => { if (!cancelled) setHasUninitializedLockup(set.size > 0); })
      .catch(() => { if (!cancelled) setHasUninitializedLockup(false); });
    Promise.all([
      getStakeMinimumDelegationLamports(connection),
      getStakeRentExemptLamports(connection),
    ])
      .then(([min, rent]) => { if (!cancelled) setLiquidMinLamports(min + rent); })
      .catch(() => { /* null → callers treat as not-loaded */ });
    return () => { cancelled = true; };
  }, [connection, configuredVoteAccount, validatorBondPubkeys]);

  return { hasUninitializedLockup, liquidMinLamports };
}
