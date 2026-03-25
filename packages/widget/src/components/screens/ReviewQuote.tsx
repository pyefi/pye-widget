import { useCallback, useRef } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWidgetStore } from "../../stores/widget-store";
import {
  type MaturityId,
  executeStakeAccountDeposit,
  executeSwap,
} from "@pye/sdk";
import { useMarketStore } from "@pye/sdk/react";
import { c, font, displayFont, MARKET_RATE, yieldMap, pointsMap } from "../design-system";
import { StepTitle, CTA, Tooltip } from "../shared/Layout";

/* ═══════════════════════════════════════════════════════════════════════════
   DiscountSlider -- Dan's exact pointer-capture slider (lines 1296-1370)
   ═══════════════════════════════════════════════════════════════════════════ */

function DiscountSlider({
  value,
  onChange,
}: {
  value: number;   // 0-5 float
  onChange: (v: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const MIN = 0, MAX = 5;
  const pct = ((value - MIN) / (MAX - MIN)) * 100;

  const computeValue = (clientX: number): number => {
    const rect = trackRef.current!.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const raw = MIN + (x / rect.width) * (MAX - MIN);
    return Math.round(raw * 100) / 100;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    trackRef.current!.setPointerCapture(e.pointerId);
    onChange(computeValue(e.clientX));
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.buttons === 0) return;
    onChange(computeValue(e.clientX));
  };

  const isBelowMarket = value < MARKET_RATE;
  const filledColor = isBelowMarket ? "#D93B3B" : "#0d9c5e";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* Track */}
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        style={{ position: "relative", height: 12, display: "flex", alignItems: "center", cursor: "pointer", userSelect: "none" }}
      >
        {/* Filled track (left of thumb) */}
        <div style={{
          position: "absolute", left: 0, width: `${pct}%`, height: 8,
          background: filledColor,
          borderRadius: pct > 98 ? "999px" : "999px 0 0 999px",
          borderTop: "1px solid rgba(255,255,255,0.3)",
          boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.2)",
          minWidth: pct > 0 ? 4 : 0,
        }} />
        {/* Unfilled track (right of thumb) */}
        <div style={{
          position: "absolute", left: `${pct}%`, right: 0, height: 8,
          background: c.bg,
          borderRadius: pct < 2 ? "999px" : "0 999px 999px 0",
          borderTop: `1px solid ${c.shadow}`,
          boxShadow: `inset 0 -1px 0 ${c.highlight}`,
        }} />
        {/* Thumb */}
        <div style={{
          position: "absolute", left: `calc(${pct}% - 8px)`,
          width: 16, height: 16, borderRadius: "50%",
          background: "#fdfcfc",
          borderTop: `1px solid ${c.highlight}`,
          boxShadow: `inset 0 -1px 0 ${c.shadow}`,
          zIndex: 1, flexShrink: 0,
        }} />
      </div>
      {/* Scale labels */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {["0%", "1%", "2%", "3%", "4%", "5%"].map((l) => (
          <span key={l} style={{
            ...font(12, c.secondary),
            textTransform: "uppercase" as const, letterSpacing: "0.04em",
            width: 24, textAlign: l === "0%" ? "left" : l === "5%" ? "right" : "center",
          }}>{l}</span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ReviewQuote -- Dan's StepQuote (lines 1507-1637)
   ═══════════════════════════════════════════════════════════════════════════ */

const QUARTERS_MAP: Record<string, string> = {
  "2025Q2": "Jun 30, 2026",
  "2025Q3": "Sep 30, 2026",
  "2025Q4": "Dec 31, 2026",
  "2026Q1": "Mar 31, 2027",
};

const QUARTER_ID_MAP: Record<string, string> = {
  "2025Q2": "Q2",
  "2025Q3": "Q3",
  "2025Q4": "Q4",
  "2026Q1": "Q1",
};

export default function ReviewQuote() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const navigate = useWidgetStore((s) => s.navigate);
  const txStatus = useWidgetStore((s) => s.txStatus);
  const txError = useWidgetStore((s) => s.txError);
  const setTxStatus = useWidgetStore((s) => s.setTxStatus);
  const advancedOpen = useWidgetStore((s) => s.advancedOpen);
  const setAdvancedOpen = useWidgetStore((s) => s.setAdvancedOpen);
  const discountRateBps = useWidgetStore((s) => s.discountRateBps);
  const setDiscountRateBps = useWidgetStore((s) => s.setDiscountRateBps);

  const depositAmount = useWidgetStore((s) => s.depositAmount);
  const selectedMaturityId = useWidgetStore((s) => s.selectedMaturityId);
  const selectedStakeAccountPubkey = useWidgetStore((s) => s.selectedStakeAccountPubkey);
  const selectedStakeAccountBalance = useWidgetStore((s) => s.selectedStakeAccountBalance);

  const markets = useMarketStore((s) => s.markets);

  const parsedAmount = parseFloat(depositAmount) || 0;
  const fullAmount = selectedStakeAccountBalance || 25.0111;
  const matures = selectedMaturityId ? (QUARTERS_MAP[selectedMaturityId] || "Sep 30, 2026") : "Sep 30, 2026";
  const quarterId = selectedMaturityId ? (QUARTER_ID_MAP[selectedMaturityId] || "Q3") : "Q3";
  const points = pointsMap[quarterId] || null;

  // Market data
  const ptMarketKey = selectedMaturityId
    ? Object.keys(markets).find((k) => k.endsWith(`-${selectedMaturityId}-PT`))
    : null;
  const ptMarket = ptMarketKey ? markets[ptMarketKey] : null;
  const bestAsk = ptMarket?.bestAskPrice ?? 0;

  // Discount slider value as 0-5 float
  const discount = discountRateBps / 100;

  // Gross yield: use real market data or fallback
  const grossYield = bestAsk > 0
    ? (1 - bestAsk) * parsedAmount
    : (yieldMap[quarterId] || MARKET_RATE) * (parsedAmount / fullAmount);

  // Net sell amount: Dan's formula
  const sellAmount = parseFloat((grossYield - grossYield * (discount / 100) - 0.0043).toFixed(4));
  const feePct = ((1 - sellAmount / grossYield) * 100).toFixed(1);

  const isLoading = txStatus === "loading";
  const canSign = !!ptMarket && !!selectedStakeAccountPubkey && !!selectedMaturityId && !isLoading;

  const handleSign = useCallback(async () => {
    if (!ptMarket || !selectedStakeAccountPubkey || !selectedMaturityId) return;

    setTxStatus("loading");

    try {
      if (selectedStakeAccountPubkey === "liquid-sol") {
        await executeSwap({
          connection,
          wallet,
          marketPubkey: ptMarket.marketPubkey,
          orderSizeTokens: parsedAmount,
          maxPayTokens: parsedAmount,
          slippageBps: 100,
        });
      } else {
        await executeStakeAccountDeposit({
          connection,
          wallet,
          bondPubkey: ptMarket.bondPubkey,
          principalTokenMint: "",
          yieldTokenMint: "",
          validatorVoteAccount: "",
          stakeAccountPubkey: selectedStakeAccountPubkey,
          amountSol: parsedAmount,
          stakeBalanceSol: selectedStakeAccountBalance,
        });
      }
      setTxStatus("success");
      navigate("complete");
    } catch (err) {
      setTxStatus(
        "error",
        null,
        err instanceof Error ? err.message : "Transaction failed",
      );
    }
  }, [
    ptMarket,
    selectedStakeAccountPubkey,
    selectedMaturityId,
    connection,
    wallet,
    parsedAmount,
    selectedStakeAccountBalance,
    setTxStatus,
    navigate,
  ]);

  return (
    <>
      <StepTitle
        title="Your quote"
        subtitle="Estimated rewards sold upfront, net of fees."
      />

      {/* Hero quote card */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {/* Top: yield */}
        <div style={{
          background: c.lowered,
          borderTop: `1px solid ${c.shadow}`,
          boxShadow: `inset 0 -1px 0 ${c.highlight}`,
          borderRadius: "6px 6px 0 0",
          padding: 12,
          display: "flex", flexDirection: "column", gap: 12,
          overflow: "hidden",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <p style={font(12, c.secondary)}>You receive today</p>
            <Tooltip text="Estimated upfront payout based on current market rates, net of fees. The final amount is confirmed when your order fills on the Pye orderbook." />
          </div>
          <p style={{ ...displayFont(32, c.green), lineHeight: 1.2, fontVariantNumeric: "lining-nums tabular-nums" }}>
            +{sellAmount} SOL
          </p>
        </div>
        {/* Bottom: maturity + points */}
        <div style={{
          background: c.lowered,
          borderTop: `1px solid ${c.shadow}`,
          boxShadow: `inset 0 -1px 0 ${c.highlight}`,
          borderRadius: "0 0 6px 6px",
          padding: 12,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          overflow: "hidden",
        }}>
          <p style={font(12, c.secondary)}>
            <span style={{ color: c.primary }}>{parsedAmount} SOL</span>{` back ${matures}`}
          </p>
          {points && <p style={font(12, c.purple)}>{points}</p>}
        </div>
      </div>

      {/* Advanced toggle */}
      <div
        onClick={() => setAdvancedOpen(!advancedOpen)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: "pointer", padding: "2px 0", userSelect: "none",
        }}
      >
        <span style={font(12, c.secondary)}>Advanced</span>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{
          transform: advancedOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s",
        }}>
          <path d="M1 1L5 5L9 1" stroke={c.secondary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Advanced panel -- discount rate */}
      {advancedOpen && (
        <div style={{
          background: c.raised, borderRadius: 6, padding: 12,
          borderTop: `1px solid ${c.highlight}`,
          boxShadow: `inset 0 -1px 0 ${c.shadow}`,
          display: "flex", flexDirection: "column", gap: 16,
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={font(12, c.secondary)}>Your discount rate</span>
              <span style={font(12, c.secondary)}>Market: {MARKET_RATE.toFixed(2)}%</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ ...font(18, discount < MARKET_RATE ? c.red : c.primary), transition: "color 0.15s" }}>
                {discount.toFixed(2)}
              </span>
              <span style={font(12, c.secondary)}>% discount</span>
            </div>
            <DiscountSlider value={discount} onChange={(v) => setDiscountRateBps(Math.round(v * 100))} />
          </div>

          {/* Below-market warning */}
          {discount < MARKET_RATE && (
            <div style={{
              background: "rgba(255,181,77,0.15)",
              borderTop: "1px solid rgba(255,255,255,0.2)",
              boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.08)",
              borderRadius: 4, padding: 12,
              display: "flex", flexDirection: "column", gap: 2,
            }}>
              <p style={{ ...font(12, c.primary), fontWeight: 500 }}>Order unlikely to fill</p>
              <p style={font(12, c.secondary)}>Your rate is above market. Expect slow or no order execution.</p>
            </div>
          )}
        </div>
      )}

      {/* Orderbook disclosure */}
      <p style={font(12, c.secondary)}>
        Orders are matched on the{" "}
        <a href="https://app.pye.fi/trade" target="_blank" rel="noreferrer"
          style={{ color: c.secondary, textDecoration: "underline" }}>
          Pye orderbook
        </a>
        . Fill time varies with market conditions. You receive {feePct}% less than estimated yield -- the cost of instant liquidity.
      </p>

      {/* Error */}
      {txStatus === "error" && txError && (
        <div style={{
          ...font(12, c.red),
          background: `${c.red}12`,
          borderRadius: 4, padding: "8px 12px",
        }}>
          {txError}
        </div>
      )}

      <CTA
        label={isLoading ? "Signing..." : "Sign transaction"}
        onClick={handleSign}
        disabled={!canSign}
        purple
      />
    </>
  );
}
