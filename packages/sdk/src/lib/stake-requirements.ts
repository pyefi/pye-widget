import { Connection, PublicKey, StakeProgram } from "@solana/web3.js";
import { deriveStakeAccount } from "./pdas";

const minDelegationCache = new Map<string, Promise<number>>();
const rentExemptCache = new Map<string, Promise<number>>();

/** Network minimum stake delegation in lamports (1 SOL since SIMD-0490). */
export function getStakeMinimumDelegationLamports(
  connection: Connection,
): Promise<number> {
  const key = connection.rpcEndpoint;
  const cached = minDelegationCache.get(key);
  if (cached !== undefined) return cached;
  const promise = connection
    .getStakeMinimumDelegation()
    .then((res) => res.value)
    .catch((err) => {
      minDelegationCache.delete(key);
      return Promise.reject(err);
    });
  minDelegationCache.set(key, promise);
  return promise;
}

/** Rent-exempt reserve for a stake account in lamports. */
export function getStakeRentExemptLamports(
  connection: Connection,
): Promise<number> {
  const key = connection.rpcEndpoint;
  const cached = rentExemptCache.get(key);
  if (cached !== undefined) return cached;
  const promise = connection
    .getMinimumBalanceForRentExemption(StakeProgram.space)
    .catch((err) => {
      rentExemptCache.delete(key);
      return Promise.reject(err);
    });
  rentExemptCache.set(key, promise);
  return promise;
}

export interface FirstDepositRequirement {
  /** True when the lockup's stake account PDA does not exist yet. */
  isFirstDeposit: boolean;
  /**
   * Extra liquid lamports the bonds program pulls from the depositor's wallet to
   * initialize the lockup stake account (credited back as PT/YT). Zero when the
   * lockup is already initialized.
   */
  requiredExtraLamports: number;
}

export async function getFirstDepositRequirement(
  connection: Connection,
  bondPubkey: string | PublicKey,
): Promise<FirstDepositRequirement> {
  const stakePda = deriveStakeAccount(new PublicKey(bondPubkey));
  const info = await connection.getAccountInfo(stakePda);
  if (info != null) return { isFirstDeposit: false, requiredExtraLamports: 0 };
  const [min, rent] = await Promise.all([
    getStakeMinimumDelegationLamports(connection),
    getStakeRentExemptLamports(connection),
  ]);
  return { isFirstDeposit: true, requiredExtraLamports: min + rent };
}

/**
 * Which of these lockups have never received a deposit? A lockup's stake PDA is
 * created on first deposit, so a missing PDA means uninitialized. No caching —
 * status changes whenever anyone deposits.
 */
export async function getUninitializedLockups(
  connection: Connection,
  bondPubkeys: string[],
): Promise<Set<string>> {
  if (bondPubkeys.length === 0) return new Set();
  const pdas = bondPubkeys.map((b) => deriveStakeAccount(new PublicKey(b)));
  const infos = await connection.getMultipleAccountsInfo(pdas);
  return new Set(bondPubkeys.filter((_, i) => infos[i] == null));
}
