import { useWidgetStore } from "../../stores/widget-store";
import { useWalletStore } from "@pye/sdk/react";
import { c, font, displayFont } from "../design-system";
import { Spacer, CTA } from "../shared/Layout";

export default function YieldForwardIntro() {
  const navigate = useWidgetStore((s) => s.navigate);
  const walletStatus = useWalletStore((s) => s.status);
  const isConnected = walletStatus === "connected";

  return (
    <>
      <p style={{ ...displayFont(45, c.primary), letterSpacing: "-0.02em", whiteSpace: "pre-wrap" }}>
        {"Your rewards,\nwithout the wait."}
      </p>

      <Spacer />

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={font(12, c.primary)}>Example: Stake 100 SOL for 6 months</p>

          {/* Comparison cards */}
          <div style={{ display: "flex", gap: 8 }}>
            {/* Left -- sell today */}
            <div style={{
              flex: 1, borderRadius: 6, padding: 12,
              background: c.raised,
              borderTop: `1px solid ${c.highlight}`,
              boxShadow: `0 4px 8px rgba(0,0,0,0.07), inset 0 -1px 0 ${c.shadow}`,
            }}>
              <p style={font(12, c.secondary)}>Sell today</p>
              <p style={{ ...displayFont(24, c.green), fontVariantNumeric: "lining-nums tabular-nums", lineHeight: 1.2, margin: "4px 0 2px" }}>+0.8414</p>
              <p style={font(12, c.secondary)}>Yours now</p>
            </div>
            {/* Right -- hold to unlock */}
            <div style={{
              flex: 1, borderRadius: 6, padding: 12,
              background: c.lowered,
              borderTop: `1px solid ${c.shadow}`,
              boxShadow: `inset 0 -1px 0 ${c.highlight}`,
            }}>
              <p style={font(12, c.secondary)}>Hold to unlock</p>
              <p style={{ ...displayFont(24, c.primary), fontVariantNumeric: "lining-nums tabular-nums", lineHeight: 1.2, margin: "4px 0 2px" }}>+0.8500</p>
              <p style={font(12, c.secondary)}>Available Sep 2026</p>
            </div>
          </div>

          <p style={font(12, c.secondary)}>0.0086 SOL less. Six months back.</p>
        </div>

        <CTA
          label={isConnected ? "Continue" : "Connect Wallet"}
          onClick={() => navigate(isConnected ? "select-position" : "connect-wallet")}
          purple
        />
      </div>
    </>
  );
}
