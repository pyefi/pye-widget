import { useState, type CSSProperties, type ReactNode } from "react";
import type { WidgetTheme } from "@pye/widget";
import type { Display } from "./ControlPanel";
import { color, font, button, emboss, eyebrow } from "../tokens";

interface Props {
  display: Display;
  theme: WidgetTheme;
  children: ReactNode;
}

/**
 * CSS-variable overrides that restyle the dashboard chrome to match the
 * widget's chosen theme. Values mirror the widget's own `THEME_CSS` so the
 * chrome and the widget inside it stay visually consistent.
 */
const themeVars: Record<WidgetTheme, CSSProperties> = {
  "pye-light": {
    "--layer-base": "#e6e3e0",
    "--surface-default": "#f1efed",
    "--surface-raised": "#f8f7f6",
    "--surface-lowered-1": "#eceae8",
    "--surface-lowered-2": "#e6e3e0",
    "--elevation-highlight": "#ffffff",
    "--elevation-shadow": "#e0ddd9",
    "--typo-primary": "#24201c",
    "--typo-secondary": "#5b554c",
  } as CSSProperties,
  "pye-dark": {
    "--layer-base": "#110f14",
    "--surface-default": "#1f1c26",
    "--surface-raised": "#2b2735",
    "--surface-lowered-1": "#110f14",
    "--surface-lowered-2": "#0a090c",
    "--elevation-highlight": "#3c364a",
    "--elevation-shadow": "#0a090c",
    "--typo-primary": "#ffffff",
    "--typo-secondary": "#d7d4dd",
  } as CSSProperties,
  graphite: {
    "--layer-base": "#1c1c1e",
    "--surface-default": "#2c2c2e",
    "--surface-raised": "#3a3a3c",
    "--surface-lowered-1": "#111113",
    "--surface-lowered-2": "#0a0a0a",
    "--elevation-highlight": "#48484a",
    "--elevation-shadow": "#000000",
    "--typo-primary": "#ffffff",
    "--typo-secondary": "#aeaeb2",
  } as CSSProperties,
};

export default function WidgetFrame({ display, theme, children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      position: "relative",
      overflow: "hidden",
      ...emboss.base,
      background: color.layerBase,
      minHeight: 720,
      ...themeVars[theme],
    }}>
      <FakeSiteChrome />

      <div className="widget-frame-body" style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 32,
      }}>
        <div style={{
          display: "flex", flexDirection: "column", gap: 10,
          alignItems: "center", textAlign: "center",
        }}>
          <h2 style={{
            fontFamily: font.sans, fontSize: 24, fontWeight: 600,
            letterSpacing: "-0.015em", lineHeight: 1.15,
            color: color.textPrimary, margin: 0,
          }}>
            Get paid for your future staking rewards
          </h2>
          <p style={{
            fontSize: 14, lineHeight: 1.5,
            color: color.textSecondary, margin: 0, maxWidth: 520,
          }}>
            Sell your future rewards on Pye and receive SOL today.
            Your stake stays delegated.
          </p>
        </div>

        {display === "inline" ? (
          <div style={{ display: "flex", justifyContent: "center" }}>
            {children}
          </div>
        ) : (
          <>
            <button
              onClick={() => setOpen(true)}
              className="btn-primary"
              style={{
                ...button.primary,
                padding: "10px 18px",
                fontSize: 14, fontWeight: 500,
                border: "none", cursor: "pointer",
              }}
            >
              Open rewards widget
            </button>
            {open && (
              <div
                onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
                style={{
                  position: "fixed", inset: 0, zIndex: 1000,
                  background: color.scrim, backdropFilter: "blur(6px)",
                  display: "flex", alignItems: "flex-start", justifyContent: "center",
                  padding: 32, overflowY: "auto",
                }}
              >
                {children}
              </div>
            )}
          </>
        )}
      </div>

      <ThemeTag theme={theme} />
    </div>
  );
}

function FakeSiteChrome() {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "12px 16px",
      background: color.surfaceDefault,
      boxShadow: `inset 0 1px 0 ${color.elevationHighlight}, inset 0 -1px 0 ${color.elevationShadow}`,
    }}>
      <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
      <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
      <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
      <span style={{
        marginLeft: 12, fontSize: 12, color: color.textSecondary,
        fontFamily: font.mono,
      }}>
        validator.example
      </span>
    </div>
  );
}

function ThemeTag({ theme }: { theme: WidgetTheme }) {
  return (
    <span style={{
      ...eyebrow,
      position: "absolute", top: 48, right: 24,
      padding: "4px 8px",
      background: color.surfaceRaised,
      border: `1px solid ${color.elevationShadow}`,
      borderTop: `1px solid ${color.elevationHighlight}`,
      boxShadow: `inset 0 -1px 0 ${color.elevationShadow}`,
      borderRadius: 6,
    }}>
      {theme}
    </span>
  );
}
