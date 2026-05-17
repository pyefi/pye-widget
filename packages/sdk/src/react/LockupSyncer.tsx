import { useEffect } from "react";
import { useLockupStore } from "./providers";

/** Fetches canonical, visible bonds from solo_validator_bonds once on mount. */
export default function LockupSyncer() {
  const fetchAll = useLockupStore((s) => s.fetchAll);
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  return null;
}
