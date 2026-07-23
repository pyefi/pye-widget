import { useCallback, useEffect, useRef, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWidgetStore } from "../../stores/widget-store";
import {
  maturities,
  canSellYield,
  executeDepositAndSell,
  executeDepositSolAndSell,
  checkSellLiquidity,
  fetchBalancesForMints,
  selectTrackedTokenMints,
  fetchUserStakeAccounts,
  writeCachedWalletBalances,
  PYE_TRADING_FEE_BPS,
  applyTradingFee,
  estimateRtToSell,
  fetchDepositStartTs,
  resolveDepositStartTs,
  simulateDepositAndSellNetSol,
  simulateDepositSolAndSellNetSol,
  getFirstDepositRequirement,
  getStakeRentExemptLamports,
  getUninitializedLockups,
  solToLamports,
  DepositValidationError,
  type CanonicalMaturity,
  type FirstDepositRequirement,
} from "@pyefi/sdk";
import {
  useMarketStore,
  useBalanceStore,
  useWalletStore,
  useLockupStore,
  useValidatorStore,
} from "@pyefi/sdk/react";
import { c, font, pointsMap, formatSolAmount, AMOUNT_DUST_LAMPORTS, POINTS_ENABLED, FEE_BUFFER_LAMPORTS } from "../design-system";
import { StepTitle, CTA, Tooltip, Spacer } from "../shared/Layout";
import { Odometer } from "../shared/Odometer";
import { OTC_REQUEST_OVERSIZED } from "./OtcForm";

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
            ...font(14, c.secondary),
            textTransform: "uppercase" as const, letterSpacing: "0.04em",
            width: 24, textAlign: l === "0%" ? "left" : l === "5%" ? "right" : "center",
          }}>{l}</span>
        ))}
      </div>
    </div>
  );
}

