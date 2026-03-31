import { Connection, PublicKey } from "@solana/web3.js";
import { validators, type ValidatorId } from "../constants/validators";
import { getPyeConfig } from "../config";
import type {
  UserStakeAccount,
  StakeAccountState,
} from "../stores/balance-store";

const STAKE_PROGRAM_ID = new PublicKey(
  "Stake11111111111111111111111111111111111111",
);

// Build reverse lookup: vote_account → { id, name, icon }
const voteAccountToValidator = new Map<
  string,
  { id: ValidatorId; name: string; icon: string }
>();
for (const [id, v] of Object.entries(validators)) {
  voteAccountToValidator.set(v.vote_account, {
    id: id as ValidatorId,
    name: v.name,
    icon: v.pt_sol,
  });
}

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

    const validatorInfo = voteAccountToValidator.get(delegation.voter);

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
      validatorName: validatorInfo?.name ?? "Unknown Validator",
      validatorIcon: validatorInfo?.icon ?? "/solana-token.png",
      lamports: Number(delegation.stake ?? account.lamports),
      state,
    });
  }

  return results;
}
