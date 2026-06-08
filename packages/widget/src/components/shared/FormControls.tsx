import { type CSSProperties } from "react";
import { c, font } from "../design-system";
import { InlineError } from "./Layout";

// Shared field label with an optional required marker and helper subtitle.
function FieldLabel({ label, required, subtitle }: {
  label: string;
  required?: boolean;
  subtitle?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <p style={font(15, c.primary, 500)}>
        {label}
        {required && <span style={{ color: c.red, marginLeft: 4 }}>*</span>}
      </p>
      {subtitle && <p style={font(13, c.secondary)}>{subtitle}</p>}
    </div>
  );
}

// Styled text input box — mirrors the input idiom in ChooseAmount.
function inputBoxStyle(error?: boolean): CSSProperties {
  return {
    background: c.bg,
    borderRadius: 8,
    padding: "10px 16px",
    borderTop: `1px solid ${error ? c.red : c.shadow}`,
    boxShadow: error
      ? `inset 0 -1px 0 ${c.highlight}, 0 0 0 1px ${c.red}`
      : `inset 0 -1px 0 ${c.highlight}`,
  };
}

const inputStyle: CSSProperties = {
  background: "none",
  border: "none",
  outline: "none",
  width: "100%",
  ...font(15, c.primary),
};

// Dan's TextField — label + optional helper + single-line input + inline error.
export function TextField({
  label,
  subtitle,
  placeholder,
  value,
  onChange,
  required,
  error,
  type = "text",
}: {
  label: string;
  subtitle?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string | null;
  type?: "text" | "email";
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <FieldLabel label={label} required={required} subtitle={subtitle} />
      <div style={inputBoxStyle(!!error)}>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={inputStyle}
        />
      </div>
      <InlineError message={error} />
    </div>
  );
}

const OTHER = "Other";

// Dan's ChoiceGroup — single-select radio list using the pye-pill visual style.
// Pass `onOtherChange` to append an "Other" row that reveals a free-text input.
export function ChoiceGroup({
  label,
  subtitle,
  options,
  value,
  onChange,
  required,
  otherValue,
  onOtherChange,
}: {
  label: string;
  subtitle?: string;
  options: string[];
  value: string | null;
  onChange: (value: string) => void;
  required?: boolean;
  otherValue?: string;
  onOtherChange?: (value: string) => void;
}) {
  const hasOther = onOtherChange != null;
  const allOptions = hasOther ? [...options, OTHER] : options;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <FieldLabel label={label} required={required} subtitle={subtitle} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {allOptions.map((opt) => {
          const selected = value === opt;
          return (
            <div
              key={opt}
              className={selected ? "pye-pill pye-pill--selected" : "pye-pill"}
              onClick={() => onChange(opt)}
              style={{
                width: "100%",
                minHeight: 44,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "8px 14px",
                borderRadius: 8,
                cursor: "pointer",
                background: selected ? c.bg : c.raised,
                borderTop: `1px solid ${selected ? c.shadow : c.highlight}`,
                boxShadow: selected
                  ? `inset 0 -1px 0 ${c.highlight}`
                  : `inset 0 -1px 0 ${c.shadow}`,
                transition: "background 0.1s",
              }}
            >
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  flexShrink: 0,
                  border: `1.5px solid ${selected ? c.purple : c.muted}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {selected && (
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.purple }} />
                )}
              </span>
              <span style={font(15, selected ? c.primary : c.secondary, selected ? 500 : 400)}>
                {opt}
              </span>
            </div>
          );
        })}
      </div>
      {hasOther && value === OTHER && (
        <div style={inputBoxStyle(false)}>
          <input
            type="text"
            value={otherValue ?? ""}
            onChange={(e) => onOtherChange!(e.target.value)}
            placeholder="Please specify"
            style={inputStyle}
          />
        </div>
      )}
    </div>
  );
}

// True when "Other" is selected — used by callers to gate on the free-text value.
export function isOther(value: string | null): boolean {
  return value === OTHER;
}