export default function ReviewQuote() {
  const { connection } = useConnection();
  const wallet = useWallet();

  // Epoch-synced wall-clock — matches the on-chain clock the Bonds program
  // uses when computing RT issuance, so the swap we build matches what the
  // user will actually hold after deposit.
  // Per-bond issuance-accrual start (resolved below, once the bond is known).
  const [depositStartTs, setDepositStartTs] = useState<number | null>(null);

  // Simulated net SOL change to the wallet (from simulateTransaction) — the
  // source of truth for "Net change today". `Fees` is derived as the gap
  // between the quote and this. null until it resolves (or on sim error).
  const [netSimSol, setNetSimSol] = useState<number | null>(null);
  // True while the simulation is in flight — drives the loading placeholder so
  // the Fees / Net rows don't pop in (and the card doesn't jump).
  const [simLoading, setSimLoading] = useState(false);
  const [simValidationError, setSimValidationError] = useState<string | null>(null);

  const navigate = useWidgetStore((s) => s.navigate);
  const openOtcForm = useWidgetStore((s) => s.openOtcForm);
  const selectedValidatorName = useWidgetStore((s) => s.selectedValidatorName);
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
  const selectedValidatorAltPubkey = useWidgetStore((s) => s.selectedValidatorAltPubkey);

  const markets = useMarketStore((s) => s.markets);
  const bonds = useLockupStore((s) => s.bonds);
  const validators = useValidatorStore((s) => s.validators);
  const userStakeAccounts = useBalanceStore((s) => s.userStakeAccounts);
  const setWalletBalances = useBalanceStore((s) => s.setWalletBalances);
  const setUserStakeAccounts = useBalanceStore((s) => s.setUserStakeAccounts);
  const setBalanceLamports = useWalletStore((s) => s.setBalanceLamports);
  const balanceLamports = useWalletStore((s) => s.balanceLamports);

  const parsedAmount = parseFloat(depositAmount) || 0;

  // Defensive snap: an amount within display-truncation dust below the full
  // delegated balance snaps to the exact balance, so the SDK builds a no-split
  // full deposit rather than a split leaving sub-min dust (which fails on-chain
  // with InsufficientDelegation under SIMD-0490). A genuinely smaller amount is
  // still validated.
  const depositAmountSol = (() => {
    if (selectedStakeAccountPubkey === "liquid-sol") return parsedAmount;
    const gap =
      solToLamports(selectedStakeAccountBalance) - solToLamports(parsedAmount);
    if (gap > 0 && gap < AMOUNT_DUST_LAMPORTS) return selectedStakeAccountBalance;
    return parsedAmount;
  })();

  const maturity = selectedMaturityId ? maturities[selectedMaturityId] : null;
  const matures = maturity?.human_readable ?? "Sep 30, 2026";

  // Points label keyed by month — collapses same-month maturities across years
  // (q12026 and q12027 both → "Q2"); key off maturity id if per-year points are
  // ever needed. Currently inert (POINTS_ENABLED=false).
  const monthToQuarter: Record<string, string> = { JUN: "Q3", SEP: "Q4", DEC: "Q1", MAR: "Q2" };
  const quarterId = maturity ? (monthToQuarter[maturity.month] ?? null) : null;
  const points = POINTS_ENABLED && quarterId ? (pointsMap[quarterId] ?? null) : null;

  const selectedValidatorVoteAccount = useWidgetStore((s) => s.selectedValidatorVoteAccount);

  const selectedStakeAccount = selectedStakeAccountPubkey !== "liquid-sol"
    ? userStakeAccounts.find((a) => a.pubkey === selectedStakeAccountPubkey)
    : null;

  // Resolve the bond for the stake account's validator at the chosen maturity.
  // In the new schema, market keys are vote_account-scoped, so we use the
  // stake account's vote_account directly to build the key.
  const stakeVoteAccount = selectedStakeAccount?.validatorVoteAccount;
  const stakeBond = stakeVoteAccount && selectedMaturityId
    ? bonds[`${stakeVoteAccount}:${selectedMaturityId}`] ?? null
    : null;

  const [firstDeposit, setFirstDeposit] = useState<FirstDepositRequirement | null>(null);
  const [liquidRentLamports, setLiquidRentLamports] = useState<number | null>(null);

  useEffect(() => {
    if (selectedStakeAccountPubkey !== "liquid-sol") return;
    let cancelled = false;
    getStakeRentExemptLamports(connection)
      .then((rent) => { if (!cancelled) setLiquidRentLamports(rent); })
      .catch(() => { /* null → gate fails open; on-chain/builder backstop */ });
    return () => { cancelled = true; };
  }, [connection, selectedStakeAccountPubkey]);

  useEffect(() => {
    // Clear first so a stale banner/gate can't linger during a bond switch.
    setFirstDeposit(null);
    if (!stakeBond) return;
    let cancelled = false;

    // Balance fetch runs in parallel so the insufficient-balance gate can fire
    // before the first sign attempt.
    if (wallet.publicKey) {
      connection
        .getBalance(wallet.publicKey, "confirmed")
        .then((bal) => { if (!cancelled) setBalanceLamports(bal); })
        .catch(() => {});
    }

    getFirstDepositRequirement(connection, stakeBond.pubkey)
      .then((r) => {
        if (cancelled) return;
        setFirstDeposit(r);
      })
      .catch(() => {
        // fail open: use a known-non-first-deposit value
        if (!cancelled) setFirstDeposit({ isFirstDeposit: false, requiredExtraLamports: 0 });
      });
    return () => {
      cancelled = true;
    };
  }, [connection, stakeBond?.pubkey, wallet.publicKey, setBalanceLamports]);

  const insufficientForInit =
    firstDeposit?.isFirstDeposit === true &&
    balanceLamports != null &&
    balanceLamports < firstDeposit.requiredExtraLamports + FEE_BUFFER_LAMPORTS;

  const liquidRequiredLamports =
    selectedStakeAccountPubkey === "liquid-sol" && liquidRentLamports != null
      ? solToLamports(parsedAmount) + liquidRentLamports + FEE_BUFFER_LAMPORTS
      : null;
  const insufficientForLiquid =
    liquidRequiredLamports != null &&
    balanceLamports != null &&
    balanceLamports < liquidRequiredLamports;

  // RT market data — must match the stake account's validator (each validator has its own RT token)
  const rtMarketKey = selectedMaturityId
    ? (stakeBond && stakeVoteAccount
        ? `${stakeVoteAccount}-${selectedMaturityId}-RT`
        : selectedValidatorVoteAccount
          ? `${selectedValidatorVoteAccount}-${selectedMaturityId}-RT`
          : Object.keys(markets).find((k) => k.endsWith(`-${selectedMaturityId}-RT`)))
    : null;
  const rtMarket = rtMarketKey ? markets[rtMarketKey] ?? null : null;

  // Resolve bond from the stake account's actual validator (not from market key)
  // Fall back to market-key-based resolution for liquid SOL (no stake account)
  const marketBondParams = (() => {
    if (stakeBond) return null;
    const fallbackMarketKey = rtMarketKey
      ?? (selectedMaturityId ? Object.keys(markets).find((k) => k.endsWith(`-${selectedMaturityId}-PT`)) : null);
    if (!fallbackMarketKey) return null;
    // Market key format: `${voteAccount}-${canonicalLabel}-${PT|RT}`
    const parts = fallbackMarketKey.split("-");
    parts.pop(); // tokenType
    const canonicalLabel = parts.pop() as CanonicalMaturity;
    const voteAccount = parts.join("-");
    const bond = bonds[`${voteAccount}:${canonicalLabel}`];
    if (!bond) return null;
    return {
      bondPubkey: bond.pubkey,
      principalTokenMint: bond.pt_mint,
      yieldTokenMint: bond.rt_mint,
      voteAccount,
    };
  })();

  const bondParams = stakeBond
    ? {
        bondPubkey: stakeBond.pubkey,
        principalTokenMint: stakeBond.pt_mint,
        yieldTokenMint: stakeBond.rt_mint,
        voteAccount: stakeVoteAccount!,
      }
    : marketBondParams;

  // Bond object for RT estimation (issuance_ts, maturity_ts) — stakeBond on the
  // stake path, else the same bond marketBondParams resolved for liquid SOL.
  const effectiveBond: typeof stakeBond = stakeBond ?? (() => {
    if (!bondParams) return null;
    const key = `${bondParams.voteAccount}:${selectedMaturityId}`;
    return bonds[key] ?? null;
  })();

  // Bonds program mints RT proportional to remaining issuance window, not
  // 1:1 with the deposit. Use the same formula the on-chain program does
  // so the swap we build matches the user's actual post-deposit RT balance.
  // Amount-derived values use the snapped `depositAmountSol` for consistency.
  const effectiveDepositStartTs = depositStartTs ?? Date.now() / 1000;
  // Estimate RT against the *bond's own* on-chain issuance window (rolling per
  // bond), not the shared maturities.ts constant — otherwise recently-created
  // bonds (e.g. a just-listed validator) are off by multiples.
  const rtAmount = effectiveBond
    ? estimateRtToSell({
        amountSol: depositAmountSol,
        issuanceTs: effectiveBond.issuance_ts,
        maturityTs: effectiveBond.maturity_ts,
        depositStartTs: effectiveDepositStartTs,
      })
    : 0;

  // Real liquidity check against RT order book bids
  const liquidityCheck = rtMarket?.bids?.length
    ? checkSellLiquidity(rtMarket.bids, rtAmount)
    : null;

  const hasLiquidity = liquidityCheck?.isSufficientLiquidity ?? false;
  const orderBookSlippageBps = liquidityCheck?.slippageBps ?? 0;

  // Quote: expected gross SOL from selling RT on Manifest. When the book can't
  // fill (no liquidity), the quote is zero and the Sign CTA is already disabled
  // by `canSign` — better than showing a fabricated fallback price.
  const grossSellAmount =
    liquidityCheck?.expectedFillPrice != null
      ? liquidityCheck.expectedFillPrice * rtAmount
      : 0;

  // Net-of-Pye payout — used at sign time and on the success screen.
  const sellAmount = applyTradingFee(grossSellAmount);
  const feePct = (PYE_TRADING_FEE_BPS / 100).toFixed(2);

  // "You receive today" = the gross order-book quote (value of the rewards
  // you're selling, before fees). The real wallet delta comes from simulating
  // the actual transaction (`netSimSol`); "Fees" is the remaining gap — the Pye
  // fee, Solana network fee, token / Manifest market rent, and any slippage.
  //
  // On the liquid-SOL path the deposit principal leaves the wallet to become
  // stake, landing in `netSimSol`. It's returned at maturity (shown as "Stake
  // amount"), not a cost, so exclude it — else the whole ~1 SOL is mislabeled as
  // a fee. On the stake path the principal was already staked, nothing to exclude.
  const principalOutflowSol =
    selectedStakeAccountPubkey === "liquid-sol" ? depositAmountSol : 0;
  const netChangeTodaySol = netSimSol;
  const feesSol =
    netSimSol != null ? grossSellAmount - netSimSol - principalOutflowSol : null;
  const fmtAmt = (x: number) =>
    Math.abs(x) > 0 && Math.abs(x) < 0.0001 ? "< 0.0001" : formatSolAmount(x);
  const feesTooltip = `The difference between the quoted rewards and what actually lands in your wallet. Includes the Solana network fee, Pye's ${feePct}% protocol fee, rent for your token accounts (and the Manifest market, where applicable), and any order-book slippage.`;

  // Slippage tolerance from slider (0-5 float)
  const slippage = slippageBps / 100;

  const isLoading = txStatus === "loading";
  const selectedStakeStillOwned =
    selectedStakeAccountPubkey === "liquid-sol" ||
    (selectedStakeAccountPubkey !== null &&
      userStakeAccounts.some((a) => a.pubkey === selectedStakeAccountPubkey));
  const canSign =
    !!selectedStakeAccountPubkey &&
    !!selectedMaturityId &&
    !isLoading &&
    !simLoading &&
    hasLiquidity &&
    selectedStakeStillOwned &&
    !insufficientForInit &&
    !insufficientForLiquid &&
    !simValidationError &&
    (stakeBond == null || firstDeposit != null);

  // Resolve the program's issuance-accrual start for *this* bond — current
  // epoch start if its stake is already active, next epoch start if fresh —
  // so the RT estimate matches the mint exactly. Falls back to next epoch
  // start (the never-over-sells choice) if the status can't be read.
  const resolveBondPubkey = bondParams?.bondPubkey ?? null;
  useEffect(() => {
    let cancelled = false;
    if (!resolveBondPubkey) {
      setDepositStartTs(null);
      return;
    }
    resolveDepositStartTs(connection, [resolveBondPubkey])
      .then((map) => {
        if (!cancelled) setDepositStartTs(map[resolveBondPubkey] ?? null);
      })
      .catch(() => {
        if (!cancelled) {
          fetchDepositStartTs(connection)
            .then((ts) => !cancelled && setDepositStartTs(ts))
            .catch(() => !cancelled && setDepositStartTs(Date.now() / 1000));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [connection, resolveBondPubkey]);

  // Preview the actual wallet delta by simulating the real bundled tx — this is
  // the source of truth for "Net change today" (matches what the wallet shows).
  // Only the stake-account path uses the bundled tx; liquid-sol is skipped.
  const owner = wallet.publicKey;
  const ownerKey = owner?.toBase58() ?? null;
  useEffect(() => {
    let cancelled = false;
    setSimValidationError(null);
    const altPubkey = selectedValidatorAltPubkey;
    if (
      !owner ||
      !bondParams ||
      !rtMarket ||
      !altPubkey ||
      selectedStakeAccountPubkey === "liquid-sol" ||
      selectedStakeAccountPubkey == null ||
      !(rtAmount > 0) ||
      !(grossSellAmount > 0)
    ) {
      setNetSimSol(null);
      setSimLoading(false);
      return;
    }
    setSimLoading(true);
    const minReceive = Math.max(grossSellAmount * (1 - slippageBps / 10000), 0);
    simulateDepositAndSellNetSol({
      connection,
      owner,
      bondPubkey: bondParams.bondPubkey,
      principalTokenMint: bondParams.principalTokenMint,
      yieldTokenMint: bondParams.yieldTokenMint,
      validatorVoteAccount: bondParams.voteAccount,
      stakeAccountPubkey: selectedStakeAccountPubkey,
      amountSol: depositAmountSol,
      stakeBalanceSol: selectedStakeAccountBalance,
      marketPubkey: rtMarket.marketPubkey,
      rtAmountToSell: rtAmount,
      minReceiveTokens: minReceive,
      expectedSolOut: grossSellAmount,
      altPubkey,
    })
      .then((net) => {
        if (!cancelled) {
          setNetSimSol(net);
          setSimLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setNetSimSol(null);
          setSimLoading(false);
          if (err instanceof DepositValidationError) {
            setSimValidationError(err.message);
          }
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection, ownerKey, resolveBondPubkey, rtMarket?.marketPubkey, selectedStakeAccountPubkey, selectedValidatorAltPubkey, depositAmountSol, depositStartTs]);

  // Liquid-SOL wallet-delta preview — mirrors the stake simulation above.
  useEffect(() => {
    let cancelled = false;
    setSimValidationError(null);
    const altPubkey = selectedValidatorAltPubkey;
    if (
      !owner ||
      !bondParams ||
      !rtMarket ||
      !altPubkey ||
      selectedStakeAccountPubkey !== "liquid-sol" ||
      !(rtAmount > 0) ||
      !(grossSellAmount > 0)
    ) {
      if (selectedStakeAccountPubkey === "liquid-sol") {
        setNetSimSol(null);
        setSimLoading(false);
      }
      return;
    }
    setSimLoading(true);
    const minReceive = Math.max(grossSellAmount * (1 - slippageBps / 10000), 0);
    simulateDepositSolAndSellNetSol({
      connection,
      owner,
      bondPubkey: bondParams.bondPubkey,
      principalTokenMint: bondParams.principalTokenMint,
      yieldTokenMint: bondParams.yieldTokenMint,
      validatorVoteAccount: bondParams.voteAccount,
      amountSol: depositAmountSol,
      marketPubkey: rtMarket.marketPubkey,
      rtAmountToSell: rtAmount,
      minReceiveTokens: minReceive,
      expectedSolOut: grossSellAmount,
      altPubkey,
    })
      .then((net) => {
        if (!cancelled) {
          setNetSimSol(net);
          setSimLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setNetSimSol(null);
          setSimLoading(false);
          if (err instanceof DepositValidationError) {
            setSimValidationError(err.message);
          }
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection, ownerKey, resolveBondPubkey, rtMarket?.marketPubkey, selectedStakeAccountPubkey, selectedValidatorAltPubkey, depositAmountSol, depositStartTs]);

  const handleSign = useCallback(async () => {
    if (!selectedStakeAccountPubkey || !selectedMaturityId) return;
    if (!bondParams) throw new Error("Could not resolve bond data for this market");
    if (!rtMarket) throw new Error("No RT market found for this maturity");
    if (!maturity) throw new Error("No maturity selected");

    // Safety net — ChooseDuration already gates this, but re-check at sign time
    // so a stale or mid-flight state can't slip a doomed swap through.
    const gate = canSellYield({
      validatorVoteAccount: bondParams.voteAccount,
      maturityId: selectedMaturityId,
      amountSol: depositAmountSol,
      depositStartTs: depositStartTs ?? Date.now() / 1000,
      validators,
      bonds,
      markets,
    });
    if (!gate.ok) {
      console.error(
        `[Pye] ${gate.code}: validator ${bondParams.voteAccount}, maturity ${selectedMaturityId} — ${gate.reason}`,
      );
      throw new Error(`${gate.reason} (${gate.code})`);
    }

    setTxStatus("loading");
    setTxStep("depositing");

    // Swap-level minReceive is measured against the gross swap output;
    // the fixed taker fee is transferred from that wSOL post-swap.
    const minReceive = Math.max(grossSellAmount * (1 - slippage / 100), 0);

    // Refresh the epoch-synced clock right before signing — the mount-time
    // value can be minutes stale by the time the user clicks, and the chain
    // clock keeps advancing. An out-of-date nowTs overshoots the actual
    // mint by ~1 atom per second of drift, which fails the Manifest swap.
    const freshMap = await resolveDepositStartTs(connection, [
      bondParams.bondPubkey,
    ]).catch(() => null);
    const freshDepositStartTs =
      freshMap?.[bondParams.bondPubkey] ?? depositStartTs ?? Date.now() / 1000;
    // The issuance/maturity window is static, so reuse render-time `effectiveBond`;
    // only depositStartTs is refreshed above.
    const freshRtAmount = effectiveBond
      ? estimateRtToSell({
          amountSol: depositAmountSol,
          issuanceTs: effectiveBond.issuance_ts,
          maturityTs: effectiveBond.maturity_ts,
          depositStartTs: freshDepositStartTs,
        })
      : 0;

    try {
      if (selectedStakeAccountPubkey === "liquid-sol") {
        // Re-check init status before signing to close the liquid→initialized
        // race: if the lockup was initialized since ChooseDuration, abort with a
        // clear error instead of letting the on-chain tx fail.
        const bondPubkeyForCheck = bondParams.bondPubkey;
        const freshUninit = await getUninitializedLockups(connection, [bondPubkeyForCheck]).catch(() => null);
        if (freshUninit !== null && !freshUninit.has(bondPubkeyForCheck)) {
          setTxStatus("error", null, "This lockup was just initialized — deposit staked SOL instead.");
          return;
        }

        // Atomic liquid-SOL path in a single v0 tx. The builder's 2 bps buffer
        // prevents "Insufficient base in atoms" reverts from quote→sign clock drift.
        const altPubkey = selectedValidatorAltPubkey!;
        const liquidResult = await executeDepositSolAndSell({
          connection,
          wallet,
          bondPubkey: bondParams.bondPubkey,
          principalTokenMint: bondParams.principalTokenMint,
          yieldTokenMint: bondParams.yieldTokenMint,
          validatorVoteAccount: bondParams.voteAccount,
          amountSol: depositAmountSol,
          marketPubkey: rtMarket.marketPubkey,
          rtAmountToSell: freshRtAmount,
          minReceiveTokens: minReceive,
          expectedSolOut: grossSellAmount,
          altPubkey,
        });
        setTxStep("complete");
        setSellAmountSol(sellAmount);
        setTxStatus("success", liquidResult.signature);
        navigate("complete");
      } else {
        // Stake account path — single bundled v0 transaction.
        // ALT presence is guaranteed by the canSellYield safety net above;
        // the non-null assertion narrows the widget-store union for TS.
        const altPubkey = selectedValidatorAltPubkey!;
        const result = await executeDepositAndSell({
          connection,
          wallet,
          bondPubkey: bondParams.bondPubkey,
          principalTokenMint: bondParams.principalTokenMint,
          yieldTokenMint: bondParams.yieldTokenMint,
          validatorVoteAccount: bondParams.voteAccount,
          stakeAccountPubkey: selectedStakeAccountPubkey,
          amountSol: depositAmountSol,
          rtAmountToSell: freshRtAmount,
          stakeBalanceSol: selectedStakeAccountBalance,
          marketPubkey: rtMarket.marketPubkey,
          minReceiveTokens: minReceive,
          expectedSolOut: grossSellAmount,
          altPubkey,
        });
        setTxStep("complete");
        setSellAmountSol(sellAmount);
        setTxStatus("success", result.signature);
        navigate("complete");
      }
    } catch (err) {
      setTxStatus(
        "error",
        null,
        err instanceof Error ? err.message : "Transaction failed",
      );
    } finally {
      const owner = wallet.publicKey!;
      connection.getBalance(owner, "confirmed").then(setBalanceLamports).catch(() => {});
      fetchBalancesForMints(connection, owner, selectTrackedTokenMints(bonds, validators))
        .then((bals) => {
          setWalletBalances(bals);
          writeCachedWalletBalances(owner.toBase58(), bals);
        })
        .catch(() => {});
      fetchUserStakeAccounts(connection, owner).then(setUserStakeAccounts).catch(() => {});
    }
  }, [
    rtMarket,
    bondParams,
    stakeBond,
    bonds,
    effectiveBond,
    validators,
    markets,
    depositStartTs,
    selectedStakeAccount,
    selectedStakeAccountPubkey,
    selectedMaturityId,
    selectedValidatorAltPubkey,
    connection,
    wallet,
    depositAmountSol,
    maturity,
    selectedStakeAccountBalance,
    sellAmount,
    grossSellAmount,
    slippage,
    setTxStatus,
    setTxStep,
    setSellAmountSol,
    navigate,
    setBalanceLamports,
    setWalletBalances,
    setUserStakeAccounts,
  ]);

  return (
    <>
      <StepTitle title="Approve in your wallet" />

      {/* Quote — stacked sections */}
      {(() => {
        const rows: Array<{ key: string; left: React.ReactNode; right: React.ReactNode }> = [
          {
            key: "receive",
            left: (
              <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                <p style={font(14, c.secondary)}>You receive today</p>
                <Tooltip text="The value of the rewards you're selling at current market rates, before fees. Fees and your net wallet change are shown below. Final amount is confirmed when your order fills on the Pye orderbook." />
              </div>
            ),
            right: (
              <Odometer
                value={`+${formatSolAmount(grossSellAmount)} SOL`}
                style={{ ...font(15, c.green, 500), whiteSpace: "nowrap", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}
              />
            ),
          },
          {
            key: "stake",
            left: <p style={font(14, c.secondary)}>Stake amount</p>,
            right: (
              <Odometer
                value={`${depositAmountSol} SOL`}
                style={{ ...font(14, c.primary), whiteSpace: "nowrap", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}
              />
            ),
          },
          {
            key: "pt",
            left: (
              <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                <p style={font(14, c.secondary)}>PTs you&apos;ll receive</p>
                <Tooltip text="Your PT is a token receipt for your staked SOL. At the redeem date, redeem it 1:1 for your full stake." />
              </div>
            ),
            right: (
              <Odometer
                value={`${depositAmountSol} PT`}
                style={{ ...font(14, c.primary), whiteSpace: "nowrap", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}
              />
            ),
          },
          {
            key: "redeem",
            left: <p style={font(14, c.secondary)}>Redeem date</p>,
            right: (
              <p style={{ ...font(14, c.primary), whiteSpace: "nowrap", flexShrink: 0 }}>
                {matures}
              </p>
            ),
          },
          ...(feesSol != null || simLoading ? [{
            key: "fees",
            left: (
              <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                <p style={font(14, c.secondary)}>Fees</p>
                <Tooltip text={feesTooltip} />
              </div>
            ),
            right: feesSol != null ? (
              <Odometer
                value={`−${fmtAmt(feesSol)} SOL`}
                style={{ ...font(14, c.primary), whiteSpace: "nowrap", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}
              />
            ) : (
              <div style={{ width: 54, height: 13, borderRadius: 4, background: c.shadow, opacity: 0.5, flexShrink: 0 }} />
            ),
          }] : []),
          ...(points ? [{
            key: "points",
            left: <p style={font(14, c.secondary)}>Points multiplier</p>,
            right: (
              <p style={{ ...font(14, c.purple), whiteSpace: "nowrap", flexShrink: 0 }}>
                {points}
              </p>
            ),
          }] : []),
          ...(netChangeTodaySol != null || simLoading ? [{
            key: "net-today",
            left: (
              <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                <p style={font(14, c.primary, 600)}>Net change today</p>
                <Tooltip text="Your actual SOL balance change today — the payout above minus fees. This matches what your wallet shows." />
              </div>
            ),
            right: netChangeTodaySol != null ? (
              <Odometer
                value={`${netChangeTodaySol >= 0 ? "+" : "−"}${fmtAmt(Math.abs(netChangeTodaySol))} SOL`}
                style={{ ...font(15, netChangeTodaySol >= 0 ? c.green : c.primary, 600), whiteSpace: "nowrap", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}
              />
            ) : (
              <div style={{ width: 64, height: 14, borderRadius: 4, background: c.shadow, opacity: 0.5, flexShrink: 0 }} />
            ),
          }] : []),
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

      {/* Advanced toggle */}
      <div
        onClick={() => setAdvancedOpen(!advancedOpen)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: "pointer", padding: "2px 0", userSelect: "none",
        }}
      >
        <span style={font(14, c.secondary)}>Advanced</span>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{
          transform: advancedOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s",
        }}>
          <path d="M1 1L5 5L9 1" stroke={c.secondary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Advanced panel — discount rate (grid-row height transition) */}
      <div style={{
        display: "grid",
        gridTemplateRows: advancedOpen ? "1fr" : "0fr",
        transition: "grid-template-rows 280ms cubic-bezier(0.2,0.9,0.2,1)",
      }}>
        <div style={{
          overflow: "hidden",
          opacity: advancedOpen ? 1 : 0,
          transition: "opacity 200ms cubic-bezier(0.2,0.9,0.2,1)",
        }}>
          <div style={{
            background: c.raised, borderRadius: 8, padding: 12,
            borderTop: `1px solid ${c.highlight}`,
            boxShadow: `inset 0 -1px 0 ${c.shadow}`,
            display: "flex", flexDirection: "column", gap: 16,
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={font(14, c.secondary)}>Max slippage tolerance</span>
                  <Tooltip bg={c.highlight} text="Slippage is the maximum difference between the quoted price and the price you actually receive. A higher tolerance means your order is more likely to fill, but you may receive slightly less SOL." />
                </span>
                {orderBookSlippageBps > 0 && (
                  <span style={font(14, c.secondary)}>Est. slippage: {(orderBookSlippageBps / 100).toFixed(2)}%</span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ ...font(18, c.primary), transition: "color 0.15s" }}>
                  {slippage.toFixed(2)}
                </span>
                <span style={font(14, c.secondary)}>% max slippage</span>
              </div>
              <DiscountSlider value={slippage} onChange={(v) => setSlippageBps(Math.round(v * 100))} />
            </div>
          </div>
        </div>
      </div>

      {/* First-depositor banner (info or blocking error) */}
      {firstDeposit?.isFirstDeposit && (
        <div style={{ padding: 12, borderRadius: 8, background: c.shadow, marginBottom: 8 }}>
          <p style={{ ...font(13, insufficientForInit ? c.red : c.primary) }}>
            {insufficientForInit
              ? `Your wallet needs at least ${formatSolAmount(firstDeposit.requiredExtraLamports / 1e9)} SOL (plus fees) to initialize this lockup.`
              : `You're the first depositor in this lockup. An extra ${formatSolAmount(firstDeposit.requiredExtraLamports / 1e9)} SOL will be taken from your wallet to initialize it — you receive it back as PT/YT, so it counts toward your deposit.`
            }
          </p>
        </div>
      )}

      {/* Liquid SOL insufficient-balance banner */}
      {insufficientForLiquid && liquidRequiredLamports != null && (
        <div style={{ padding: 12, borderRadius: 8, background: c.shadow, marginBottom: 8 }}>
          <p style={{ ...font(13, c.red) }}>
            Your wallet needs at least {formatSolAmount(liquidRequiredLamports / 1e9)} SOL to
            cover this deposit plus fees.
          </p>
        </div>
      )}

      {/* Simulation validation error */}
      {simValidationError && (
        <div style={{
          ...font(14, c.red),
          background: `${c.red}12`,
          borderRadius: 6, padding: "8px 12px",
        }}>
          {simValidationError}
        </div>
      )}

      {/* Liquidity warning */}
      {!hasLiquidity && rtAmount > 0 && (
        <div style={{
          background: "rgba(255,181,77,0.15)",
          borderTop: "1px solid rgba(255,255,255,0.2)",
          boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.08)",
          borderRadius: 6, padding: 12,
          display: "flex", flexDirection: "column", gap: 2,
        }}>
          <p style={{ ...font(14, c.primary), fontWeight: 500 }}>Insufficient liquidity</p>
          <p style={font(14, c.secondary)}>
            Only {liquidityCheck?.totalAvailableSize?.toFixed(2) ?? "0"} RT available on the order book.
            Your order may partially fill or not fill at all.
          </p>
          <button
            onClick={() =>
              openOtcForm({
                requestType: OTC_REQUEST_OVERSIZED,
                validator: selectedValidatorName ?? undefined,
                solAmount: depositAmount ? `${depositAmount} SOL` : undefined,
              })
            }
            style={{
              background: "none", border: "none", cursor: "pointer", padding: 0,
              textAlign: "left", alignSelf: "flex-start", marginTop: 4,
            }}
          >
            <span style={font(14, c.purple, 500)}>Request OTC liquidity →</span>
          </button>
        </div>
      )}

      {/* Error */}
      {txStatus === "error" && txError && (
        <div style={{
          ...font(14, c.red),
          background: `${c.red}12`,
          borderRadius: 6, padding: "8px 12px",
        }}>
          {txError}
        </div>
      )}

      <Spacer />
      <CTA
        label={
          isLoading
            ? txStep === "selling" ? "Selling rewards..."
            : "Confirming..."
          : `Sell Rewards — get ${formatSolAmount(sellAmount, 3)} SOL`
        }
        onClick={handleSign}
        disabled={!canSign}
        purple
      />
    </>
  );
}
