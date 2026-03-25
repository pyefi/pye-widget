import { Connection, PublicKey } from "@solana/web3.js";
import { validators, type ValidatorId } from "../constants/validators";
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
  const [accounts, epochInfo] = await Promise.all([
    connection.getParsedProgramAccounts(STAKE_PROGRAM_ID, {
      filters: [
        { dataSize: 200 },
        {
          memcmp: {
            offset: 12,
            bytes: owner.toBase58(),
          },
        },
      ],
    }),
    connection.getEpochInfo(),
  ]);

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
