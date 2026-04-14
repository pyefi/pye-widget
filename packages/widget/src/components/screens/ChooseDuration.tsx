import { useEffect, useMemo } from "react";
import { useWidgetStore } from "../../stores/widget-store";
import { maturities, type MaturityId, lookupBondByVoteAccount } from "@pye/sdk";
import { useMarketStore } from "@pye/sdk/react";
import { c, font, displayFont, MARKET_RATE, formatSolAmount } from "../design-system";
import { CTA, Tooltip, Spacer } from "../shared/Layout";

/** Map SDK maturity IDs to Dan's display format */
const QUARTER_INFO: Record<MaturityId, { label: string; pts: string | null }> =
  {
    q22026: { label: "30 Jun 2026", pts: null },
    q32026: { label: "30 Sep 2026", pts: "2x points" },
    q42026: { label: "31 Dec 2026", pts: "3x points" },
    q12026: { label: "31 Mar 2026", pts: null },
  };

/** All maturity IDs in chronological order */
const ALL_MATURITIES: MaturityId[] = ["q12026", "q22026", "q32026", "q42026"];

const TWO_DAYS_S = 2 * 24 * 60 * 60;

/** Filter out maturities within 2 days of maturity date */
function getAvailableMaturities(): MaturityId[] {
  const nowS = Date.now() / 1000;
  return ALL_MATURITIES.filter((id) => {
    const ts = Number(maturities[id].maturity_timestamp);
    return ts - nowS > TWO_DAYS_S;
  });
}

export default function ChooseDuration() {
  const navigate = useWidgetStore((s) => s.navigate);
  const selectedMaturityId = useWidgetStore((s) => s.selectedMaturityId);
  const setSelectedMaturity = useWidgetStore((s) => s.setSelectedMaturity);
  const depositAmount = useWidgetStore((s) => s.depositAmount);
  const selectedValidatorVoteAccount = useWidgetStore((s) => s.selectedValidatorVoteAccount);
  const markets = useMarketStore((s) => s.markets);

  const availableMaturities = useMemo(() => getAvailableMaturities(), []);

  // Resolve the validator ID for validator-specific market lookup
  const stakeValidatorId = useMemo(() => {
    if (!selectedValidatorVoteAccount) return null;
    for (const matId of availableMaturities) {
      const lookup = lookupBondByVoteAccount(selectedValidatorVoteAccount, matId);
      if (lookup) return lookup.validatorId;
    }
    return null;
  }, [selectedValidatorVoteAccount, availableMaturities]);

  // Default to first available duration if none selected
  useEffect(() => {
    if (!selectedMaturityId && availableMaturities.length > 0) {
      setSelectedMaturity(availableMaturities[0]);
    }
  }, [selectedMaturityId, setSelectedMaturity, availableMaturities]);

  const parsedAmount = parseFloat(depositAmount) || 0;

  // Build display quarters from available maturities
  const quarters = availableMaturities.map((matId) => {
    const info = QUARTER_INFO[matId] ?? {
      label: maturities[matId]?.human_readable ?? matId,
      pts: null,
    };

    // Look up RT market data — bids represent what buyers will pay per RT
    // Use validator-specific key when available; fall back to generic lookup
    const rtMarketKey = stakeValidatorId
      ? `${stakeValidatorId}-${matId}-RT`
      : Object.keys(markets).find((k) => k.endsWith(`-${matId}-RT`));
    const rtMarket = rtMarketKey ? markets[rtMarketKey] ?? null : null;
    const bestBid = rtMarket?.bestBidPrice ?? null;

    // Gross yield: RT amount (1:1 with deposit) × best bid price (SOL per RT)
    // Fallback: MARKET_RATE is annual (0.85%), scaled by time remaining so Q2–Q4 differ
    const maturityTs = Number(maturities[matId].maturity_timestamp);
    const yearsRemaining = Math.max(0, (maturityTs - Date.now() / 1000) / (365.25 * 86400));
    const grossYield =
      bestBid != null
        ? bestBid * parsedAmount
        : parsedAmount * (MARKET_RATE / 100) * yearsRemaining;

    return { matId, ...info, bestBid, grossYield };
  });

  const sel = quarters.find((q) => q.matId === selectedMaturityId);

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <p style={font(14, c.primary)}>Choose a staking duration</p>
          <Tooltip position="below" text="Lock your stake until the chosen date. All staking rewards for the period are sold to you upfront today. Your full SOL stake is returned at maturity." />
        </div>
        <p style={font(12, c.secondary)}>
          All rewards for the period are paid to you today. Your stake is
          returned in full at the end.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Pill row */}
        <div style={{ display: "flex", gap: 8 }}>
          {quarters.map((q) => {
            const isSelected = selectedMaturityId === q.matId;
            return (
              <div
                key={q.matId}
                className={isSelected ? "pye-pill pye-pill--selected" : "pye-pill"}
                onClick={() => setSelectedMaturity(q.matId as MaturityId)}
                style={{
                  flex: 1,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 4,
                  cursor: "pointer",
                  background: isSelected ? c.bg : c.raised,
                  borderTop: `1px solid ${isSelected ? c.shadow : c.highlight}`,
                  boxShadow: isSelected
                    ? `inset 0 -1px 0 ${c.highlight}`
                    : `inset 0 -1px 0 ${c.shadow}`,
                  transition: "background 0.1s",
                }}
              >
                <span style={font(12, isSelected ? c.primary : c.secondary)}>
                  {q.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Yield card */}
        {sel && (
          <div
            style={{
              background: c.lowered,
              borderRadius: 6,
              padding: 12,
              borderTop: `1px solid ${c.shadow}`,
              boxShadow: `inset 0 -1px 0 ${c.highlight}`,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <p style={font(12, c.secondary)}>You receive today</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <p
                style={{
                  ...displayFont(32, c.green),
                  lineHeight: 1.2,
                  fontVariantNumeric: "lining-nums tabular-nums",
                }}
              >
                +{formatSolAmount(sel.grossYield, 3)} SOL
              </p>
            </div>
            {sel.pts && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <p style={font(12, c.purple)}>{sel.pts} multiplier</p>
                <Tooltip text="Longer durations earn a points multiplier on your locked position — 2x for Q3, 3x for Q4, and 4x for Q1. Points accumulate throughout your lockup period." />
              </div>
            )}
          </div>
        )}

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
