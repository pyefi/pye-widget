import { useEffect, useMemo, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { useWidgetStore } from "../../stores/widget-store";
import {
  maturities,
  type MaturityId,
  PYE_TRADING_FEE_BPS,
  applyTradingFee,
  estimateRtFromStake,
  fetchEpochSyncedNowTs,
} from "@pyefi/sdk";
import { useMarketStore } from "@pyefi/sdk/react";
import { c, font, displayFont, MARKET_RATE, formatSolAmount, POINTS_ENABLED } from "../design-system";
import { CTA, Tooltip, Spacer } from "../shared/Layout";
import { Odometer } from "../shared/Odometer";

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
  const { connection } = useConnection();
  const navigate = useWidgetStore((s) => s.navigate);
  const selectedMaturityId = useWidgetStore((s) => s.selectedMaturityId);
  const setSelectedMaturity = useWidgetStore((s) => s.setSelectedMaturity);
  const depositAmount = useWidgetStore((s) => s.depositAmount);
  const selectedValidatorVoteAccount = useWidgetStore((s) => s.selectedValidatorVoteAccount);
  const markets = useMarketStore((s) => s.markets);

  // Epoch-synced wall-clock seconds — matches the on-chain "now" used by the
  // Bonds program when computing RT issuance, so our preview number stays in
  // sync with the real swap amount.
  const [nowTs, setNowTs] = useState<number | null>(null);
  useEffect(() => {
    fetchEpochSyncedNowTs(connection).then(setNowTs).catch(() => {
      setNowTs(Date.now() / 1000);
    });
  }, [connection]);

  // Only show maturities that have a canonical RT market for the selected
  // validator. Without a market we have no real price to quote against, so
  // hiding the row is more honest than showing a fabricated fallback rate.
  const availableMaturities = useMemo(() => {
    const timeFiltered = getAvailableMaturities();
    if (!selectedValidatorVoteAccount) return [];
    return timeFiltered.filter((matId) =>
      Boolean(markets[`${selectedValidatorVoteAccount}-${matId}-RT`]),
    );
  }, [selectedValidatorVoteAccount, markets]);

  // Default to first available duration if none selected, or clear if the
  // current selection is no longer available (e.g. markets refreshed).
  useEffect(() => {
    if (availableMaturities.length === 0) {
      if (selectedMaturityId) setSelectedMaturity(null);
      return;
    }
    if (!selectedMaturityId || !availableMaturities.includes(selectedMaturityId)) {
      setSelectedMaturity(availableMaturities[0]);
    }
  }, [selectedMaturityId, setSelectedMaturity, availableMaturities]);

  const parsedAmount = parseFloat(depositAmount) || 0;
  // Use epoch-synced now when available; fall back to wall-clock for the
  // first render before the RPC call resolves.
  const effectiveNowTs = nowTs ?? Date.now() / 1000;

  // Build display quarters from available maturities
  const quarters = availableMaturities.map((matId) => {
    const info = QUARTER_INFO[matId] ?? {
      label: maturities[matId]?.human_readable ?? matId,
      pts: null,
    };

    // availableMaturities already guarantees a validator-specific market.
    const rtMarket = markets[`${selectedValidatorVoteAccount}-${matId}-RT`];
    const bestBid = rtMarket?.bestBidPrice ?? null;

    // Bonds program mints RT proportional to remaining issuance window, so
    // we scale the deposit by time remaining to get the RT the user will
    // actually receive. Using `parsedAmount` here would overstate the quote.
    const maturity = maturities[matId];
    const estimatedRt = estimateRtFromStake({
      amountSol: parsedAmount,
      maturity,
      nowTs: effectiveNowTs,
    });

    // Gross yield: estimated RT × best bid price (SOL per RT)
    // Fallback: MARKET_RATE is annual (0.85%), scaled by time remaining so Q2–Q4 differ
    const maturityTs = Number(maturity.maturity_timestamp);
    const yearsRemaining = Math.max(0, (maturityTs - effectiveNowTs) / (365.25 * 86400));
    const grossYield =
      bestBid != null
        ? bestBid * estimatedRt
        : parsedAmount * (MARKET_RATE / 100) * yearsRemaining;
    // User-facing yield is net of Pye's taker fee
    const netYield = applyTradingFee(grossYield);

    return { matId, ...info, bestBid, grossYield, netYield };
  });

  const feePct = (PYE_TRADING_FEE_BPS / 100).toFixed(2);

  const sel = quarters.find((q) => q.matId === selectedMaturityId);

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <p style={font(18, c.primary, 500)}>Choose a staking duration</p>
          <Tooltip position="below" text="Lock your stake until the chosen date. All staking rewards for the period are sold to you upfront today. Your full SOL stake is returned at maturity." />
        </div>
        <p style={font(14, c.secondary)}>
          All rewards for the period are paid to you today. Your stake is
          returned in full at the end.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {quarters.length === 0 && (
          <div
            style={{
              background: c.lowered,
              borderRadius: 8,
              padding: 12,
              borderTop: `1px solid ${c.shadow}`,
              boxShadow: `inset 0 -1px 0 ${c.highlight}`,
            }}
          >
            <p style={font(14, c.primary, 500)}>No durations available</p>
            <p style={font(13, c.secondary)}>
              There aren't any active markets for this validator yet. Check
              back soon.
            </p>
          </div>
        )}

        {/* Duration rows — full width, one per row */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {quarters.map((q) => {
            const isSelected = selectedMaturityId === q.matId;
            return (
              <div
                key={q.matId}
                className={isSelected ? "pye-pill pye-pill--selected" : "pye-pill"}
                onClick={() => setSelectedMaturity(q.matId as MaturityId)}
                style={{
                  width: "100%",
                  minHeight: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 16px",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: isSelected ? c.bg : c.raised,
                  borderTop: `1px solid ${isSelected ? c.shadow : c.highlight}`,
                  boxShadow: isSelected
                    ? `inset 0 -1px 0 ${c.highlight}`
                    : `inset 0 -1px 0 ${c.shadow}`,
                  transition: "background 0.1s",
                }}
              >
                <span style={font(15, isSelected ? c.primary : c.secondary, isSelected ? 500 : 400)}>
                  {q.label}
                </span>
                {POINTS_ENABLED && q.pts && (
                  <span style={font(13, c.purple)}>{q.pts}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Yield card */}
        {sel && (
          <div
            style={{
              background: c.lowered,
              borderRadius: 8,
              padding: 12,
              borderTop: `1px solid ${c.shadow}`,
              boxShadow: `inset 0 -1px 0 ${c.highlight}`,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <p style={font(14, c.secondary)}>You receive today</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              {sel.netYield < 0.0001 ? (
                <p
                  style={{
                    ...displayFont(32, c.green),
                    lineHeight: 1.2,
                    fontVariantNumeric: "lining-nums tabular-nums",
                  }}
                >
                  &lt; 0.0001 SOL
                </p>
              ) : (
                <Odometer
                  value={`+${formatSolAmount(sel.netYield, 3)} SOL`}
                  style={{ ...displayFont(32, c.green), lineHeight: 1.2 }}
                />
              )}
            </div>
            <p style={font(12, c.muted)}>
              Quote includes a {feePct}% Pye protocol fee.
            </p>
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
