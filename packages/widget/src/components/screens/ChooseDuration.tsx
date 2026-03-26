import { useState } from "react";
import { useWidgetStore } from "../../stores/widget-store";
import { maturities, type MaturityId } from "@pye/sdk";
import { useMarketStore } from "@pye/sdk/react";
import { c, font, displayFont, MARKET_RATE } from "../design-system";
import { CTA, Tooltip, Spacer } from "../shared/Layout";

/** Map SDK maturity IDs to Dan's display format */
const QUARTER_INFO: Record<MaturityId, { label: string; pts: string | null }> = {
  q22026: { label: "30 Jun 2026", pts: null },
  q32026: { label: "30 Sep 2026", pts: "2x points" },
  q42026: { label: "31 Dec 2026", pts: "3x points" },
  q12026: { label: "31 Mar 2026", pts: null },
};

/** Only show future maturities (skip q12026 which is Mar 2026 — already past) */
const DISPLAY_MATURITIES: MaturityId[] = ["q22026", "q32026", "q42026"];

export default function ChooseDuration() {
  const navigate = useWidgetStore((s) => s.navigate);
  const selectedMaturityId = useWidgetStore((s) => s.selectedMaturityId);
  const setSelectedMaturity = useWidgetStore((s) => s.setSelectedMaturity);
  const depositAmount = useWidgetStore((s) => s.depositAmount);
  const markets = useMarketStore((s) => s.markets);

  const [hoveredPill, setHoveredPill] = useState<string | null>(null);

  const parsedAmount = parseFloat(depositAmount) || 0;

  // Build display quarters from real maturities
  const quarters = DISPLAY_MATURITIES.map((matId) => {
    const info = QUARTER_INFO[matId] ?? {
      label: maturities[matId]?.human_readable ?? matId,
      pts: null,
    };

    // Look up real market data
    const ptMarketKey = Object.keys(markets).find((k) => k.endsWith(`-${matId}-PT`));
    const ptMarket = ptMarketKey ? markets[ptMarketKey] : null;
    const bestAsk = ptMarket?.bestAskPrice ?? null;

    // Yield: real market → discount rate applied to amount
    const grossYield = bestAsk != null
      ? (1 - bestAsk) * parsedAmount
      : parsedAmount * (MARKET_RATE / 100); // fallback: ~0.85% of amount

    return { matId, ...info, bestAsk, grossYield };
  });

  const sel = quarters.find((q) => q.matId === selectedMaturityId);

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <p style={font(14, c.primary)}>Choose a staking duration</p>
          <Tooltip text="Lock your stake until the chosen date. All staking rewards for the period are sold to you upfront today. Your full SOL stake is returned at maturity." />
        </div>
        <p style={font(12, c.secondary)}>All rewards for the period are paid to you today. Your stake is returned in full at the end.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Pill row */}
        <div style={{ display: "flex", gap: 8 }}>
          {quarters.map((q) => {
            const isSelected = selectedMaturityId === q.matId;
            const isHovered = hoveredPill === q.matId && !isSelected;
            return (
              <div
                key={q.matId}
                onClick={() => setSelectedMaturity(q.matId as MaturityId)}
                onMouseEnter={() => setHoveredPill(q.matId)}
                onMouseLeave={() => setHoveredPill(null)}
                style={{
                  flex: 1, height: 32,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: 4, cursor: "pointer",
                  background: isSelected ? c.bg : isHovered ? c.highlight : c.raised,
                  borderTop: `1px solid ${isSelected ? c.shadow : c.highlight}`,
                  boxShadow: isSelected
                    ? `inset 0 -1px 0 ${c.highlight}`
                    : `inset 0 -1px 0 ${c.shadow}`,
                  transition: "background 0.1s",
                }}
              >
                <span style={font(12, isSelected ? c.primary : c.secondary)}>{q.label}</span>
              </div>
            );
          })}
        </div>

        {/* Yield card */}
        {sel && (
          <div style={{
            background: c.lowered, borderRadius: 6, padding: 12,
            borderTop: `1px solid ${c.shadow}`,
            boxShadow: `inset 0 -1px 0 ${c.highlight}`,
            display: "flex", flexDirection: "column", gap: 4,
          }}>
            <p style={font(12, c.secondary)}>You receive today</p>
            <p style={{ ...displayFont(32, c.green), lineHeight: 1.2, fontVariantNumeric: "lining-nums tabular-nums" }}>
              +{sel.grossYield.toFixed(3)} SOL
            </p>
            {sel.pts && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <p style={font(12, c.purple)}>{sel.pts} multiplier</p>
                <Tooltip text="Longer durations earn a points multiplier on your locked position — 2x for Q3, 3x for Q4, and 4x for Q1. Points accumulate throughout your lockup period." />
              </div>
            )}
          </div>
        )}

        {/* Early exit note */}
        <p style={font(12, c.secondary)}>
          Need to exit early? You can sell your locked position at{" "}
          <a href="https://app.pye.fi/trade" target="_blank" rel="noreferrer"
            style={{ color: c.secondary, textDecoration: "underline" }}>
            app.pye.fi/trade
          </a>
          .
        </p>
      </div>

      <Spacer />
      <CTA
        label="Review"
        onClick={() => navigate("review-quote")}
        disabled={!selectedMaturityId}
        purple
      />
    </>
  );
}
