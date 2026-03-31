import { useEffect, useMemo } from "react";
import { useApyStore, useBalanceStore } from "./providers";
import { getPyeConfig } from "../config";

const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches staking APY from stakewiz_apy for relevant vote accounts.
 *
 * - Single-validator mode: fetches for the configured vote account on mount.
 * - Universal mode: fetches for vote accounts detected in the user's stake accounts.
 * - Polls every 5 minutes.
 */
export default function ApySyncer() {
  const fetchApyForVoteAccounts = useApyStore((s) => s.fetchApyForVoteAccounts);
  const userStakeAccounts = useBalanceStore((s) => s.userStakeAccounts);

  // Collect unique vote accounts from config + detected stake accounts
  const voteAccounts = useMemo(() => {
    const set = new Set<string>();
    const config = getPyeConfig();
    if (config.voteAccount) set.add(config.voteAccount);
    for (const sa of userStakeAccounts) {
      if (sa.validatorVoteAccount) set.add(sa.validatorVoteAccount);
    }
    return Array.from(set);
  }, [userStakeAccounts]);

  // Fetch whenever vote accounts change (new stake accounts detected)
  useEffect(() => {
    if (voteAccounts.length === 0) return;
    fetchApyForVoteAccounts(voteAccounts);
  }, [voteAccounts, fetchApyForVoteAccounts]);

  // Re-poll every 5 minutes (force refresh existing data)
  useEffect(() => {
    if (voteAccounts.length === 0) return;
    const interval = setInterval(() => {
      fetchApyForVoteAccounts(voteAccounts, true);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [voteAccounts, fetchApyForVoteAccounts]);

  return null;
}
