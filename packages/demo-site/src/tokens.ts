/**
 * Design tokens — reference CSS variables declared in theme.css so they
 * respond to the light/dark toggle automatically.
 *
 * Only the values actually used on this page are exposed; full foundry
 * palettes (purple ramp, action colors, granites, etc.) are not needed here.
 */

export const color = {
  layerBase: "var(--layer-base)",
  surfaceDefault: "var(--surface-default)",
  surfaceRaised: "var(--surface-raised)",
  surfaceLowered1: "var(--surface-lowered)",
  surfaceLowered2: "var(--surface-lowered-2)",

  elevationHighlight: "var(--elevation-highlight)",
  elevationShadow: "var(--elevation-shadow)",

  textPrimary: "var(--typo-primary)",
  textSecondary: "var(--typo-secondary)",

  brandPurple: "var(--brand-purple)",

  scrim: "var(--scrim)",
} as const;

export const emboss = {
  // Pye emboss pattern — top inner highlight + bottom inner shadow. Using
  // inset box-shadows so the 1px lines sit inside the border-radius and stay
  // visible on rounded cards.
  base: {
    background: color.surfaceRaised,
    boxShadow: `inset 0 1px 0 ${color.elevationHighlight}, inset 0 -1px 0 ${color.elevationShadow}`,
    borderRadius: 10,
  },
  // Flipped pattern for surfaces that sit "lower" than their parent.
  lowered: {
    background: color.surfaceLowered1,
    boxShadow: `inset 0 1px 0 ${color.elevationShadow}, inset 0 -1px 0 ${color.elevationHighlight}`,
    borderRadius: 8,
  },
  hoverBoxShadow: `inset 0 1px 0 ${color.elevationHighlight}, inset 0 -1px 0 ${color.elevationShadow}, 0 4px 8px rgba(0,0,0,0.07)`,
} as const;

export const button = {
  primary: {
    background: color.brandPurple,
    color: "#ffffff",
    border: "none",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.24), inset 0 -1px 0 rgba(0,0,0,0.24)",
    borderRadius: 6,
  },
  secondary: {
    background: color.surfaceRaised,
    color: color.textPrimary,
    border: "none",
    boxShadow: `inset 0 1px 0 ${color.elevationHighlight}, inset 0 -1px 0 ${color.elevationShadow}`,
    borderRadius: 6,
  },
} as const;

export const font = {
  sans: "'Inter', system-ui, -apple-system, sans-serif",
  serif: "'ITC Garamond Narrow', 'Times New Roman', serif",
  mono: "'Inconsolata', ui-monospace, SFMono-Regular, Menlo, monospace",
} as const;

export const eyebrow = {
  fontFamily: font.sans,
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: "0.15em",
  textTransform: "uppercase" as const,
  color: color.textSecondary,
} as const;
