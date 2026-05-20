import { Connection, PublicKey } from "@solana/web3.js";
import { createClient } from "@supabase/supabase-js";
import { getPyeConfig } from "../config";
import type {
  UserStakeAccount,
  StakeAccountState,
} from "../stores/balance-store";

const STAKE_PROGRAM_ID = new PublicKey(
  "Stake11111111111111111111111111111111111111",
);

export async function fetchUserStakeAccounts(
  connection: Connection,
  owner: PublicKey,
): Promise<UserStakeAccount[]> {
  const config = getPyeConfig();
  const filterVoteAccount = config.voteAccount;
  const ownerBase58 = owner.toBase58();

  // Query both staker (offset 12) and withdrawer (offset 44) authorities,
  // since some staking setups use a PDA as the staker while the wallet is the withdrawer.
  const [stakerAccounts, withdrawerAccounts, epochInfo] = await Promise.all([
    connection.getParsedProgramAccounts(STAKE_PROGRAM_ID, {
      filters: [
        { dataSize: 200 },
        { memcmp: { offset: 12, bytes: ownerBase58 } },
      ],
    }),
    connection.getParsedProgramAccounts(STAKE_PROGRAM_ID, {
      filters: [
        { dataSize: 200 },
        { memcmp: { offset: 44, bytes: ownerBase58 } },
      ],
    }),
    connection.getEpochInfo(),
  ]);

  // Deduplicate by pubkey
  const seen = new Set<string>();
  const accounts: typeof stakerAccounts = [];
  for (const a of [...stakerAccounts, ...withdrawerAccounts]) {
    const key = a.pubkey.toBase58();
    if (!seen.has(key)) {
      seen.add(key);
      accounts.push(a);
    }
  }

  const currentEpoch = BigInt(epochInfo.epoch);
  const U64_MAX = BigInt("18446744073709551615");

  const results: UserStakeAccount[] = [];

  for (const { pubkey, account } of accounts) {
    const parsed = (
      account.data as {
        parsed?: {
          info?: {
            stake?: {
              delegation?: {
                voter?: string;
                stake?: string;
                activationEpoch?: string;
                deactivationEpoch?: string;
              };
            };
          };
        };
      }
    ).parsed;
    const delegation = parsed?.info?.stake?.delegation;
    if (!delegation?.voter) continue;

    // If a specific vote account is configured, skip accounts delegated elsewhere
    if (filterVoteAccount && delegation.voter !== filterVoteAccount) continue;

    const activationEpoch = BigInt(delegation.activationEpoch ?? "0");
    const deactivationEpoch = BigInt(
      delegation.deactivationEpoch ?? U64_MAX.toString(),
    );

    let state: StakeAccountState;
    if (deactivationEpoch < currentEpoch) {
      state = "inactive";
    } else if (deactivationEpoch === currentEpoch) {
      state = "deactivating";
    } else if (activationEpoch === currentEpoch) {
      state = "activating";
    } else {
      state = "active";
    }

    results.push({
      pubkey: pubkey.toBase58(),
      validatorVoteAccount: delegation.voter,
      validatorName: "Unknown Validator",
      validatorIcon: "/solana-token.png",
      validatorLogo: null,
      validatorAltPubkey: null,
      lamports: Number(delegation.stake ?? account.lamports),
      state,
    });
  }

  const voteAccounts = Array.from(
    new Set(results.map((r) => r.validatorVoteAccount)),
  );
  if (voteAccounts.length > 0) {
    const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
    const { data, error } = await supabase
      .from("validator_metadata_configs")
      .select("vote_pubkey, name, pt_image_url, base_image_url, alt_pubkey")
      .in("vote_pubkey", voteAccounts);
    if (error) {
      console.warn("[fetchUserStakeAccounts] metadata fetch failed:", error);
    } else if (data) {
      const metaByVote = new Map<
        string,
        { name: string; icon: string; logo: string | null; alt: string | null }
      >();
      for (const row of data) {
        metaByVote.set(row.vote_pubkey, {
          name: row.name,
          icon: row.pt_image_url,
          logo: row.base_image_url ?? null,
          alt: row.alt_pubkey ?? null,
        });
      }
      for (const r of results) {
        const meta = metaByVote.get(r.validatorVoteAccount);
        if (meta) {
          r.validatorName = meta.name;
          r.validatorIcon = meta.icon;
          r.validatorLogo = meta.logo;
          r.validatorAltPubkey = meta.alt;
        }
      }
    }
  }

  return results;
}
