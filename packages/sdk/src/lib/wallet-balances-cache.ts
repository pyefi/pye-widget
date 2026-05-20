import type { Balances } from "../stores/balance-store";

const STORAGE_PREFIX = "pye.walletBalances.v1.";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

interface CachedPayload {
  timestamp: number;
  balances: Balances;
}

function getStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readCachedWalletBalances(publicKey: string): Balances | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(STORAGE_PREFIX + publicKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedPayload;
    if (!parsed?.timestamp || !parsed.balances || typeof parsed.balances !== "object") return null;
    if (Date.now() - parsed.timestamp > MAX_AGE_MS) return null;
    return parsed.balances;
  } catch {
    return null;
  }
}

export function writeCachedWalletBalances(
  publicKey: string,
  balances: Balances,
): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    const payload: CachedPayload = { timestamp: Date.now(), balances };
    storage.setItem(STORAGE_PREFIX + publicKey, JSON.stringify(payload));
  } catch {
    // Silently ignore quota / serialization errors — cache is a perf hint, not correctness.
  }
}
