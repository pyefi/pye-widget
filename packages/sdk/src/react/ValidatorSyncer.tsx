import { useEffect } from "react";
import { useValidatorStore } from "./providers";

/** Fetches validator_metadata_configs once on mount. */
export default function ValidatorSyncer() {
  const fetchAll = useValidatorStore((s) => s.fetchAll);
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  return null;
}
