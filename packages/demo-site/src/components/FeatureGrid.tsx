import type { ReactNode } from "react";
import { color, font, emboss } from "../tokens";

/**
 * Icons ported from the marketing-site validator section
 * (src/app/page.tsx → `validatorFeatures`). `currentColor` lets them inherit
 * the heading color in either theme.
 */
const IconExistingStake = (
  <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
    <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconTradingFees = (
  <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
    <path
      d="M8 2v12M10.5 5c0-1.1-1-2-2.5-2s-2.5.9-2.5 2 .9 1.5 2.5 2 2.5.9 2.5 2-1 2-2.5 2-2.5-.9-2.5-2"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
);

const IconEmbeddable = (
  <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
    <path
      d="M5.5 4L2 8l3.5 4M10.5 4L14 8l-3.5 4M9 3L7 13"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
);

const features: { title: string; desc: string; icon: ReactNode }[] = [
  {
    title: "Works with existing stake",
    desc: "Stakers trade rewards without unstaking — SOL never leaves your validator.",
    icon: IconExistingStake,
  },
  {
    title: "Earn trading fees",
    desc: "Collect a share of every trade that flows through your validator.",
    icon: IconTradingFees,
  },
  {
    title: "Embeddable",
    desc: "Add the widget into your app with a few lines of code through React/NextJS or CDN.",
    icon: IconEmbeddable,
  },
];

export default function FeatureGrid() {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ textAlign: "center" }}>
        <h2 style={{
          fontFamily: font.sans, fontSize: 26, fontWeight: 600,
          margin: 0, letterSpacing: "-0.015em", color: color.textPrimary,
        }}>
          Built for validators
        </h2>
        <p style={{ fontSize: 15, color: color.textSecondary, margin: "6px 0 0" }}>
          Everything you need, nothing you don't.
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 16,
      }}>
        {features.map((f) => (
          <div
            key={f.title}
            style={{
              ...emboss.base,
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 24,
              alignItems: "flex-start",
            }}
          >
            <div style={{
              width: 36, height: 36, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: color.layerBase,
              boxShadow: `inset 0 1px 0 ${color.elevationShadow}, inset 0 -1px 0 ${color.elevationHighlight}`,
              borderRadius: 6,
              color: color.textPrimary,
            }}>
              {f.icon}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
              <p style={{
                fontFamily: font.sans, fontSize: 15, fontWeight: 600,
                margin: 0, color: color.textPrimary, letterSpacing: "-0.005em",
              }}>
                {f.title}
              </p>
              <p style={{
                fontSize: 13.5, color: color.textSecondary,
                margin: 0, lineHeight: 1.6,
              }}>
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
