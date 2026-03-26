import { useCallback, useRef } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWidgetStore } from "../../stores/widget-store";
import {
  maturities,
  type MaturityId,
  executeStakeAccountDeposit,
  executeSwap,
  allowedLockups,
} from "@pye/sdk";
import { useMarketStore, useBalanceStore } from "@pye/sdk/react";
import { c, font, displayFont, MARKET_RATE, pointsMap } from "../design-system";
import { StepTitle, CTA, Tooltip, Spacer } from "../shared/Layout";

/* ═══════════════════════════════════════════════════════════════════════════
   DiscountSlider — Dan's exact pointer-capture slider
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
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        style={{ position: "relative", height: 12, display: "flex", alignItems: "center", cursor: "pointer", userSelect: "none" }}
      >
        <div style={{
          position: "absolute", left: 0, width: `${pct}%`, height: 8,
          background: filledColor,
          borderRadius: pct > 98 ? "999px" : "999px 0 0 999px",
          borderTop: "1px solid rgba(255,255,255,0.3)",
          boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.2)",
          minWidth: pct > 0 ? 4 : 0,
        }} />
        <div style={{
          position: "absolute", left: `${pct}%`, right: 0, height: 8,
          background: c.bg,
          borderRadius: pct < 2 ? "999px" : "0 999px 999px 0",
          borderTop: `1px solid ${c.shadow}`,
          boxShadow: `inset 0 -1px 0 ${c.highlight}`,
        }} />
        <div style={{
          position: "absolute", left: `calc(${pct}% - 8px)`,
          width: 16, height: 16, borderRadius: "50%",
          background: "#fdfcfc",
          borderTop: `1px solid ${c.highlight}`,
          boxShadow: `inset 0 -1px 0 ${c.shadow}`,
          zIndex: 1, flexShrink: 0,
        }} />
      </div>
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
   Helper: resolve bond data from lockups for a given market
   ═══════════════════════════════════════════════════════════════════════════ */

function resolveBondParams(marketKey: string) {
  // marketKey format: "validatorId-maturityId-PT"
  const parts = marketKey.split("-");
  if (parts.length < 3) return null;
  const tokenType = parts.pop(); // "PT" or "RT"
  const maturityId = parts.pop() as MaturityId;
  const validatorId = parts.join("-"); // rejoin in case validator has hyphens

  const lockups = allowedLockups();
  const bond = lockups[validatorId as keyof typeof lockups]?.[maturityId as keyof (typeof lockups)[keyof typeof lockups]];
  if (!bond) return null;

  return {
    validatorId,
    maturityId,
    bondPubkey: bond.pubkey,
    principalTokenMint: bond.pt_address,
    yieldTokenMint: bond.rt_address,
  };
}

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
  const userStakeAccounts = useBalanceStore((s) => s.userStakeAccounts);

  const parsedAmount = parseFloat(depositAmount) || 0;
  const maturity = selectedMaturityId ? maturities[selectedMaturityId] : null;
  const matures = maturity?.human_readable ?? "Sep 30, 2026";

  // Find points label from maturity month
  const monthToQuarter: Record<string, string> = { JUN: "Q3", SEP: "Q4", DEC: "Q1", MAR: "Q2" };
  const quarterId = maturity ? (monthToQuarter[maturity.month] ?? null) : null;
  const points = quarterId ? (pointsMap[quarterId] ?? null) : null;

  // Market data — use real maturity ID for lookup
  const ptMarketKey = selectedMaturityId
    ? Object.keys(markets).find((k) => k.endsWith(`-${selectedMaturityId}-PT`))
    : null;
  const ptMarket = ptMarketKey ? markets[ptMarketKey] : null;
  const bestAsk = ptMarket?.bestAskPrice ?? 0;

  // Real market rate from best ask, or fallback
  const realMarketRate = bestAsk > 0 ? (1 - bestAsk) * 100 : MARKET_RATE;

  // Discount slider value as 0-5 float
  const discount = discountRateBps / 100;

  // Gross yield from real market data or fallback
  const grossYield = bestAsk > 0
    ? (1 - bestAsk) * parsedAmount
    : parsedAmount * (MARKET_RATE / 100);

  // Net sell amount: Dan's formula
  const sellAmount = parseFloat((grossYield - grossYield * (discount / 100) - 0.0043).toFixed(4));
  const feePct = grossYield > 0 ? ((1 - sellAmount / grossYield) * 100).toFixed(1) : "0.0";

  const isLoading = txStatus === "loading";
  const canSign = !!selectedStakeAccountPubkey && !!selectedMaturityId && !isLoading;

  // Resolve bond params for tx execution
  const bondParams = ptMarketKey ? resolveBondParams(ptMarketKey) : null;

  // Find the validator vote account from stake accounts
  const selectedStakeAccount = selectedStakeAccountPubkey !== "liquid-sol"
    ? userStakeAccounts.find((a) => a.pubkey === selectedStakeAccountPubkey)
    : null;

  const handleSign = useCallback(async () => {
    if (!selectedStakeAccountPubkey || !selectedMaturityId) return;

    setTxStatus("loading");

    try {
      let signature: string;

      if (selectedStakeAccountPubkey === "liquid-sol") {
        if (!ptMarket) throw new Error("No market found for this maturity");
        const result = await executeSwap({
          connection,
          wallet,
          marketPubkey: ptMarket.marketPubkey,
          orderSizeTokens: parsedAmount,
          maxPayTokens: parsedAmount,
          slippageBps: 100,
        });
        signature = result.signature;
      } else {
        if (!bondParams) throw new Error("Could not resolve bond data for this market");
        const result = await executeStakeAccountDeposit({
          connection,
          wallet,
          bondPubkey: bondParams.bondPubkey,
          principalTokenMint: bondParams.principalTokenMint,
          yieldTokenMint: bondParams.yieldTokenMint,
          validatorVoteAccount: selectedStakeAccount?.validatorVoteAccount ?? "",
          stakeAccountPubkey: selectedStakeAccountPubkey,
          amountSol: parsedAmount,
          stakeBalanceSol: selectedStakeAccountBalance,
        });
        signature = result.signature;
      }

      setTxStatus("success", signature);
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
    bondParams,
    selectedStakeAccount,
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

      {/* Advanced panel — discount rate */}
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
              <span style={font(12, c.secondary)}>Market: {realMarketRate.toFixed(2)}%</span>
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
        . Fill time varies with market conditions. You receive {feePct}% less than estimated yield — the cost of instant liquidity.
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

      <Spacer />
      <CTA
        label={isLoading ? "Signing..." : "Sign transaction"}
        onClick={handleSign}
        disabled={!canSign}
        purple
      />
    </>
  );
}
