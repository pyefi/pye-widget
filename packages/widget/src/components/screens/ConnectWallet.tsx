import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWidgetStore } from "../../stores/widget-store";
import { useWalletStore } from "@pye/sdk/react";
import { c, font } from "../design-system";
import { StepTitle, RowGroup, Spacer } from "../shared/Layout";
import { WalletDot } from "../Icons";

// ─── Sub-component: WalletRow ────────────────────────────────────────────────

interface WalletRowProps {
  name: string;
  iconUrl?: string;
  connecting: string | null;
  onConnect: (name: string) => void;
}

function WalletRow({ name, iconUrl, connecting, onConnect }: WalletRowProps) {
  const isConnecting = connecting === name;
  const isDimmed = connecting != null && !isConnecting;

  return (
    <div
      className={!connecting ? "pye-hoverable" : undefined}
      onClick={() => !connecting && onConnect(name)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: 12, borderRadius: 8,
        background: c.raised,
        boxShadow: `inset 0 1px 0 ${c.highlight}, inset 0 -1px 0 ${c.shadow}`,
        cursor: connecting ? "default" : "pointer",
        opacity: isDimmed ? 0.4 : 1,
        transition: "background 0.1s, opacity 0.2s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {iconUrl ? (
          <img src={iconUrl} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }} />
        ) : (
          <WalletDot name={name} size={32} />
        )}
        <p style={font(15, c.primary)}>{name}</p>
      </div>
      <p style={font(14, isConnecting ? c.purple : c.secondary)}>
        {isConnecting ? "Connecting\u2026" : "Detected"}
      </p>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function ConnectWallet() {
  const { wallets, wallet, select, connect, disconnect } = useWallet();
  const navigate = useWidgetStore((s) => s.navigate);
  const walletStatus = useWalletStore((s) => s.status);
  const connecting = useWidgetStore((s) => s.connectingWallet);
  const setConnecting = useWidgetStore((s) => s.setConnectingWallet);
  const [pendingWalletName, setPendingWalletName] = useState<string | null>(null);

  // Auto-advance when wallet connects
  useEffect(() => {
    if (walletStatus === "connected") {
      navigate("welcome");
    }
  }, [walletStatus, navigate]);

  // `select()` is a React state setter — the `wallet` object only updates on
  // the next render, so calling `connect()` in the same tick sees a stale
  // null wallet and throws WalletNotSelectedError. Previously this happened
  // to work for browser-extension adapters because autoConnect pre-selected
  // them on mount, but adapters like WalletConnect (no extension, requires
  // interaction) exposed the race. Fix: select, let React flush, then
  // connect from this effect once `wallet` reflects our pick. Timeout guards
  // against the wallet change never arriving (e.g. WalletConnect adapter
  // stuck mid-disconnect after the user X'd the QR modal).
  useEffect(() => {
    if (!pendingWalletName) return;
    if (wallet?.adapter.name !== pendingWalletName) {
      const timer = setTimeout(() => {
        setConnecting(null);
        setPendingWalletName(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
    connect()
      .catch(() => setConnecting(null))
      .finally(() => setPendingWalletName(null));
  }, [pendingWalletName, wallet, connect, setConnecting]);

  const handleConnect = async (walletName: string) => {
    const adapter = wallets.find((w) => w.adapter.name === walletName);
    if (!adapter) return;

    // Cancelling the AppKit QR modal doesn't reject WalletConnect's pending
    // `connect()`, so the adapter stays mid-pairing. Calling `select()` next
    // makes wallet-adapter-react run disconnect on the previous adapter,
    // which then hangs and blocks the switch. Pre-empt it: kick off a
    // disconnect ourselves but race it against a short timeout so a stuck
    // adapter can't freeze the flow.
    if (wallet && wallet.adapter.name !== walletName) {
      await Promise.race([
        disconnect().catch(() => {}),
        new Promise((r) => setTimeout(r, 1000)),
      ]);
    }

    setConnecting(walletName);
    setPendingWalletName(walletName);
    select(adapter.adapter.name);
  };

  // Dedupe by adapter name — wallet-adapter-react merges explicit adapters
  // with Wallet Standard auto-discovery, and for some wallets (e.g.
  // MetaMask's Solana snap) the same name shows up twice, causing React
  // duplicate-key warnings and flaky select() behavior since `select(name)`
  // can bind to whichever instance the provider picks first.
  const uniqueWallets = Array.from(
    new Map(wallets.map((w) => [w.adapter.name, w])).values(),
  );

  // Sort: detected wallets first
  const sortedWallets = [...uniqueWallets].sort((a, b) => {
    const aDetected = a.readyState === "Installed" ? 0 : 1;
    const bDetected = b.readyState === "Installed" ? 0 : 1;
    return aDetected - bDetected;
  });

  return (
    <>
      <StepTitle
        title="Connect your wallet"
        subtitle="Connect to see your existing stake and SOL balance."
      />
      <RowGroup>
        {sortedWallets.map((w) => (
          <WalletRow
            key={w.adapter.name}
            name={w.adapter.name}
            iconUrl={w.adapter.icon}
            connecting={connecting}
            onConnect={handleConnect}
          />
        ))}
      </RowGroup>
      <Spacer />
    </>
  );
}
