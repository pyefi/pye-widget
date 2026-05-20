import { useWidgetStore } from "../../stores/widget-store";
import { useWalletStore } from "@pyefi/sdk/react";
import { c, font, displayFont } from "../design-system";
import { CTA } from "../shared/Layout";

function BenefitRow({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "10px 4px",
    }}>
      <div style={{
        flexShrink: 0,
        width: 40,
        height: 40,
        borderRadius: 8,
        background: c.raised,
        borderTop: `1px solid ${c.highlight}`,
        boxShadow: `inset 0 -1px 0 ${c.shadow}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: c.primary,
      }}>{icon}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <p style={font(13, c.primary, 600)}>{title}</p>
        <p style={font(12, c.secondary)}>{body}</p>
      </div>
    </div>
  );
}

const BoltIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
);
const ShieldIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);
const ClockIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
);

export default function YieldForwardIntro() {
  const navigate = useWidgetStore((s) => s.navigate);
  const walletStatus = useWalletStore((s) => s.status);
  const isConnected = walletStatus === "connected";

  return (
    <>
      <p style={{ ...displayFont(32, c.primary, 600), letterSpacing: "-0.02em", lineHeight: 1.3 }}>
        Sell your future staking rewards. Get SOL now.
      </p>

      <p style={font(15, c.secondary)}>
        The simplest way to access your staking rewards early.
      </p>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <BenefitRow icon={BoltIcon} title="Instant Liquidity" body="Get SOL today for future rewards" />
        <BenefitRow icon={ShieldIcon} title="Non-Custodial" body="Your stake stays with your validator" />
        <BenefitRow icon={ClockIcon} title="Flexible Terms" body="Choose your payout duration" />
      </div>

      <div style={{ marginTop: "auto" }}>
        <CTA
          label="Get Started"
          onClick={() => navigate(isConnected ? "select-position" : "connect-wallet")}
          purple
        />
      </div>
    </>
  );
}
