import { useEffect, useRef } from "react";
import { useWalletStore } from "@pyefi/sdk/react";
import { useWidgetStore } from "../stores/widget-store";

/**
 * Watches the connected wallet's publicKey and resets widget-store selection
 * state whenever the user switches accounts in their wallet (e.g. Phantom).
 * Without this, selectedStakeAccountPubkey / depositAmount / validator data
 * from the previous wallet persist and block the Sell Future Rewards flow.
 */
export default function WalletChangeWatcher() {
  const publicKey = useWalletStore((s) => s.publicKey);
  const resetForWalletChange = useWidgetStore((s) => s.resetForWalletChange);
  const prev = useRef<string | null>(null);

  useEffect(() => {
    const current = publicKey ? String(publicKey) : null;
    if (prev.current !== null && prev.current !== current) {
      resetForWalletChange();
    }
    prev.current = current;
  }, [publicKey, resetForWalletChange]);

  return null;
}
