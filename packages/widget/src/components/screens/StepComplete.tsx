import { useWidgetStore } from "../../stores/widget-store";
import { maturities } from "@pyefi/sdk";
import { c, font, formatSolAmount } from "../design-system";
import { Body, CTA, Tooltip, Spacer, SuccessHeader, SupportCard } from "../shared/Layout";
import { Odometer } from "../shared/Odometer";

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

  const solscanUrl = txSignature
    ? `https://solscan.io/tx/${txSignature}`
    : "https://solscan.io";

  return (
    <>
      <SuccessHeader label="Transaction confirmed" onClose={() => reset()} />

      <Body>
        <p style={font(14, c.secondary)}>Your future staking rewards have been sold upfront.</p>

        {/* Summary — stacked rows matching ReviewQuote layout */}
        {(() => {
          const rows: Array<{ key: string; left: React.ReactNode; right: React.ReactNode }> = [
            {
              key: "received",
              left: <p style={font(14, c.secondary)}>Rewards sold upfront</p>,
              right: (
                <Odometer
                  value={`+${formatSolAmount(sellAmount)} SOL`}
                  style={{ ...font(15, c.green, 500), whiteSpace: "nowrap", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}
                />
              ),
            },
            {
              key: "pt",
              left: (
                <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                  <p style={font(14, c.secondary)}>PT received</p>
                  <Tooltip text="A PT (Principal Token) is a 1:1 tokenised claim on your staked SOL. It accrues no rewards — those were sold upfront. Redeem it at maturity to get your full stake back." />
                </div>
              ),
              right: (
                <Odometer
                  value={`+${parsedAmount} PT`}
                  style={{ ...font(14, c.primary), whiteSpace: "nowrap", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}
                />
              ),
            },
            {
              key: "stake",
              left: <p style={font(14, c.secondary)}>Stake returned</p>,
              right: (
                <p style={{ ...font(14, c.primary), whiteSpace: "nowrap", flexShrink: 0 }}>
                  {matures}
                </p>
              ),
            },
            {
              key: "tx",
              left: <p style={font(14, c.secondary)}>Transaction</p>,
              right: (
                <a
                  href={solscanUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ ...font(14, c.purple), textDecoration: "none", display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}
                >
                  Solscan
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M7 1h4v4M11 1L5.5 6.5M5 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              ),
            },
          ];

          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {rows.map((row, i) => {
                const isFirst = i === 0;
                const isLast = i === rows.length - 1;
                const radius = isFirst && isLast
                  ? 8
                  : isFirst
                    ? "8px 8px 0 0"
                    : isLast
                      ? "0 0 8px 8px"
                      : 0;
                return (
                  <div
                    key={row.key}
                    style={{
                      background: c.lowered,
                      borderTop: `1px solid ${c.shadow}`,
                      boxShadow: `inset 0 -1px 0 ${c.highlight}`,
                      borderRadius: radius,
                      padding: "12px 12px",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    {row.left}
                    {row.right}
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* Wallet visibility notice */}
        <div style={{
          background: c.raised,
          borderTop: `1px solid ${c.highlight}`,
          boxShadow: `inset 0 -1px 0 ${c.shadow}`,
          borderRadius: 8, padding: 12,
          display: "flex", alignItems: "flex-start", gap: 10,
        }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
            <circle cx="8" cy="8" r="6.5" stroke={c.secondary} strokeWidth="1.2"/>
            <path d="M8 7.5v3.5M8 5v.5" stroke={c.secondary} strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <p style={font(12, c.secondary)}>
            Your PT tokens may be hidden in your wallet — enable them via <span style={{ color: c.primary }}>Manage Tokens</span> to see your balance.
          </p>
        </div>

        <Spacer />

        <SupportCard />

        <CTA label="Sell more rewards" onClick={() => reset()} />
      </Body>
    </>
  );
}
