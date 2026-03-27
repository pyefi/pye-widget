import { useState } from "react";
import { useWidgetStore } from "../../stores/widget-store";
import { c, font } from "../design-system";
import { StepTitle, RecapRow, CTA, InlineError, Spacer } from "../shared/Layout";
import { SolIcon } from "../Icons";

export default function ChooseAmount() {
  const navigate = useWidgetStore((s) => s.navigate);
  const depositAmount = useWidgetStore((s) => s.depositAmount);
  const setDepositAmount = useWidgetStore((s) => s.setDepositAmount);
  const selectedBalance = useWidgetStore((s) => s.selectedStakeAccountBalance);
  const selectedPubkey = useWidgetStore((s) => s.selectedStakeAccountPubkey);
  const validatorIcon = useWidgetStore((s) => s.selectedValidatorIcon);
  const validatorName = useWidgetStore((s) => s.selectedValidatorName);

  const [hoveredPct, setHoveredPct] = useState<number | null>(null);

  const available = selectedBalance;
  const parsed = parseFloat(depositAmount);
  const pcts = [0.25, 0.5, 0.75, 1];

  let error: string | null = null;
  if (depositAmount && parsed <= 0) error = "Amount must be greater than 0";
  if (depositAmount && parsed > available) error = `Maximum available is ${available} SOL`;

  const isValid = !!depositAmount && !error && parsed > 0;

  const isLiquidSol = selectedPubkey === "liquid-sol";
  const icon = isLiquidSol ? <SolIcon /> : (
    validatorIcon ? (
      <img
        src={validatorIcon}
        alt={validatorName ?? "Validator"}
        style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
      />
    ) : <SolIcon />
  );
  const label = isLiquidSol ? "Liquid SOL" : "Staked SOL";
  const sub =
    isLiquidSol ? "" :
    validatorName ? validatorName :
    selectedPubkey ? `${selectedPubkey.slice(0, 4)}...${selectedPubkey.slice(-4)}` : "";

  return (
    <>
      <StepTitle
        title="Choose how much to stake"
        subtitle="Set how much of your staked SOL to sell future rewards from"
      />

      <RecapRow
        icon={icon}
        label={label}
        sub={sub}
        amount={available.toFixed(4)}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Label row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={font(14, c.secondary)}>Amount</span>
          <span style={font(12, c.secondary)}>
            Available: <span style={{ color: c.primary }}>{available} SOL</span>
          </span>
        </div>

        {/* Input */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: c.bg, borderRadius: 4, padding: "10px 12px",
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
            style={{
              background: "none", border: "none", outline: "none",
              ...font(14, c.primary), width: "100%",
            }}
          />
          <span style={font(12, c.secondary)}>SOL</span>
        </div>

        <InlineError message={error ?? ""} />

        {/* % badges */}
        <div style={{ display: "flex", gap: 8 }}>
          {pcts.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setDepositAmount((available * p).toFixed(4))}
              onMouseEnter={() => setHoveredPct(p)}
              onMouseLeave={() => setHoveredPct(null)}
              style={{
                flex: 1, height: 24, borderRadius: 4,
                border: "none",
                borderTop: `1px solid ${c.highlight}`,
                cursor: "pointer",
                background: hoveredPct === p ? c.highlight : c.raised,
                ...font(12, c.secondary),
                boxShadow: `inset 0 -1px 0 ${c.shadow}`,
                padding: "2px 4px",
                transition: "background 0.1s",
              }}
            >
              {p * 100}%
            </button>
          ))}
        </div>
      </div>

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
