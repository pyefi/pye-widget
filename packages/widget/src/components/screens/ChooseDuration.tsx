import { useState } from "react";
import { useWidgetStore } from "../../stores/widget-store";
import { maturityIdsArray, type MaturityId } from "@pye/sdk";
import { useMarketStore } from "@pye/sdk/react";
import { c, font, displayFont, MARKET_RATE, yieldMap } from "../design-system";
import { CTA, Tooltip, Spacer } from "../shared/Layout";

/** Map maturity IDs to Dan's quarter objects with full date labels */
const QUARTER_MAP: Record<string, { id: string; label: string; pts: string | null }> = {
  "2025Q2": { id: "Q2", label: "30 Jun 2026", pts: null },
  "2025Q3": { id: "Q3", label: "30 Sep 2026", pts: "2x points" },
  "2025Q4": { id: "Q4", label: "31 Dec 2026", pts: "3x points" },
  "2026Q1": { id: "Q1", label: "31 Mar 2027", pts: "4x points" },
};

export default function ChooseDuration() {
  const navigate = useWidgetStore((s) => s.navigate);
  const selectedMaturityId = useWidgetStore((s) => s.selectedMaturityId);
  const setSelectedMaturity = useWidgetStore((s) => s.setSelectedMaturity);
  const depositAmount = useWidgetStore((s) => s.depositAmount);
  const selectedBalance = useWidgetStore((s) => s.selectedStakeAccountBalance);
  const markets = useMarketStore((s) => s.markets);

  const [hoveredPill, setHoveredPill] = useState<string | null>(null);

  const parsedAmount = parseFloat(depositAmount) || 0;
  const fullAmount = selectedBalance || 25.0111;

  // Build quarter options from maturityIdsArray
  const quarters = maturityIdsArray
    .map((matId) => {
      const q = QUARTER_MAP[matId];
      if (!q) return null;
      return { matId, ...q };
    })
    .filter(Boolean) as Array<{ matId: string; id: string; label: string; pts: string | null }>;

  // If no maturityIdsArray entries match, use hardcoded fallback
  const displayQuarters = quarters.length > 0 ? quarters : [
    { matId: "2025Q2" as string, id: "Q2", label: "30 Jun 2026", pts: null },
    { matId: "2025Q3" as string, id: "Q3", label: "30 Sep 2026", pts: "2x points" },
    { matId: "2025Q4" as string, id: "Q4", label: "31 Dec 2026", pts: "3x points" },
    { matId: "2026Q1" as string, id: "Q1", label: "31 Mar 2027", pts: "4x points" },
  ];

  // Find selected quarter info
  const sel = displayQuarters.find((q) => q.matId === selectedMaturityId);

  // Compute yield from real market data or fallback
  const ptMarketKey = selectedMaturityId
    ? Object.keys(markets).find((k) => k.endsWith(`-${selectedMaturityId}-PT`))
    : null;
  const ptMarket = ptMarketKey ? markets[ptMarketKey] : null;
  const bestAsk = ptMarket?.bestAskPrice ?? null;

  const grossYield = sel
    ? bestAsk != null
      ? (1 - bestAsk) * parsedAmount
      : ((yieldMap[sel.id] || MARKET_RATE) * (parsedAmount / fullAmount))
    : 0;

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
          {displayQuarters.map((q) => {
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
              +{grossYield.toFixed(3)} SOL
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
