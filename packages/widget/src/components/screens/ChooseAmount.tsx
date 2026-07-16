import { useEffect, useRef, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import {
  getStakeMinimumDelegationLamports,
  getStakeRentExemptLamports,
  solToLamports,
  validateStakeDepositAmount,
  validateSolDepositAmount,
} from "@pyefi/sdk";
import { useWidgetStore } from "../../stores/widget-store";
import {
  c, font, formatSolAmount,
  truncateAmount, exactAmountString, AMOUNT_DUST_LAMPORTS, FEE_BUFFER_LAMPORTS,
} from "../design-system";
import { StepTitle, CTA, InlineError, Spacer } from "../shared/Layout";

const SLIDER_CSS = `
  .pye-amount-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 4px;
    border-radius: 999px;
    background: transparent;
    outline: none;
    cursor: pointer;
  }
  .pye-amount-slider::-webkit-slider-runnable-track {
    height: 4px;
    border-radius: 999px;
    background: linear-gradient(to right, var(--c-brand) var(--pye-slider-pct, 0%), var(--c-shadow) var(--pye-slider-pct, 0%));
  }
  .pye-amount-slider::-moz-range-track {
    height: 4px;
    border-radius: 999px;
    background: var(--c-shadow);
  }
  .pye-amount-slider::-moz-range-progress {
    height: 4px;
    border-radius: 999px;
    background: var(--c-brand);
  }
  .pye-amount-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--c-surface);
    border: 2px solid var(--c-brand);
    margin-top: -7px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.15);
    cursor: pointer;
  }
  .pye-amount-slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--c-surface);
    border: 2px solid var(--c-brand);
    box-shadow: 0 2px 4px rgba(0,0,0,0.15);
    cursor: pointer;
  }
`;

export default function ChooseAmount() {
  const navigate = useWidgetStore((s) => s.navigate);
  const depositAmount = useWidgetStore((s) => s.depositAmount);
  const setDepositAmount = useWidgetStore((s) => s.setDepositAmount);
  const selectedBalance = useWidgetStore((s) => s.selectedStakeAccountBalance);
  const selectedPubkey = useWidgetStore((s) => s.selectedStakeAccountPubkey);
  const validatorName = useWidgetStore((s) => s.selectedValidatorName);

  const { connection } = useConnection();
  const [stakeMinLamports, setStakeMinLamports] = useState<number | null>(null);
  const [rentLamports, setRentLamports] = useState<number | null>(null);
  const [minFetchFailed, setMinFetchFailed] = useState(false);

  useEffect(() => {
    setMinFetchFailed(false);
    let cancelled = false;
    Promise.all([
      getStakeMinimumDelegationLamports(connection),
      getStakeRentExemptLamports(connection),
    ])
      .then(([min, rent]) => {
        if (cancelled) return;
        setStakeMinLamports(min);
        setRentLamports(rent);
      })
      .catch(() => {
        if (!cancelled) setMinFetchFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [connection]);

  const available = selectedBalance;
  const parsed = parseFloat(depositAmount) || 0;
  const pcts = [0.25, 0.5, 0.75, 1];

  // Pill clicks commit the final amount to the store immediately and only
  // animate a display override on top — so an unmount mid-ramp can never strand
  // a truncated value as the deposit.
  const rafRef = useRef<number | null>(null);
  const [displayOverride, setDisplayOverride] = useState<string | null>(null);
  useEffect(() => () => { if (rafRef.current != null) cancelAnimationFrame(rafRef.current); }, []);

  const cancelRamp = () => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setDisplayOverride(null);
  };

  // Display-only ramp toward `target`; clears the override on completion.
  const rampDisplay = (target: number, from: number) => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced || Math.abs(target - from) < 1e-9) { setDisplayOverride(null); return; }

    const duration = 500;
    const startTime = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3); // easeOutCubic
    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      if (t >= 1) {
        rafRef.current = null;
        setDisplayOverride(null);
        return;
      }
      setDisplayOverride(truncateAmount(from + (target - from) * ease(t)));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const isLiquidSol = selectedPubkey === "liquid-sol";

  // Liquid-SOL ceiling = full balance minus rent and fee buffer; null when rent
  // is unknown, in which case it falls back to the full balance below.
  const maxLiquidLamports =
    isLiquidSol && rentLamports != null
      ? Math.max(0, solToLamports(available) - rentLamports - FEE_BUFFER_LAMPORTS)
      : null;
  const maxLiquidSol = maxLiquidLamports != null ? maxLiquidLamports / 1e9 : null;

  let error: string | null = null;
  let warning: string | null = null;
  if (depositAmount && parsed <= 0) error = "Amount must be greater than 0";
  const amountCeil = isLiquidSol && maxLiquidSol != null ? maxLiquidSol : available;
  if (depositAmount && parsed > amountCeil) {
    error = `Maximum available is ${formatSolAmount(amountCeil)} SOL`;
  }
  if (!error && isLiquidSol && parsed > 0 && stakeMinLamports != null) {
    const v = validateSolDepositAmount({
      amountLamports: solToLamports(parsed),
      minDelegationLamports: stakeMinLamports,
    });
    if (!v.ok) error = v.message;
  }
  if (
    !error &&
    !isLiquidSol &&
    parsed > 0 &&
    stakeMinLamports != null
  ) {
    const v = validateStakeDepositAmount({
      amountLamports: solToLamports(parsed),
      delegatedLamports: solToLamports(available),
      minDelegationLamports: stakeMinLamports,
    });
    if (!v.ok) error = v.message;
  }
  if (!error && !warning && minFetchFailed && parsed > 0) {
    warning = "Couldn't verify Solana's staking minimums — your amount will be re-checked at signing.";
  }

  const isValid = !!depositAmount && !error && parsed > 0;

  // The input and slider render the display override while a ramp animates;
  // validation and the CTA always use the committed store value above.
  const displayedAmount = displayOverride ?? depositAmount;
  const displayedParsed = parseFloat(displayedAmount) || 0;

  const sliderMax = isLiquidSol && maxLiquidSol != null
    ? (maxLiquidSol > 0 ? maxLiquidSol : 1)
    : (available > 0 ? available : 1);
  const sliderValue = Math.min(displayedParsed, sliderMax);
  const sliderPct = sliderMax > 0 ? Math.min(100, (sliderValue / sliderMax) * 100) : 0;

  const stepSize = Math.max(0.0001, available / 1000);

  const availableLabel = formatSolAmount(available);
  const subtitle = validatorName
    ? `${validatorName} balance detected: ${availableLabel} SOL.`
    : `Balance detected: ${availableLabel} SOL.`;

  return (
    <>
      <style>{SLIDER_CSS}</style>
      <StepTitle title="How much of your stake do you want to sell rewards for?" subtitle={subtitle} />

      <div style={{
        background: c.raised,
        borderTop: `1px solid ${c.highlight}`,
        boxShadow: `inset 0 -1px 0 ${c.shadow}`,
        borderRadius: 8,
        padding: 16,
        marginTop: 8,
        display: "flex", flexDirection: "column", gap: 16,
      }}>
        {/* Input */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: c.bg, borderRadius: 8, padding: "8px 16px",
          borderTop: `1px solid ${error ? c.red : c.shadow}`,
          boxShadow: error
            ? `inset 0 -1px 0 ${c.highlight}, 0 0 0 1px ${c.red}`
            : `inset 0 -1px 0 ${c.highlight}`,
        }}>
          <input
            type="number"
            value={displayedAmount}
            onChange={(e) => {
              cancelRamp();
              setDepositAmount(e.target.value);
            }}
            min={0.0001}
            max={available}
            placeholder="0"
            style={{
              background: "none", border: "none", outline: "none",
              ...font(24, c.green, 500),
              width: "100%",
              fontVariantNumeric: "tabular-nums",
            }}
          />
          <span style={font(15, c.secondary)}>SOL</span>
        </div>

        {/* Slider */}
        <input
          type="range"
          className="pye-amount-slider"
          min={0}
          max={sliderMax}
          step={stepSize}
          value={sliderValue}
          onChange={(e) => {
            cancelRamp();
            const raw = parseFloat(e.target.value);
            // The range input quantizes to step multiples and can land one step
            // short of the true max, so a position within AMOUNT_DUST_LAMPORTS of
            // the top writes the EXACT full balance (no-split full deposit); any
            // other position keeps the 4-decimal display.
            const gapLamports = solToLamports(available) - solToLamports(raw);
            const s = !isLiquidSol && gapLamports >= 0 && gapLamports < AMOUNT_DUST_LAMPORTS
              ? exactAmountString(available)
              : truncateAmount(raw);
            if (s !== depositAmount) setDepositAmount(s);
          }}
          style={{ "--pye-slider-pct": `${sliderPct}%` } as React.CSSProperties}
        />

        {/* % pills */}
        <div style={{ display: "flex", gap: 8 }}>
          {pcts.map((p) => (
            <button
              key={p}
              type="button"
              className="pye-pill"
              onClick={() => {
                const target = p === 1
                  ? (isLiquidSol ? (maxLiquidSol ?? Math.max(0, available - FEE_BUFFER_LAMPORTS / 1e9)) : available)
                  : available * p;
                // 100% on a stake account commits the EXACT full balance (no-split
                // full deposit); other pills keep 4-dp. Display-only ramp follows.
                setDepositAmount(
                  p === 1 && !isLiquidSol ? exactAmountString(available) : truncateAmount(target),
                );
                rampDisplay(target, displayedParsed);
              }}
              style={{
                flex: 1, borderRadius: 8,
                border: "none",
                borderTop: `1px solid ${c.highlight}`,
                cursor: "pointer",
                background: c.surface,
                ...font(14, c.secondary),
                boxShadow: `inset 0 -1px 0 ${c.shadow}`,
                padding: "8px 4px",
                transition: "background 0.1s",
              }}
            >
              {p * 100}%
            </button>
          ))}
        </div>
      </div>

      <InlineError message={error ?? ""} />
      {!error && warning && <p style={{ ...font(14, c.red), marginTop: 4 }}>{warning}</p>}

      <Spacer />
      <CTA
        label="Continue"
        onClick={() => navigate("choose-duration")}
        disabled={!isValid}
        purple
      />
    </>
  );
}
