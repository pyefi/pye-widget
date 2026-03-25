import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getPyeConfig } from "../config";

export interface BondPayment {
  epoch: number;
  amount: number;
}

export interface RewardBreakdown {
  epoch: number;
  staking: number;
  mev: number;
  block: number;
}

export interface TvlSnapshot {
  date: string;
  sol: number;
}

export interface LockupMetrics {
  depositCap: string;
  depositCapSol: number;
  tvl: string;
  tvlSol: number;
  totalRewards: string;
  apy90d: string | null;
  inflationRewards: string;
  mevRewards: string;
  blockRewards: string;
  payments: BondPayment[];
  rewardBreakdown: RewardBreakdown[];
  tvlHistory: TvlSnapshot[];
  hasChartData: boolean;
  fetchedAt: number;
}

const LAMPORTS_PER_SOL = 1_000_000_000;

function formatBps(bps: number): string {
  const pct = bps / 100;
  return pct.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }) + "%";
}

function formatSol(lamports: number): string {
  const sol = lamports / LAMPORTS_PER_SOL;
  return sol.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }) + " SOL";
}

export async function fetchLockupMetrics(
  bondPubkey: string,
  opts?: { includeChartData?: boolean; supabaseClient?: SupabaseClient },
): Promise<LockupMetrics> {
  const supabase = opts?.supabaseClient ?? (() => {
    const config = getPyeConfig();
    return createClient(config.supabaseUrl, config.supabaseAnonKey);
  })();

  const includeCharts = opts?.includeChartData ?? false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const noData = Promise.resolve({ data: null }) as any;

  const bondRes = await supabase
    .from("solo_validator_bonds")
    .select("tvl_cap, inflation_bps, mev_tips_bps, block_rewards_bps, validator_vote_account")
    .eq("pubkey", bondPubkey)
    .single();

  const voteAccount = bondRes.data?.validator_vote_account as string | null;

  const [tvlRes, paymentsRes, rewardsRes, tvlHistoryRes, apyRes] = await Promise.all([
    supabase
      .from("tvl_snapshots")
      .select("sol")
      .eq("bond", bondPubkey)
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),

    supabase
      .from("bond_payments")
      .select("epoch, amount")
      .eq("bond_pubkey", bondPubkey)
      .order("epoch", { ascending: true }),

    includeCharts
      ? supabase
          .from("bond_rewards")
          .select("epoch, expected_inflation_rewards, expected_mev_rewards, expected_block_rewards")
          .eq("bond_pubkey", bondPubkey)
          .order("epoch", { ascending: true })
      : noData,

    includeCharts
      ? supabase
          .from("tvl_snapshots")
          .select("created_at, sol")
          .eq("bond", bondPubkey)
          .order("created_at", { ascending: true })
      : noData,

    voteAccount
      ? supabase
          .from("stakewiz_apy")
          .select("apy")
          .eq("vote_account", voteAccount)
          .order("updated_at", { ascending: false })
          .limit(1)
          .single()
      : noData,
  ]);

  let depositCap = "No Cap";
  if (bondRes.data?.tvl_cap && bondRes.data.tvl_cap > 0) {
    const cap = Number(bondRes.data.tvl_cap);
    depositCap = cap.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }) + " SOL";
  }

  let tvl = "\u2014";
  if (tvlRes.data?.sol != null) {
    const solVal = parseFloat(tvlRes.data.sol);
    tvl = solVal.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }) + " SOL";
  }

  const inflationBps = Number(bondRes.data?.inflation_bps ?? 0);
  const mevTipsBps = Number(bondRes.data?.mev_tips_bps ?? 0);
  const blockRewardsBps = Number(bondRes.data?.block_rewards_bps ?? 0);

  const payments: BondPayment[] = [];
  let totalPaymentLamports = 0;
  if (paymentsRes.data) {
    for (const row of paymentsRes.data) {
      const amount = Number(row.amount ?? 0);
      payments.push({ epoch: Number(row.epoch), amount });
      totalPaymentLamports += amount;
    }
  }

  const rewardBreakdown: RewardBreakdown[] = [];
  let totalRewardLamports = 0;
  if (rewardsRes.data) {
    for (const row of rewardsRes.data) {
      const inflation = Number(row.expected_inflation_rewards ?? 0);
      const mev = Number(row.expected_mev_rewards ?? 0);
      const block = Number(row.expected_block_rewards ?? 0);
      totalRewardLamports += inflation + mev + block;
      rewardBreakdown.push({
        epoch: Number(row.epoch),
        staking: inflation / LAMPORTS_PER_SOL,
        mev: mev / LAMPORTS_PER_SOL,
        block: block / LAMPORTS_PER_SOL,
      });
    }
  }

  const tvlHistory: TvlSnapshot[] = [];
  if (tvlHistoryRes.data) {
    const byDay = new Map<string, number>();
    for (const row of tvlHistoryRes.data) {
      const date = (row.created_at as string).slice(0, 10);
      byDay.set(date, parseFloat(row.sol ?? "0"));
    }
    for (const [date, sol] of byDay) {
      tvlHistory.push({ date, sol });
    }
  }

  const depositCapSol = Number(bondRes.data?.tvl_cap ?? 0);
  const tvlSol = parseFloat(tvlRes.data?.sol ?? "0");

  let apy90d: string | null = null;
  if (apyRes.data?.apy != null) {
    const pct = Number(apyRes.data.apy);
    apy90d = pct.toFixed(2) + "%";
  }

  return {
    depositCap,
    depositCapSol,
    tvl,
    tvlSol,
    totalRewards: formatSol(totalRewardLamports),
    apy90d,
    inflationRewards: formatBps(10_000 - inflationBps),
    mevRewards: formatBps(10_000 - mevTipsBps),
    blockRewards: formatBps(10_000 - blockRewardsBps),
    payments,
    rewardBreakdown,
    tvlHistory,
    hasChartData: includeCharts,
    fetchedAt: Date.now(),
  };
}
