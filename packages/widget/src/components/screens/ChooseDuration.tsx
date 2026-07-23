import { useEffect, useMemo, useRef, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { useWidgetStore } from "../../stores/widget-store";
import {
  maturities,
  type MaturityId,
  type SellYieldCode,
  type SellYieldStatus,
  SELL_YIELD_CODES,
  applyTradingFee,
  canSellYield,
  checkSellLiquidity,
  estimateRtFromStake,
  resolveDepositStartTs,
  getUninitializedLockups,
} from "@pyefi/sdk";
import {
  useMarketStore,
  useValidatorStore,
  useLockupStore,
} from "@pyefi/sdk/react";
import { c, font, displayFont, formatSolAmount, POINTS_ENABLED } from "../design-system";
import { CTA, Tooltip } from "../shared/Layout";
import { Odometer } from "../shared/Odometer";

/** Short user-facing headlines per gate failure code. Reason text from
 *  canSellYield is shown beneath this as the detail line. The two lockup-state
 *  codes surface as fundability messages near the CTA, not as row badges. */
const GATE_HEADLINE: Record<SellYieldCode, string> = {
  [SELL_YIELD_CODES.VALIDATOR_NOT_CONFIGURED]: "Validator not supported",
  [SELL_YIELD_CODES.VALIDATOR_WIDGET_DISABLED]: "Validator not enabled",
  [SELL_YIELD_CODES.VALIDATOR_ALT_MISSING]: "Setup pending",
  [SELL_YIELD_CODES.BOND_MISSING]: "Not available",
  [SELL_YIELD_CODES.BOND_NOT_STANDARD]: "Setup pending",
  [SELL_YIELD_CODES.MARKET_MISSING]: "Market not open",
  [SELL_YIELD_CODES.LIQUIDITY_INSUFFICIENT]: "Insufficient liquidity",
  [SELL_YIELD_CODES.LOCKUP_UNINITIALIZED]: "New lockup",
  [SELL_YIELD_CODES.LOCKUP_INITIALIZED]: "Already open",
};

/**
 * Fundability of a quotable duration given the selected funding source — tracked
 * separately from the yield estimate since a duration can be quotable yet not
 * fundable by the picked source. "needs-stake": initialized lockup on the liquid
 * path (initialized lockups take only staked SOL). "needs-liquid": brand-new
 * lockup on the stake path (a lockup's first deposit must be liquid SOL).
 */
type FundGate = "none" | "needs-stake" | "needs-liquid";

/** Map SDK maturity IDs to Dan's display format */
const QUARTER_INFO: Record<MaturityId, { label: string; pts: string | null }> =
  {
    q22026: { label: "30 Jun 2026", pts: null },
    q32026: { label: "30 Sep 2026", pts: "2x points" },
    q42026: { label: "31 Dec 2026", pts: "3x points" },
    q12026: { label: "31 Mar 2026", pts: null },
    q12027: { label: "31 Mar 2027", pts: null },
  };

/** All maturity IDs in chronological order */
const ALL_MATURITIES: MaturityId[] = ["q12026", "q22026", "q32026", "q42026", "q12027"];

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
  const validators = useValidatorStore((s) => s.validators);
  const bonds = useLockupStore((s) => s.bonds);
  const selectedStakeAccountPubkey = useWidgetStore((s) => s.selectedStakeAccountPubkey);

  const validatorName =
    (selectedValidatorVoteAccount && validators[selectedValidatorVoteAccount]?.name) ||
    "this validator";

  // Per-bond issuance-accrual start the Bonds program will use (current epoch
  // start for active bonds, next for fresh) — keyed by bond pubkey. Resolved
  // below once the available maturities are known.
  const [depositStartByBond, setDepositStartByBond] = useState<
    Record<string, number>
  >({});

  // null = loading; empty set after RPC failure (see the fetch effect below).
  const [uninitializedBonds, setUninitializedBonds] = useState<Set<string> | null>(null);

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

  // `markets`/`bonds` get a fresh identity on every order-book tick, so the two
  // fetches below key on this *content* string, not the array identity —
  // otherwise each tick re-runs them and resets `uninitializedBonds` to null,
  // flashing the fundability gate on the liquid path (which fails closed).
  const bondPubkeys = useMemo(
    () =>
      availableMaturities
        .map((matId) => bonds[`${selectedValidatorVoteAccount}:${matId}`]?.pubkey)
        .filter((p): p is string => Boolean(p)),
    [availableMaturities, bonds, selectedValidatorVoteAccount],
  );
  const bondPubkeysKey = bondPubkeys.join(",");

  // Resolve each available bond's issuance-accrual start in one batched RPC,
  // matching the program's branch (active → current epoch start, fresh → next).
  useEffect(() => {
    if (bondPubkeys.length === 0) return;
    let cancelled = false;
    resolveDepositStartTs(connection, bondPubkeys)
      .then((map) => {
        if (!cancelled) setDepositStartByBond(map);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection, bondPubkeysKey]);

  // Which lockups are uninitialized, to gate liquid vs stake paths. Liquid fails
  // closed while loading (null → needs-stake gate); stake fails open on RPC
  // failure (empty set → no gate).
  useEffect(() => {
    if (bondPubkeys.length === 0) { setUninitializedBonds(new Set()); return; }
    let cancelled = false;
    setUninitializedBonds(null);
    getUninitializedLockups(connection, bondPubkeys)
      .then((set) => { if (!cancelled) setUninitializedBonds(set); })
      .catch(() => { if (!cancelled) setUninitializedBonds(new Set()); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection, bondPubkeysKey]);

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

  // canSellYield is the single source of truth for whether a duration is
  // *quotable* (alt_pubkey, standard, market, liquidity); fundability by the
  // selected source is tracked separately as `fundGate`.
  const quarters = availableMaturities.map((matId) => {
    const info = QUARTER_INFO[matId] ?? {
      label: maturities[matId]?.human_readable ?? matId,
      pts: null,
    };

    const maturity = maturities[matId];
    const bond = selectedValidatorVoteAccount
      ? bonds[`${selectedValidatorVoteAccount}:${matId}`]
      : undefined;
    // Issuance-accrual start for this specific bond; fall back to wall-clock
    // only for the first render before the batched resolve lands.
    const ds = (bond && depositStartByBond[bond.pubkey]) ?? Date.now() / 1000;
    const baseStatus: SellYieldStatus = selectedValidatorVoteAccount
      ? canSellYield({
          validatorVoteAccount: selectedValidatorVoteAccount,
          maturityId: matId,
          amountSol: parsedAmount,
          depositStartTs: ds,
          validators,
          bonds,
          markets,
        })
      : {
          ok: false,
          code: SELL_YIELD_CODES.VALIDATOR_NOT_CONFIGURED,
          reason: "No validator selected.",
        };

    const isLiquidSol = selectedStakeAccountPubkey === "liquid-sol";
    const bondPubkey = bond?.pubkey;
    const isUninitialized =
      bondPubkey != null && uninitializedBonds != null && uninitializedBonds.has(bondPubkey);
    let fundGate: FundGate = "none";
    if (baseStatus.ok && bondPubkey != null) {
      if (isLiquidSol) {
        // Liquid SOL can only open an uninitialized lockup; fail closed while the
        // init set is still loading (null).
        if (uninitializedBonds == null || !isUninitialized) fundGate = "needs-stake";
      } else if (uninitializedBonds != null && isUninitialized) {
        // A stake account can't open a brand-new lockup (fails open while loading).
        fundGate = "needs-liquid";
      }
    }

    let grossYield = 0;
    if (baseStatus.ok) {
      const rtMarket = markets[`${selectedValidatorVoteAccount}-${matId}-RT`];
      const estimatedRt = bond
        ? estimateRtFromStake({
            amountSol: parsedAmount,
            issuanceTs: bond.issuance_ts,
            maturityTs: bond.maturity_ts,
            depositStartTs: ds,
          })
        : 0;
      const liq = rtMarket?.bids?.length
        ? checkSellLiquidity(rtMarket.bids, estimatedRt)
        : null;
      grossYield = (liq?.expectedFillPrice ?? 0) * estimatedRt;
    }
    const netYield = applyTradingFee(grossYield);
    const daysToMaturity = Math.max(
      0,
      Math.ceil((Number(maturity.maturity_timestamp) - Date.now() / 1000) / 86400),
    );

    // Actionable only when it's both quotable and fundable by the chosen source.
    const canReview = baseStatus.ok && fundGate === "none";
    return { matId, ...info, baseStatus, fundGate, canReview, grossYield, netYield, daysToMaturity };
  });

  // Telemetry: log each (validator, maturity, code) gate once per session —
  // useful for support and for spotting validators that have demand but aren't
  // yet fully set up. Fundability gates map back to the lockup-state codes.
  const loggedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!selectedValidatorVoteAccount) return;
    for (const q of quarters) {
      const code = !q.baseStatus.ok
        ? q.baseStatus.code
        : q.fundGate === "needs-stake"
          ? SELL_YIELD_CODES.LOCKUP_INITIALIZED
          : q.fundGate === "needs-liquid"
            ? SELL_YIELD_CODES.LOCKUP_UNINITIALIZED
            : null;
      if (code == null) continue;
      const key = `${code}:${selectedValidatorVoteAccount}:${q.matId}`;
      if (loggedRef.current.has(key)) continue;
      loggedRef.current.add(key);
      const reason = !q.baseStatus.ok
        ? q.baseStatus.reason
        : q.fundGate === "needs-stake"
          ? "Initialized lockup selected on the liquid path — needs staked SOL."
          : "New lockup selected on the stake path — first deposit must be liquid SOL.";
      console.warn(
        `[Pye] ${code}: validator ${selectedValidatorVoteAccount}, maturity ${q.matId} — ${reason}`,
      );
    }
  }, [quarters, selectedValidatorVoteAccount]);

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

        {/* Duration rows — selectable whenever quotable; fundability shows near the CTA. */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {quarters.map((q) => {
            const isSelected = selectedMaturityId === q.matId;
            const quotable = q.baseStatus.ok;
            const labelColor = !quotable
              ? c.muted
              : isSelected ? c.primary : c.secondary;
            return (
              <div
                key={q.matId}
                className={isSelected ? "pye-pill pye-pill--selected" : "pye-pill"}
                onClick={quotable ? () => setSelectedMaturity(q.matId as MaturityId) : undefined}
                style={{
                  width: "100%",
                  minHeight: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 16px",
                  borderRadius: 8,
                  cursor: quotable ? "pointer" : "not-allowed",
                  background: isSelected ? c.bg : c.raised,
                  borderTop: `1px solid ${isSelected ? c.shadow : c.highlight}`,
                  boxShadow: isSelected
                    ? `inset 0 -1px 0 ${c.highlight}`
                    : `inset 0 -1px 0 ${c.shadow}`,
                  transition: "background 0.1s",
                  opacity: quotable ? 1 : 0.7,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={font(15, labelColor, isSelected ? 500 : 400)}>
                    {q.label}
                  </span>
                  <span style={font(12, c.muted)}>
                    {q.daysToMaturity} {q.daysToMaturity === 1 ? "day" : "days"}
                  </span>
                </div>
                {quotable ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                    <span
                      style={{
                        ...font(15, c.green, 500),
                        fontVariantNumeric: "lining-nums tabular-nums",
                      }}
                    >
                      {q.netYield < 0.0001
                        ? "< 0.0001 SOL"
                        : `+${formatSolAmount(q.netYield, 3)} SOL`}
                    </span>
                    {POINTS_ENABLED && q.pts && (
                      <span style={font(12, c.purple)}>{q.pts}</span>
                    )}
                  </div>
                ) : (
                  <span
                    style={{
                      ...font(12, c.muted),
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: c.lowered,
                      flexShrink: 0,
                    }}
                  >
                    {GATE_HEADLINE[q.baseStatus.code] ?? "Not available"}
                  </span>
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
            {sel.baseStatus.ok ? (
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
            ) : (
              <>
                <p style={{ ...displayFont(22, c.muted), lineHeight: 1.2 }}>
                  {GATE_HEADLINE[sel.baseStatus.code] ?? "Not available"}
                </p>
                <p style={font(12, c.muted)}>{sel.baseStatus.reason}</p>
                <p style={{ ...font(10, c.muted), letterSpacing: "0.02em", marginTop: 4 }}>
                  {sel.baseStatus.code}
                </p>
              </>
            )}
          </div>
        )}

      </div>

      {/* Fundability messages — why Review is disabled and what to do next. */}
      {sel?.fundGate === "needs-stake" && (
        <p style={{ ...font(13, c.red, 500), textAlign: "center" }}>
          A minimum of 1 SOL in an active stake account with {validatorName} is
          needed.
        </p>
      )}
      {sel?.fundGate === "needs-liquid" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <p style={{ ...font(13, c.red, 500), textAlign: "center" }}>
            1 liquid SOL is required
          </p>
          <Tooltip position="above" text="The first deposit for a given duration must be made with liquid SOL. After that, existing stake accounts are accepted." />
        </div>
      )}

      <CTA
        label="Review"
        onClick={() => navigate("review-quote")}
        disabled={!selectedMaturityId || !sel?.canReview}
        purple
      />
    </>
  );
}
