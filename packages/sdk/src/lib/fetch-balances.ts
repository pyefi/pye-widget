import { Connection, PublicKey } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  AccountLayout,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { createClient } from "@supabase/supabase-js";
import { getPyeConfig } from "../config";
import { allTokenAddresses } from "../constants/tokens";

const SOL_MINT = "So11111111111111111111111111111111111111112";
const MAX_ACCOUNTS_PER_REQUEST = 100;

/**
 * Resolves the PT/RT mints to track from the **live** Supabase bonds — not the
 * deprecated static token list, which is filtered to `is_allowed` validators
 * and silently drops e.g. Binance, so their positions never appear (redeem
 * stays disabled). Scoped to the configured vote account for single-validator
 * widgets. Falls back to the static list only if the query fails.
 */
async function resolveTrackedMints(): Promise<string[]> {
  try {
    const config = getPyeConfig();
    const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
    let query = supabase
      .from("solo_validator_bonds")
      .select("principal_token_mint, yield_token_mint")
      .not("canonical_label", "is", null);
    if (config.voteAccount) {
      query = query.eq("validator_vote_account", config.voteAccount);
    }
    const { data, error } = await query;
    if (error || !data) throw error ?? new Error("no bond data");
    const set = new Set<string>();
    for (const row of data as Array<{
      principal_token_mint: string | null;
      yield_token_mint: string | null;
    }>) {
      if (row.principal_token_mint) set.add(row.principal_token_mint);
      if (row.yield_token_mint) set.add(row.yield_token_mint);
    }
    return [...set];
  } catch (err) {
    console.warn(
      "[fetchBalances] bond-mint query failed, falling back to static token list:",
      err,
    );
    return allTokenAddresses().filter((a) => a !== SOL_MINT);
  }
}

async function getBalancesForMints(
  connection: Connection,
  owner: PublicKey,
  mints: string[],
): Promise<Record<string, number>> {
  const balances: Record<string, number> = {};
  const atas = mints.map((mint) =>
    getAssociatedTokenAddressSync(new PublicKey(mint), owner, true, TOKEN_PROGRAM_ID),
  );

  // getMultipleAccountsInfo caps at 100 accounts per call — chunk for the
  // universal widget, which can track far more than that.
  for (let i = 0; i < atas.length; i += MAX_ACCOUNTS_PER_REQUEST) {
    const chunk = atas.slice(i, i + MAX_ACCOUNTS_PER_REQUEST);
    const infos = await connection.getMultipleAccountsInfo(chunk);
    for (let j = 0; j < infos.length; j++) {
      const info = infos[j];
      if (info) {
        const data = AccountLayout.decode(info.data);
        balances[mints[i + j]] = Number(data.amount);
      }
    }
  }
  return balances;
}

// Fetches native SOL + all PT/RT token balances for a wallet.
export async function fetchBalances(
  connection: Connection,
  owner: PublicKey,
): Promise<Record<string, number>> {
  const mintAddresses = await resolveTrackedMints();

  const [lamports, tokenBalances] = await Promise.all([
    connection.getBalance(owner),
    getBalancesForMints(connection, owner, mintAddresses),
  ]);

  return { ...tokenBalances, [SOL_MINT]: lamports };
}

// Fetches SPL token balances for an arbitrary list of mint addresses.
export async function fetchBalancesForMints(
  connection: Connection,
  owner: PublicKey,
  mints: string[],
): Promise<Record<string, number>> {
  const balances: Record<string, number> = {};
  for (const mint of mints) balances[mint] = 0;
  const fetched = await getBalancesForMints(connection, owner, mints);
  return { ...balances, ...fetched };
}
