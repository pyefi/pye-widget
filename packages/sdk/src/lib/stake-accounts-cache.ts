import type { UserStakeAccount } from "../stores/balance-store";

const STORAGE_PREFIX = "pye.stakeAccounts.v1.";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

interface CachedPayload {
  timestamp: number;
  accounts: UserStakeAccount[];
}

function getStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readCachedStakeAccounts(
  publicKey: string,
): UserStakeAccount[] | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(STORAGE_PREFIX + publicKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedPayload;
    if (!parsed?.timestamp || !Array.isArray(parsed.accounts)) return null;
    if (Date.now() - parsed.timestamp > MAX_AGE_MS) return null;
    return parsed.accounts;
  } catch {
    return null;
  }
}

export function writeCachedStakeAccounts(
  publicKey: string,
  accounts: UserStakeAccount[],
): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    const payload: CachedPayload = { timestamp: Date.now(), accounts };
    storage.setItem(STORAGE_PREFIX + publicKey, JSON.stringify(payload));
  } catch {
    // Silently ignore quota / serialization errors — cache is a perf hint, not correctness.
  }
}
