import { color, font, button, eyebrow } from "../tokens";

export default function Hero() {
  return (
    <section style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 18, textAlign: "center", paddingTop: 56,
    }}>
      <p style={{ ...eyebrow, margin: 0 }}>
        For validators
      </p>

      <h1 style={{
        fontFamily: font.serif,
        fontWeight: 500,
        fontSize: "clamp(44px, 6.5vw, 68px)",
        lineHeight: 1.05,
        letterSpacing: "-0.03em",
        color: color.textPrimary,
        maxWidth: 900,
        margin: 0,
      }}>
        <em style={{ fontWeight: 300, fontStyle: "italic", fontSize: "0.98em" }}>
          Integrate
        </em>{" "}
        the rewards widget
        <br className="desktop-break" />{" "}
        to your app or site.
      </h1>

      <p style={{
        fontFamily: font.sans,
        fontSize: 15, lineHeight: 1.65,
        color: color.textSecondary,
        maxWidth: 580, margin: 0,
      }}>
        Embed the Pye widget in your UI or drive your stakers to ours.
        Earn on every transaction and reduce churn.
      </p>

      <div className="hero-ctas">
        <a
          href="https://docs.pye.fi/validators/rewards-widget"
          target="_blank" rel="noreferrer"
          className="btn-primary"
          style={{
            ...button.primary,
            padding: "10px 18px", fontSize: 14, fontWeight: 500,
            textDecoration: "none",
          }}
        >
          Read the docs
        </a>
        <a
          href="https://cal.com/pyefinance/integration"
          target="_blank" rel="noreferrer"
          className="btn-secondary"
          style={{
            ...button.secondary,
            padding: "10px 18px", fontSize: 14, fontWeight: 500,
            textDecoration: "none",
          }}
        >
          Book an integration call
        </a>
      </div>
    </section>
  );
}
