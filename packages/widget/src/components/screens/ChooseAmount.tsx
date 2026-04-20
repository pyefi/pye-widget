import { useWidgetStore } from "../../stores/widget-store";
import { c, font } from "../design-system";
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

  const available = selectedBalance;
  const parsed = parseFloat(depositAmount) || 0;
  const pcts = [0.25, 0.5, 0.75, 1];

  const isLiquidSol = selectedPubkey === "liquid-sol";
  const GAS_RESERVE = 0.01;

  let error: string | null = null;
  let warning: string | null = null;
  if (depositAmount && parsed <= 0) error = "Amount must be greater than 0";
  if (depositAmount && parsed > available) error = `Maximum available is ${available} SOL`;
  if (!error && isLiquidSol && parsed > 0 && parsed >= available - GAS_RESERVE)
    warning = "This leaves very little SOL for transaction fees";

  const isValid = !!depositAmount && !error && parsed > 0;

  const sliderMax = available > 0 ? available : 1;
  const sliderValue = Math.min(parsed, sliderMax);
  const sliderPct = available > 0 ? Math.min(100, (sliderValue / available) * 100) : 0;

  const stepSize = Math.max(0.0001, available / 1000);

  const subtitle = validatorName
    ? `${validatorName} balance detected: ${available.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} SOL.`
    : `Balance detected: ${available.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} SOL.`;

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
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
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
            const v = parseFloat(e.target.value);
            setDepositAmount(v.toFixed(4));
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
                if (p === 1) {
                  setDepositAmount(isLiquidSol
                    ? Math.max(0, available - GAS_RESERVE).toFixed(4)
                    : String(available));
                } else {
                  setDepositAmount((available * p).toFixed(4));
                }
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
