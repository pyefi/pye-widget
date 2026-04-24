import { color } from "../tokens";

export default function Footer() {
  return (
    <footer style={{
      borderTop: `1px solid ${color.elevationShadow}`,
      boxShadow: `inset 0 1px 0 ${color.elevationHighlight}`,
      padding: "32px 24px",
      marginTop: 48,
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 16,
      }}>
        <span style={{ fontSize: 12, color: color.textSecondary }}>© Pye Finance</span>
        <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
          <a href="https://docs.pye.fi" target="_blank" rel="noreferrer" style={link}>Docs</a>
          <a href="https://pye.fi/blog" target="_blank" rel="noreferrer" style={link}>Blog</a>
          <a href="https://x.com/pyefinance" target="_blank" rel="noreferrer" style={link}>X</a>
          <a href="#" target="_blank" rel="noreferrer" style={link}>Discord</a>
          <a href="https://t.me/pyefi" target="_blank" rel="noreferrer" style={link}>Telegram</a>
          <a href="#" target="_blank" rel="noreferrer" style={link}>LinkedIn</a>
        </div>
      </div>
    </footer>
  );
}

const link = {
  fontSize: 13,
  color: color.textSecondary,
  textDecoration: "none",
  fontWeight: 500,
} as const;
