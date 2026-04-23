const KEY = "pye.walletAutoConnect.v1";

function getStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function hasConnectIntent(): boolean {
  const storage = getStorage();
  if (!storage) return false;
  try {
    return storage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function markConnectIntent(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(KEY, "1");
  } catch {
    // quota/private-mode — cache is a perf hint, not correctness
  }
}

export function clearConnectIntent(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(KEY);
  } catch {
    // silently ignore
  }
}
