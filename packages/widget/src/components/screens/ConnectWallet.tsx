import { useEffect } from "react";
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
  const { wallets, select, connect } = useWallet();
  const navigate = useWidgetStore((s) => s.navigate);
  const walletStatus = useWalletStore((s) => s.status);
  const connecting = useWidgetStore((s) => s.connectingWallet);
  const setConnecting = useWidgetStore((s) => s.setConnectingWallet);

  // Auto-advance when wallet connects
  useEffect(() => {
    if (walletStatus === "connected") {
      navigate("welcome");
    }
  }, [walletStatus, navigate]);

  const handleConnect = async (walletName: string) => {
    const adapter = wallets.find((w) => w.adapter.name === walletName);
    if (!adapter) return;

    setConnecting(walletName);
    try {
      select(adapter.adapter.name);
      await connect();
    } catch {
      setConnecting(null);
    }
  };

  // Sort: detected wallets first
  const sortedWallets = [...wallets].sort((a, b) => {
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
