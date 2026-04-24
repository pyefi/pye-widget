import type { WidgetTheme } from "@pye/widget";
import { color, font, emboss, eyebrow } from "../tokens";

export type DataSource = "demo" | "live";
export type Display = "inline" | "modal";

export interface ValidatorChoice {
  label: string;
  vote_account: string;
}

interface Props {
  theme: WidgetTheme;
  onTheme: (t: WidgetTheme) => void;
  dataSource: DataSource;
  onDataSource: (d: DataSource) => void;
  display: Display;
  onDisplay: (d: Display) => void;
  voteAccount: string;
  onVoteAccount: (v: string) => void;
  validatorChoices: ValidatorChoice[];
}

export default function ControlPanel({
  theme, onTheme,
  dataSource, onDataSource,
  display, onDisplay,
  voteAccount, onVoteAccount,
  validatorChoices,
}: Props) {
  return (
    <aside className="demo-controls" style={{
      padding: 20,
      ...emboss.base,
      background: color.surfaceDefault,
      display: "flex", flexDirection: "column", gap: 20,
    }}>
      <div>
        <h3 style={{
          fontFamily: font.sans, fontSize: 16, fontWeight: 600,
          margin: 0, color: color.textPrimary, letterSpacing: "-0.01em",
          lineHeight: 1,
        }}>
          Customize
        </h3>
        <p style={{
          fontSize: 13, color: color.textSecondary,
          margin: "6px 0 0", lineHeight: 1.4,
        }}>
          Change how the widget looks and behaves.
        </p>
      </div>

      <Field
        label="Data source"
        hint={dataSource === "demo" ? "No wallet needed — mocked data + tx." : "Live mainnet — real wallet, real tx."}
      >
        <Segmented value={dataSource} onChange={onDataSource} options={[
          { value: "demo", label: "Demo" },
          { value: "live", label: "Live" },
        ]} />
      </Field>

      <Field
        label="Validator"
        hint={voteAccount ? "Single-validator — only your delegated stake." : "Universal — all supported validators."}
      >
        <div style={{ position: "relative" }}>
          <select
            value={voteAccount}
            onChange={(e) => onVoteAccount(e.target.value)}
            style={selectStyle}
          >
            <option value="">Universal (all validators)</option>
            {validatorChoices.map((v) => (
              <option key={v.vote_account} value={v.vote_account}>{v.label}</option>
            ))}
          </select>
          <svg
            aria-hidden
            width="12" height="12" viewBox="0 0 12 12" fill="none"
            style={{
              position: "absolute",
              right: 10, top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              color: color.textSecondary,
            }}
          >
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </Field>

      <Field label="Theme">
        <Segmented value={theme} onChange={onTheme} options={[
          { value: "pye-light", label: "Light" },
          { value: "pye-dark", label: "Dark" },
          { value: "graphite", label: "Graphite" },
        ]} />
      </Field>

      <Field label="Display">
        <Segmented value={display} onChange={onDisplay} options={[
          { value: "inline", label: "Inline" },
          { value: "modal", label: "Modal" },
        ]} />
      </Field>
    </aside>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={eyebrow}>{label}</span>
      {children}
      {hint && (
        <span style={{
          fontSize: 11, color: color.textSecondary,
          lineHeight: 1.4,
        }}>
          {hint}
        </span>
      )}
    </label>
  );
}

function Segmented<T extends string>({ value, onChange, options }: {
  value: T; onChange: (v: T) => void; options: { value: T; label: string }[];
}) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: `repeat(${options.length}, 1fr)`,
      background: color.surfaceLowered2,
      borderRadius: 8, padding: 2, gap: 2,
      // Lowered surface → flipped: top = shadow, bottom = highlight.
      boxShadow: `inset 0 1px 0 ${color.elevationShadow}, inset 0 -1px 0 ${color.elevationHighlight}`,
    }}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            style={{
              padding: "7px 10px", fontSize: 13, fontWeight: 500,
              background: selected ? color.surfaceRaised : "transparent",
              color: selected ? color.textPrimary : color.textSecondary,
              border: "none",
              // Selected pill sits "raised" above the lowered tray.
              boxShadow: selected
                ? `inset 0 1px 0 ${color.elevationHighlight}, inset 0 -1px 0 ${color.elevationShadow}`
                : "none",
              borderRadius: 6, cursor: "pointer",
              fontFamily: font.sans,
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

const selectStyle = {
  width: "100%",
  padding: "8px 30px 8px 10px", fontSize: 13, fontFamily: font.sans, fontWeight: 500,
  background: color.surfaceLowered1, color: color.textSecondary,
  border: "none",
  outline: "none",
  // Lowered → flipped: top shadow, bottom highlight.
  boxShadow: `inset 0 1px 0 ${color.elevationShadow}, inset 0 -1px 0 ${color.elevationHighlight}`,
  borderRadius: 6, cursor: "pointer",
  appearance: "none" as const,
  WebkitAppearance: "none" as const,
} as const;
