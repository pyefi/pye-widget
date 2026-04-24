import { color, button, eyebrow } from "../tokens";
import ThemeToggle from "./ThemeToggle";

export default function NavBar() {
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 10,
      background: "color-mix(in srgb, var(--layer-base) 78%, transparent)",
      backdropFilter: "blur(12px)",
      borderBottom: `1px solid ${color.elevationShadow}`,
      boxShadow: `inset 0 1px 0 ${color.elevationHighlight}`,
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "20px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <a href="https://pye.fi" style={{
          display: "flex", alignItems: "center", gap: 12,
          textDecoration: "none", color: color.textPrimary,
        }}>
          {/* Light/dark variants of the Pye wordmark (same assets as the
              marketing site). CSS swaps them via [data-theme-mode]. */}
          <img
            src="/pye_logo_black.svg"
            alt="Pye"
            className="logo-light"
            style={{ height: 22 }}
          />
          <img
            src="/pye_logo_white.svg"
            alt="Pye"
            className="logo-dark"
            style={{ height: 22 }}
          />
          <span style={{
            ...eyebrow,
            paddingLeft: 10, borderLeft: `1px solid ${color.elevationShadow}`,
          }}>
            integrate
          </span>
        </a>

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <a href="https://docs.pye.fi/validators/rewards-widget" target="_blank" rel="noreferrer" className="nav-secondary-link" style={linkStyle}>Docs</a>
          <a href="https://github.com/pyefi/pye-widget" target="_blank" rel="noreferrer" className="nav-secondary-link" style={linkStyle}>GitHub</a>
          <ThemeToggle />
          <a
            href="https://cal.com/pyefinance/integration"
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
            style={{
              ...button.primary,
              fontSize: 14, fontWeight: 500,
              padding: "8px 14px",
              textDecoration: "none",
              display: "inline-flex", alignItems: "center", gap: 6,
            }}
          >
            Book a call
          </a>
        </div>
      </div>
    </nav>
  );
}

const linkStyle = {
  fontSize: 14,
  color: color.textPrimary,
  textDecoration: "none",
  fontWeight: 500,
} as const;
