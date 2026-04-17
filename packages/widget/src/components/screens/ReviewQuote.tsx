import { useCallback, useRef } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWidgetStore } from "../../stores/widget-store";
import {
  maturities,
  validators,
  type MaturityId,
  type ValidatorId,
  executeStakeAccountDeposit,
  executeStakeDeposit,
  executeRtSell,
  checkSellLiquidity,
  allowedLockups,
  lookupBondByVoteAccount,
  fetchBalances,
  fetchUserStakeAccounts,
} from "@pye/sdk";
import { useMarketStore, useBalanceStore, useWalletStore } from "@pye/sdk/react";
import { c, font, displayFont, MARKET_RATE, pointsMap, formatSolAmount } from "../design-system";
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

  const filledColor = value > 3 ? "#D93B3B" : "#0d9c5e";

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
  // marketKey format: "validatorId-maturityId-PT" or "validatorId-maturityId-RT"
  const parts = marketKey.split("-");
  if (parts.length < 3) return null;
  const tokenType = parts.pop(); // "PT" or "RT"
  const maturityId = parts.pop() as MaturityId;
  const validatorId = parts.join("-"); // rejoin in case validator has hyphens

  const lockups = allowedLockups();
  const bond = (lockups as Record<string, Record<string, { pubkey: string; pt_address: string; rt_address: string }>>)[validatorId]?.[maturityId];
  if (!bond) return null;

  const validator = validators[validatorId as ValidatorId];
  return {
    validatorId,
    maturityId,
    bondPubkey: bond.pubkey,
    principalTokenMint: bond.pt_address,
    yieldTokenMint: bond.rt_address,
    voteAccount: validator?.vote_account ?? "",
  };
}

