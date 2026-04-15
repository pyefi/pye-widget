import { useWidgetStore } from "../../stores/widget-store";
import { maturities } from "@pye/sdk";
import { c, font, displayFont, pointsMap, formatSolAmount } from "../design-system";
import { Body, CTA, Tooltip, Spacer, SuccessHeader } from "../shared/Layout";

export default function StepComplete() {
  const reset = useWidgetStore((s) => s.reset);
  const txSignature = useWidgetStore((s) => s.txSignature);
  const depositAmount = useWidgetStore((s) => s.depositAmount);
  const selectedMaturityId = useWidgetStore((s) => s.selectedMaturityId);
  const sellAmountSol = useWidgetStore((s) => s.sellAmountSol);

  const parsedAmount = parseFloat(depositAmount) || 0;
  const sellAmount = sellAmountSol ?? 0;

  // Resolve maturity from real SDK data
  const maturity = selectedMaturityId ? maturities[selectedMaturityId] : null;
  const matures = maturity?.human_readable ?? "Sep 30, 2026";

  // Points label
  const monthToQuarter: Record<string, string> = { JUN: "Q3", SEP: "Q4", DEC: "Q1", MAR: "Q2" };
  const quarterId = maturity ? (monthToQuarter[maturity.month] ?? null) : null;

  const solscanUrl = txSignature
    ? `https://solscan.io/tx/${txSignature}`
    : "https://solscan.io";

  return (
    <>
      <SuccessHeader label="Transaction confirmed" onClose={() => reset()} />

      <Body>
        <p style={font(12, c.secondary)}>Your future staking rewards have been sold upfront.</p>

        {/* Amount received — mirrors StepQuote hero card */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{
            background: c.lowered,
            borderTop: `1px solid ${c.shadow}`,
            boxShadow: `inset 0 -1px 0 ${c.highlight}`,
            borderRadius: "6px 6px 0 0",
            padding: 12,
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            <p style={font(12, c.secondary)}>Rewards sold upfront</p>
            <p style={{ ...displayFont(32, c.green), lineHeight: 1.2, fontVariantNumeric: "lining-nums tabular-nums" }}>
              +{formatSolAmount(sellAmount)} SOL
            </p>
          </div>
          {/* PT + maturity */}
          <div style={{
            background: c.lowered,
            borderTop: `1px solid ${c.shadow}`,
            boxShadow: `inset 0 -1px 0 ${c.highlight}`,
            borderRadius: "0 0 6px 6px",
            padding: 12,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <p style={font(12, c.primary)}>+{parsedAmount} PT in your wallet</p>
                <Tooltip text="A PT (Principal Token) is a 1:1 tokenised claim on your staked SOL. It accrues no rewards — those were sold upfront. Redeem it at maturity to get your full stake back." />
              </div>
              <p style={font(11, c.secondary)}>Your staked SOL, returned to you {matures}</p>
            </div>
            <a
              href={solscanUrl}
              target="_blank"
              rel="noreferrer"
              style={{ ...font(12, c.purple), textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
            >
              Solscan
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M7 1h4v4M11 1L5.5 6.5M5 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>

        <Spacer />

        {/* Stay updated */}
        <div style={{
          background: c.raised,
          borderTop: `1px solid ${c.highlight}`,
          boxShadow: `inset 0 -1px 0 ${c.shadow}`,
          borderRadius: 6, padding: 12,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            <p style={font(12, c.primary)}>Get notified when your PT matures</p>
            <a href="https://pye.fi/blog/understanding-pts" target="_blank" rel="noreferrer"
              style={{ ...font(11, c.secondary), textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              Learn more about PTs
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M7 1h4v4M11 1L5.5 6.5M5 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0, alignSelf: "center" }}>
            <a href="https://t.me/pyefi" target="_blank" rel="noreferrer"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 6, background: c.highlight, borderTop: `1px solid ${c.highlight}`, boxShadow: `inset 0 -1px 0 ${c.shadow}`, textDecoration: "none" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill={c.secondary}>
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </a>
            <a href="https://x.com/pye_fi" target="_blank" rel="noreferrer"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 6, background: c.highlight, borderTop: `1px solid ${c.highlight}`, boxShadow: `inset 0 -1px 0 ${c.shadow}`, textDecoration: "none" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill={c.secondary}>
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </div>

        <CTA label="Sell more rewards" onClick={() => reset()} />
      </Body>
    </>
  );
}
