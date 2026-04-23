import { useEffect, useRef } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { address as toAddress } from "@solana/kit";
import { useWalletStore } from "./providers";
import { markConnectIntent, clearConnectIntent } from "../lib/session-connect-intent";

function shortenAddress(address: string): string {
  return address.slice(0, 4) + "..." + address.slice(-4);
}

/**
 * Invisible component that syncs the Solana wallet adapter state into the
 * Zustand wallet store.
 */
export default function WalletSyncer() {
  const { publicKey, connected, connecting } = useWallet();
  const { connection } = useConnection();
  const fetchedKeyRef = useRef<string | null>(null);
  // Tracks whether this mount has ever seen a connected state. Gates
  // clearConnectIntent() so the initial "not yet connected" render
  // doesn't wipe the sessionStorage flag before WalletProvider reads it.
  const hasConnectedRef = useRef(false);

  const setWalletStatus = useWalletStore((s) => s.setWalletStatus);
  const setWalletPublicKey = useWalletStore((s) => s.setWalletPublicKey);
  const setDisplayAddress = useWalletStore((s) => s.setDisplayAddress);
  const setBalanceLamports = useWalletStore((s) => s.setBalanceLamports);
  const setWalletInitialized = useWalletStore((s) => s.setWalletInitialized);
  const resetWallet = useWalletStore((s) => s.resetWallet);

  const fetchBalance = async (retries = 3) => {
    if (!publicKey || !connection) return;
    for (let i = 0; i < retries; i++) {
      try {
        const balance = await connection.getBalance(publicKey, "confirmed");
        console.log("[WalletSyncer] balanceLamports:", balance);
        setBalanceLamports(balance);
        return;
      } catch {
        if (i < retries - 1) {
          await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
        }
      }
    }
    console.warn("[WalletSyncer] balance fetch failed after all retries");
    setBalanceLamports(null);
  };

  useEffect(() => {
    setWalletInitialized(true);

    if (connecting) {
      setWalletStatus("connecting");
    } else if (connected && publicKey) {
      const base58 = publicKey.toBase58();
      if (fetchedKeyRef.current && fetchedKeyRef.current !== base58) {
        console.log("[WalletSyncer] wallet changed:", fetchedKeyRef.current, "→", base58);
      }
      setWalletStatus("connected");
      setWalletPublicKey(toAddress(base58));
      setDisplayAddress(shortenAddress(base58));
      hasConnectedRef.current = true;
      markConnectIntent();
      if (fetchedKeyRef.current !== base58) {
        fetchedKeyRef.current = base58;
        fetchBalance();
      }
    } else {
      if (hasConnectedRef.current) {
        clearConnectIntent();
        hasConnectedRef.current = false;
      }
      resetWallet();
      fetchedKeyRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, connecting, publicKey]);

  useEffect(() => {
    if (!connected || !publicKey) return;
    const interval = setInterval(() => fetchBalance(1), 30_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, publicKey?.toBase58()]);

  useEffect(() => {
    if (!connected || !publicKey || !connection) return;
    const id = connection.onAccountChange(
      publicKey,
      (accountInfo) => setBalanceLamports(accountInfo.lamports),
      "confirmed",
    );
    return () => {
      connection.removeAccountChangeListener(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, publicKey?.toBase58(), connection]);

  return null;
}