export default function ReviewQuote() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const navigate = useWidgetStore((s) => s.navigate);
  const txStatus = useWidgetStore((s) => s.txStatus);
  const txStep = useWidgetStore((s) => s.txStep);
  const txError = useWidgetStore((s) => s.txError);
  const setTxStatus = useWidgetStore((s) => s.setTxStatus);
  const setTxStep = useWidgetStore((s) => s.setTxStep);
  const setSellAmountSol = useWidgetStore((s) => s.setSellAmountSol);
  const advancedOpen = useWidgetStore((s) => s.advancedOpen);
  const setAdvancedOpen = useWidgetStore((s) => s.setAdvancedOpen);
  const slippageBps = useWidgetStore((s) => s.slippageBps);
  const setSlippageBps = useWidgetStore((s) => s.setSlippageBps);

  const depositAmount = useWidgetStore((s) => s.depositAmount);
  const selectedMaturityId = useWidgetStore((s) => s.selectedMaturityId);
  const selectedStakeAccountPubkey = useWidgetStore((s) => s.selectedStakeAccountPubkey);
  const selectedStakeAccountBalance = useWidgetStore((s) => s.selectedStakeAccountBalance);

  const markets = useMarketStore((s) => s.markets);
  const userStakeAccounts = useBalanceStore((s) => s.userStakeAccounts);
  const setWalletBalances = useBalanceStore((s) => s.setWalletBalances);
  const setUserStakeAccounts = useBalanceStore((s) => s.setUserStakeAccounts);
  const setBalanceLamports = useWalletStore((s) => s.setBalanceLamports);

  const parsedAmount = parseFloat(depositAmount) || 0;
  const maturity = selectedMaturityId ? maturities[selectedMaturityId] : null;
  const matures = maturity?.human_readable ?? "Sep 30, 2026";

  // Find points label from maturity month
  const monthToQuarter: Record<string, string> = { JUN: "Q3", SEP: "Q4", DEC: "Q1", MAR: "Q2" };
  const quarterId = maturity ? (monthToQuarter[maturity.month] ?? null) : null;
  const points = quarterId ? (pointsMap[quarterId] ?? null) : null;

  // Find the validator vote account from stake accounts
  const selectedStakeAccount = selectedStakeAccountPubkey !== "liquid-sol"
    ? userStakeAccounts.find((a) => a.pubkey === selectedStakeAccountPubkey)
    : null;

  // Resolve the validator ID for market lookup
  const stakeVoteAccount = selectedStakeAccount?.validatorVoteAccount;
  const stakeBondLookup = stakeVoteAccount && selectedMaturityId
    ? lookupBondByVoteAccount(stakeVoteAccount, selectedMaturityId)
    : null;
  const stakeValidatorId = stakeBondLookup?.validatorId;

  // RT market data — must match the stake account's validator (each validator has its own RT token)
  const rtMarketKey = selectedMaturityId
    ? (stakeValidatorId
        ? `${stakeValidatorId}-${selectedMaturityId}-RT`
        : Object.keys(markets).find((k) => k.endsWith(`-${selectedMaturityId}-RT`)))
    : null;
  const rtMarket = rtMarketKey ? markets[rtMarketKey] ?? null : null;

  // RT amount = deposit amount (1:1 from stake deposit)
  const rtAmount = parsedAmount;

  // Real liquidity check against RT order book bids
  const liquidityCheck = rtMarket?.bids?.length
    ? checkSellLiquidity(rtMarket.bids, rtAmount)
    : null;

  const hasLiquidity = liquidityCheck?.isSufficientLiquidity ?? false;
  const orderBookSlippageBps = liquidityCheck?.slippageBps ?? 0;

  // Quote: expected SOL from selling RT
  const sellAmount = liquidityCheck?.expectedFillPrice != null
    ? liquidityCheck.expectedFillPrice * rtAmount
    : rtAmount * (MARKET_RATE / 100); // fallback

  // Slippage tolerance from slider (0-5 float)
  const slippage = slippageBps / 100;

  const isLoading = txStatus === "loading";
  const canSign = !!selectedStakeAccountPubkey && !!selectedMaturityId && !isLoading && hasLiquidity;

  // Resolve bond from the stake account's actual validator (not from market key)
  // Fall back to market-key-based resolution for liquid SOL (no stake account)
  const anyMarketKey = !stakeBondLookup
    ? (rtMarketKey ?? (selectedMaturityId ? Object.keys(markets).find((k) => k.endsWith(`-${selectedMaturityId}-PT`)) : null))
    : null;
  const marketBondParams = anyMarketKey ? resolveBondParams(anyMarketKey) : null;

  const bondParams = stakeBondLookup
    ? {
        validatorId: stakeBondLookup.validatorId,
        maturityId: selectedMaturityId!,
        bondPubkey: stakeBondLookup.pubkey,
        principalTokenMint: stakeBondLookup.pt_address,
        yieldTokenMint: stakeBondLookup.rt_address,
        voteAccount: stakeVoteAccount!,
      }
    : marketBondParams;

  const handleSign = useCallback(async () => {
    if (!selectedStakeAccountPubkey || !selectedMaturityId) return;
    if (!bondParams) throw new Error("Could not resolve bond data for this market");
    if (!rtMarket) throw new Error("No RT market found for this maturity");

    setTxStatus("loading");

    try {
      // Step 1: Deposit stake → receive PT + RT
      setTxStep("depositing");

      if (selectedStakeAccountPubkey === "liquid-sol") {
        await executeStakeDeposit({
          connection,
          wallet,
          bondPubkey: bondParams.bondPubkey,
          principalTokenMint: bondParams.principalTokenMint,
          yieldTokenMint: bondParams.yieldTokenMint,
          validatorVoteAccount: bondParams.voteAccount,
          amountSol: parsedAmount,
        });
      } else {
        await executeStakeAccountDeposit({
          connection,
          wallet,
          bondPubkey: bondParams.bondPubkey,
          principalTokenMint: bondParams.principalTokenMint,
          yieldTokenMint: bondParams.yieldTokenMint,
          validatorVoteAccount: bondParams.voteAccount,
          stakeAccountPubkey: selectedStakeAccountPubkey,
          amountSol: parsedAmount,
          stakeBalanceSol: selectedStakeAccountBalance,
        });
      }

      // Step 2: Sell RT on Manifest → receive SOL
      setTxStep("selling");

      const minReceive = sellAmount * (1 - slippage / 100);
      const rtSellResult = await executeRtSell({
        connection,
        wallet,
        marketPubkey: rtMarket.marketPubkey,
        rtMint: bondParams.yieldTokenMint,
        orderSizeTokens: parsedAmount,
        minReceiveTokens: Math.max(minReceive, 0),
      });

      setTxStep("complete");
      setSellAmountSol(sellAmount);
      setTxStatus("success", rtSellResult.signature);
      navigate("complete");
    } catch (err) {
      setTxStatus(
        "error",
        null,
        err instanceof Error ? err.message : "Transaction failed",
      );
    } finally {
      // Refresh all balances regardless of success/failure
      const owner = wallet.publicKey!;
      connection.getBalance(owner, "confirmed")
        .then(setBalanceLamports)
        .catch(() => {});
      fetchBalances(connection, owner)
        .then(setWalletBalances)
        .catch(() => {});
      fetchUserStakeAccounts(connection, owner)
        .then(setUserStakeAccounts)
        .catch(() => {});
    }
  }, [
    rtMarket,
    bondParams,
    selectedStakeAccount,
    selectedStakeAccountPubkey,
    selectedMaturityId,
    connection,
    wallet,
    parsedAmount,
    selectedStakeAccountBalance,
    sellAmount,
    slippage,
    setTxStatus,
    setTxStep,
    setSellAmountSol,
    navigate,
    setBalanceLamports,
    setWalletBalances,
    setUserStakeAccounts,
  ]);

  const NEON = "#00c97a";

  return (
    <>
      <StepTitle
        title="You receive"
        subtitle="Estimated upfront payout, net of fees."
      />

      {/* Hero quote card */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {/* Top: yield */}
        <div style={{
          background: "linear-gradient(135deg, rgba(0,201,122,0.07) 0%, rgba(154,77,255,0.07) 100%)",
          border: "1px solid rgba(0,201,122,0.2)",
          borderBottom: "none",
          borderRadius: "6px 6px 0 0",
          padding: 14,
          display: "flex", flexDirection: "column", gap: 8,
          boxShadow: "0 0 20px rgba(0,201,122,0.08)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <p style={font(12, c.secondary)}>Today</p>
            <Tooltip text="Estimated upfront payout based on current market rates, net of fees. The final amount is confirmed when your order fills on the Pye orderbook." />
          </div>
          <p style={{
            ...font(36, NEON, 700),
            letterSpacing: "-0.02em",
            fontVariantNumeric: "lining-nums tabular-nums",
            textShadow: "0 0 20px rgba(0,201,122,0.4)",
            marginBottom: slippage > 0 ? -4 : 0,
          }}>
            +{formatSolAmount(sellAmount)} SOL
          </p>
          {slippage > 0 && (
            <p style={font(12, c.secondary)}>
              Min. received: {formatSolAmount(sellAmount * (1 - slippage / 100))} SOL
            </p>
          )}
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
            <span style={{ color: c.primary }}>{parsedAmount} SOL</span>{" returns "}{matures}
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
          overflow: "visible",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={font(12, c.secondary)}>Max slippage tolerance</span>
                <Tooltip bg={c.highlight} text="Slippage is the maximum difference between the quoted price and the price you actually receive. A higher tolerance means your order is more likely to fill, but you may receive slightly less SOL." />
              </span>
              {orderBookSlippageBps > 0 && (
                <span style={font(12, c.secondary)}>Est. slippage: {(orderBookSlippageBps / 100).toFixed(2)}%</span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ ...font(18, c.primary), transition: "color 0.15s" }}>
                {slippage.toFixed(2)}
              </span>
              <span style={font(12, c.secondary)}>% max slippage</span>
            </div>
            <DiscountSlider value={slippage} onChange={(v) => setSlippageBps(Math.round(v * 100))} />
          </div>
        </div>
      )}

      {/* Liquidity warning */}
      {!hasLiquidity && rtAmount > 0 && (
        <div style={{
          background: "rgba(255,181,77,0.15)",
          borderTop: "1px solid rgba(255,255,255,0.2)",
          boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.08)",
          borderRadius: 4, padding: 12,
          display: "flex", flexDirection: "column", gap: 2,
        }}>
          <p style={{ ...font(12, c.primary), fontWeight: 500 }}>Insufficient liquidity</p>
          <p style={font(12, c.secondary)}>
            Only {liquidityCheck?.totalAvailableSize?.toFixed(2) ?? "0"} RT available on the order book.
            Your order may partially fill or not fill at all.
          </p>
        </div>
      )}

      {/* Orderbook disclosure */}
      <p style={font(12, c.secondary)}>
        Orders are matched on the{" "}
        <a href="https://app.pye.fi/trade" target="_blank" rel="noreferrer"
          style={{ color: c.secondary, textDecoration: "underline" }}>
          Pye orderbook
        </a>
        . If the market moves beyond your max slippage, this transaction will not execute.
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
        label={
          isLoading
            ? txStep === "depositing" ? "Setting up position..."
            : txStep === "selling" ? "Selling yield..."
            : "Signing..."
          : `Sell yield — get ${formatSolAmount(sellAmount, 3)} SOL`
        }
        onClick={handleSign}
        disabled={!canSign}
        purple
      />
    </>
  );
}
