import type React from "react";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
export const c = {
  bg:        "var(--c-bg)",
  surface:   "var(--c-surface)",
  raised:    "var(--c-raised)",
  lowered:   "var(--c-lowered)",
  shadow:    "var(--c-shadow)",
  highlight: "var(--c-highlight)",
  primary:   "var(--c-primary)",
  secondary: "var(--c-secondary)",
  muted:     "var(--c-muted)",
  green:     "#0d9c5e",
  purple:    "var(--c-brand)",
  red:       "#D93B3B",
};

export const THEME_CSS = `
  [data-theme] *, [data-theme] *::before, [data-theme] *::after { box-sizing: border-box; }
  :root, [data-theme="pye-light"] {
    --c-bg:        #e6e3e0;
    --c-surface:   #f1efed;
    --c-raised:    #f8f7f6;
    --c-lowered:   #eceae8;
    --c-shadow:    #e0ddd9;
    --c-highlight: #ffffff;
    --c-primary:   #24201c;
    --c-secondary: #5b554c;
    --c-muted:     #a09b96;
    --c-brand:      #9a4dff;
    --c-brand-hi:   #b78eff;
    --c-brand-sh:   #6c24c2;
    --c-brand-text: #ffffff;
  }
  [data-theme="pye-dark"] {
    --c-bg:        #110F14;
    --c-surface:   #1F1C26;
    --c-raised:    #2B2735;
    --c-lowered:   #110F14;
    --c-shadow:    #0A090C;
    --c-highlight: #3C364A;
    --c-primary:   #FFFFFF;
    --c-secondary: #D7D4DD;
    --c-muted:     rgba(255,255,255,0.4);
    --c-brand:          #9a4dff;
    --c-brand-hi:       #b78eff;
    --c-brand-sh:       #6c24c2;
    --c-brand-text:     #ffffff;
    --fill-0:           #ffffff;
  }
  [data-theme="graphite"] {
    --c-bg:            #1c1c1e;
    --c-surface:       #2c2c2e;
    --c-raised:        #3a3a3c;
    --c-lowered:       #111113;
    --c-shadow:        #000000;
    --c-highlight:     #48484a;
    --c-primary:       #ffffff;
    --c-secondary:     #aeaeb2;
    --c-muted:         #8e8e93;
    --c-brand:         #ffffff;
    --c-brand-hi:      rgba(255,255,255,0.2);
    --c-brand-sh:      rgba(0,0,0,0.2);
    --c-brand-text:    #000000;
    --fill-0:          #ffffff;
  }
  /* ─── Hover rules (replaces JS useState hover state) ─────────────── */
  .pye-hoverable {
    transition: background 160ms cubic-bezier(0.2,0.9,0.2,1),
                transform  160ms cubic-bezier(0.2,0.9,0.2,1),
                box-shadow 160ms cubic-bezier(0.2,0.9,0.2,1) !important;
  }
  .pye-hoverable:hover {
    background: var(--c-highlight) !important;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.08), inset 0 -1px 0 var(--c-shadow) !important;
  }
  .pye-pill:not(.pye-pill--selected):hover { background: var(--c-highlight) !important; }
  .pye-cta-purple:hover:not(:disabled) { filter: brightness(1.15); }
  .pye-cta-default:hover:not(:disabled) { background: var(--c-highlight) !important; }
  .pye-redeem-btn:hover:not(:disabled) { filter: brightness(1.15); }

  /* ─── Press feedback (scale 0.98 on active) ──────────────────────── */
  .pye-cta-purple, .pye-cta-default, .pye-redeem-btn, .pye-pill {
    transition: background 120ms cubic-bezier(0.2,0.9,0.2,1),
                filter     120ms cubic-bezier(0.2,0.9,0.2,1),
                transform  120ms cubic-bezier(0.2,0.9,0.2,1) !important;
  }
  .pye-cta-purple:active:not(:disabled),
  .pye-cta-default:active:not(:disabled),
  .pye-redeem-btn:active:not(:disabled),
  .pye-pill:active {
    transform: scale(0.98);
  }
  @media (prefers-reduced-motion: reduce) {
    .pye-hoverable, .pye-hoverable:hover,
    .pye-cta-purple, .pye-cta-default, .pye-redeem-btn, .pye-pill,
    .pye-cta-purple:active, .pye-cta-default:active, .pye-redeem-btn:active, .pye-pill:active {
      transform: none !important;
      transition: background 120ms, filter 120ms !important;
    }
  }

  /* ─── Skeleton shimmer ───────────────────────────────────────── */
  @keyframes pye-skeleton-pulse {
    0%, 100% { opacity: 0.55; }
    50%      { opacity: 0.85; }
  }
  .pye-skeleton {
    animation: pye-skeleton-pulse 1.4s ease-in-out infinite;
    background: linear-gradient(
      90deg,
      var(--c-lowered) 0%,
      var(--c-shadow) 50%,
      var(--c-lowered) 100%
    );
    background-size: 200% 100%;
    border-radius: 4px;
  }
  @media (prefers-reduced-motion: reduce) {
    .pye-skeleton { animation: none; opacity: 0.7; }
  }

  /* ─── Step transition: subtle translate + fade on mount ──────── */
  @keyframes pye-step-in {
    0%   { transform: translateY(8px); opacity: 0; }
    100% { transform: translateY(0);   opacity: 1; }
  }
  .pye-step-in {
    animation: pye-step-in 280ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
    will-change: transform, opacity;
    display: flex;
    flex-direction: column;
    gap: 16px;
    flex: 1;
    min-height: 0;
  }
  @media (prefers-reduced-motion: reduce) {
    .pye-step-in { animation: none; }
  }
`;

export const DISPLAY_FONT = "'Inter', sans-serif";

export const font = (size: number, color = c.primary, weight = 400): React.CSSProperties => ({
  fontFamily: "'Inter', sans-serif",
  fontSize: size,
  fontWeight: weight,
  color,
  lineHeight: 1.5,
  margin: 0,
  fontFeatureSettings: "'zero' 1",
});

export const displayFont = (size: number, color = c.primary, weight = 400): React.CSSProperties => ({
  fontFamily: DISPLAY_FONT,
  fontSize: size,
  fontWeight: weight,
  color,
  lineHeight: 1.2,
  fontFeatureSettings: "'zero' 1",
  margin: 0,
});

export function brandTextColor(hex: string): string {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return "#ffffff";
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const lin = (v: number) => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  const lum = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return lum > 0.179 ? "#000000" : "#ffffff";
}

export const MARKET_RATE = 0.85;

/** Format a SOL amount showing at least 2 significant digits, never scientific notation. */
export function formatSolAmount(value: number, minDecimals = 4): string {
  if (value === 0) return "0";
  // Find how many decimals needed to show 2 significant digits
  const digits = value < 1 ? Math.max(minDecimals, -Math.floor(Math.log10(Math.abs(value))) + 1) : minDecimals;
  return value.toFixed(digits);
}
export const yieldMap: Record<string, number> = { Q2: 0.43, Q3: 0.85, Q4: 1.28, Q1: 1.70 };
export const pointsMap: Record<string, string> = { Q3: "2x points multiplier", Q4: "3x points multiplier", Q1: "4x points multiplier" };

// Feature flags
export const POINTS_ENABLED = false;
