import { Buffer } from "buffer";
(window as any).Buffer = Buffer;

import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { PyeWidget } from "@pye/widget";
import type { WidgetTheme } from "@pye/widget";

const THEMES: { value: WidgetTheme; label: string }[] = [
  { value: "pye-light", label: "Pye Light" },
  { value: "pye-dark", label: "Pye Dark" },
  { value: "neutral-light", label: "Neutral Light" },
  { value: "neutral-dark", label: "Neutral Dark" },
  { value: "midnight", label: "Midnight" },
  { value: "graphite", label: "Graphite" },
  { value: "sand", label: "Sand" },
  { value: "rose", label: "Rose" },
];

// ── Page colors per widget theme ──

interface PageTheme {
  bg: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  accentGlow: string;
  glowTop: string;
  glowBottom: string;
  statColor: string;
  statBg: string;
  controlBg: string;
  controlText: string;
  scrim: string;
  isDark: boolean;
}

const PAGE_THEMES: Record<WidgetTheme, PageTheme> = {
  "pye-light": {
    bg: "#f1efed", text: "#24201c", muted: "rgba(36,32,28,0.45)", border: "rgba(36,32,28,0.08)",
    accent: "#9a4dff", accentGlow: "rgba(154,77,255,0.12)",
    glowTop: "rgba(154,77,255,0.18)", glowBottom: "rgba(154,77,255,0.08)",
    statColor: "#24201c", statBg: "rgba(36,32,28,0.03)",
    controlBg: "rgba(0,0,0,0.05)", controlText: "#6c6660",
    scrim: "rgba(0,0,0,0.35)", isDark: false,
  },
  "pye-dark": {
    bg: "#110F14", text: "#FFFFFF", muted: "rgba(255,255,255,0.45)", border: "rgba(255,255,255,0.08)",
    accent: "#9a4dff", accentGlow: "rgba(154,77,255,0.15)",
    glowTop: "rgba(154,77,255,0.2)", glowBottom: "rgba(154,77,255,0.08)",
    statColor: "#FFFFFF", statBg: "rgba(255,255,255,0.03)",
    controlBg: "rgba(255,255,255,0.08)", controlText: "rgba(255,255,255,0.6)",
    scrim: "rgba(0,0,0,0.6)", isDark: true,
  },
  "neutral-light": {
    bg: "#f2f2f2", text: "#1a1a1a", muted: "rgba(26,26,26,0.45)", border: "rgba(26,26,26,0.08)",
    accent: "#9a4dff", accentGlow: "rgba(154,77,255,0.08)",
    glowTop: "rgba(154,77,255,0.14)", glowBottom: "rgba(154,77,255,0.06)",
    statColor: "#1a1a1a", statBg: "rgba(0,0,0,0.03)",
    controlBg: "rgba(0,0,0,0.05)", controlText: "#666666",
    scrim: "rgba(0,0,0,0.35)", isDark: false,
  },
  "neutral-dark": {
    bg: "#141210", text: "#f0ede9", muted: "rgba(240,237,233,0.45)", border: "rgba(255,255,255,0.08)",
    accent: "#9a4dff", accentGlow: "rgba(154,77,255,0.12)",
    glowTop: "rgba(154,77,255,0.18)", glowBottom: "rgba(154,77,255,0.08)",
    statColor: "#f0ede9", statBg: "rgba(255,255,255,0.03)",
    controlBg: "rgba(255,255,255,0.08)", controlText: "rgba(255,255,255,0.6)",
    scrim: "rgba(0,0,0,0.6)", isDark: true,
  },
  midnight: {
    bg: "#0a0818", text: "#eeeaf8", muted: "rgba(238,234,248,0.45)", border: "rgba(238,234,248,0.08)",
    accent: "#7c6ef0", accentGlow: "rgba(124,110,240,0.15)",
    glowTop: "rgba(124,110,240,0.22)", glowBottom: "rgba(124,110,240,0.1)",
    statColor: "#eeeaf8", statBg: "rgba(124,110,240,0.04)",
    controlBg: "rgba(255,255,255,0.08)", controlText: "rgba(238,234,248,0.6)",
    scrim: "rgba(0,0,0,0.6)", isDark: true,
  },
  graphite: {
    bg: "#1c1c1e", text: "#ffffff", muted: "rgba(255,255,255,0.45)", border: "rgba(255,255,255,0.08)",
    accent: "#a0a0a0", accentGlow: "rgba(255,255,255,0.06)",
    glowTop: "rgba(255,255,255,0.04)", glowBottom: "rgba(255,255,255,0.02)",
    statColor: "#ffffff", statBg: "rgba(255,255,255,0.03)",
    controlBg: "rgba(255,255,255,0.08)", controlText: "rgba(255,255,255,0.6)",
    scrim: "rgba(0,0,0,0.6)", isDark: true,
  },
  sand: {
    bg: "#f7f1e6", text: "#2c1f0e", muted: "rgba(44,31,14,0.45)", border: "rgba(44,31,14,0.08)",
    accent: "#c17a24", accentGlow: "rgba(193,122,36,0.1)",
    glowTop: "rgba(193,122,36,0.15)", glowBottom: "rgba(193,122,36,0.06)",
    statColor: "#2c1f0e", statBg: "rgba(193,122,36,0.04)",
    controlBg: "rgba(0,0,0,0.05)", controlText: "#7a6248",
    scrim: "rgba(0,0,0,0.35)", isDark: false,
  },
  rose: {
    bg: "#faf3f5", text: "#2a1518", muted: "rgba(42,21,24,0.45)", border: "rgba(42,21,24,0.08)",
    accent: "#d4607a", accentGlow: "rgba(212,96,122,0.1)",
    glowTop: "rgba(212,96,122,0.16)", glowBottom: "rgba(212,96,122,0.06)",
    statColor: "#2a1518", statBg: "rgba(212,96,122,0.04)",
    controlBg: "rgba(0,0,0,0.05)", controlText: "#8a5c64",
    scrim: "rgba(0,0,0,0.35)", isDark: false,
  },
};

const STORAGE_KEY = "pye-demo-theme";
const STORAGE_BRAND_KEY = "pye-demo-brand";

function loadTheme(): WidgetTheme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && THEMES.some((t) => t.value === saved)) return saved as WidgetTheme;
  } catch {}
  return "pye-light";
}

function loadBrand(): string {
  try {
    return localStorage.getItem(STORAGE_BRAND_KEY) ?? "#E84125";
  } catch { return "#E84125"; }
}

function brandTextColor(hex: string): string {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return "#ffffff";
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.4 ? "#000000" : "#ffffff";
}

// ── Step number badge ──

function StepNum({ n, t }: { n: number; t: PageTheme }) {
  return (
    <span
      style={{
        width: 32,
        height: 32,
        minWidth: 32,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        fontWeight: 700,
        color: t.accent,
        background: t.statBg,
        border: `1px solid ${t.border}`,
      }}
    >
      {n}
    </span>
  );
}

// ── Stat card ──

function Stat({ value, label, t }: { value: string; label: string; t: PageTheme }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: "20px 0",
      }}
    >
      <span
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: t.statColor,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: 13,
          color: t.muted,
          letterSpacing: "0.02em",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ── Feature row ──

function Feature({
  step,
  title,
  desc,
  t,
}: {
  step: number;
  title: string;
  desc: string;
  t: PageTheme;
}) {
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      <StepNum n={step} t={t} />
      <div style={{ paddingTop: 4 }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: t.text, margin: 0 }}>
          {title}
        </p>
        <p
          style={{
            fontSize: 13,
            color: t.muted,
            margin: "4px 0 0",
            lineHeight: 1.5,
          }}
        >
          {desc}
        </p>
      </div>
    </div>
  );
}

// ── Global styles (injected once) ──

const GLOBAL_CSS = `
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.fade-up { animation: fadeUp 0.6s ease-out both; }
.fade-up-1 { animation-delay: 0.05s; }
.fade-up-2 { animation-delay: 0.15s; }
.fade-up-3 { animation-delay: 0.25s; }
.fade-up-4 { animation-delay: 0.35s; }
.fade-up-5 { animation-delay: 0.45s; }

.demo-cta { transition: transform 0.15s, box-shadow 0.15s, filter 0.15s; }
.demo-cta:hover { transform: translateY(-1px); filter: brightness(1.1); }
`;

// ── Main app ──

function App() {
  const [open, setOpen] = useState(false);
  const [theme, _setTheme] = useState<WidgetTheme>(loadTheme);
  const [brandColor, _setBrandColor] = useState(loadBrand);
  const [brandHex, setBrandHex] = useState(loadBrand);

  const isNeutral = theme.startsWith("neutral");
  const t = PAGE_THEMES[theme];

  // Inject global styles once
  useEffect(() => {
    const id = "pye-demo-styles";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
  }, []);

  const setTheme = (v: WidgetTheme) => {
    _setTheme(v);
    try { localStorage.setItem(STORAGE_KEY, v); } catch {}
  };
  const setBrandColor = (v: string) => {
    _setBrandColor(v);
    try { localStorage.setItem(STORAGE_BRAND_KEY, v); } catch {}
  };

  const handleHexInput = (val: string) => {
    setBrandHex(val);
    if (/^#[0-9a-f]{6}$/i.test(val)) setBrandColor(val);
  };

  const controlStyle: React.CSSProperties = {
    padding: "6px 10px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    background: t.controlBg,
    color: t.controlText,
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    fontSize: 12,
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    backdropFilter: "blur(12px)",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: t.bg,
        fontFamily: "'Inter', -apple-system, sans-serif",
        color: t.text,
        overflow: "hidden",
        transition: "background 0.4s, color 0.4s",
      }}
    >
      {/* Ambient glow — top right */}
      <div
        style={{
          position: "fixed",
          top: -200,
          right: -200,
          width: 700,
          height: 700,
          background: `radial-gradient(circle, ${t.glowTop} 0%, transparent 70%)`,
          pointerEvents: "none",
          transition: "background 0.4s",
        }}
      />
      {/* Ambient glow — bottom left */}
      <div
        style={{
          position: "fixed",
          bottom: -300,
          left: -100,
          width: 900,
          height: 900,
          background: `radial-gradient(circle, ${t.glowBottom} 0%, transparent 70%)`,
          pointerEvents: "none",
          transition: "background 0.4s",
        }}
      />

      {/* Dev controls */}
      <div
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 10000,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as WidgetTheme)}
          style={{
            ...controlStyle,
            appearance: "none",
            WebkitAppearance: "none",
            paddingRight: 28,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
          }}
        >
          {THEMES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        {isNeutral && (
          <div
            style={{
              ...controlStyle,
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 10px",
            }}
          >
            <input
              type="color"
              value={brandColor}
              onChange={(e) => {
                setBrandColor(e.target.value);
                setBrandHex(e.target.value);
              }}
              style={{
                width: 18,
                height: 18,
                border: "none",
                padding: 0,
                background: "none",
                cursor: "pointer",
                borderRadius: 3,
              }}
            />
            <input
              type="text"
              value={brandHex}
              onChange={(e) => handleHexInput(e.target.value)}
              maxLength={7}
              style={{
                width: 68,
                border: "none",
                background: "none",
                outline: "none",
                color: t.controlText,
                fontSize: 12,
                fontFamily: "monospace",
              }}
            />
          </div>
        )}
      </div>

      {/* Page content */}
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "80px 24px 60px",
          display: "flex",
          flexDirection: "column",
          gap: 48,
          position: "relative",
        }}
      >
        {/* Nav */}
        <nav
          className="fade-up fade-up-1"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              Validator XYZ
            </span>
            <span
              style={{
                fontSize: 11,
                color: t.muted,
                border: `1px solid ${t.border}`,
                borderRadius: 4,
                padding: "2px 6px",
                marginLeft: 4,
              }}
            >
              Demo
            </span>
          </div>
        </nav>

        {/* Hero */}
        <div className="fade-up fade-up-2" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <h1
            style={{
              fontSize: 48,
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              margin: 0,
              color: t.text,
            }}
          >
            Get your future
            <br />
            staking rewards{" "}
            <span style={{ color: t.accent }}>— now.</span>
          </h1>
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.6,
              color: t.muted,
              maxWidth: 480,
              margin: 0,
            }}
          >
            Forward-sell your future staking rewards and receive SOL upfront.
            Your stake stays with Validator XYZ. Your principal comes back at
            maturity.
          </p>
          <button
            className="demo-cta"
            onClick={() => setOpen(true)}
            style={{
              width: "fit-content",
              padding: "14px 36px",
              fontSize: 15,
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              background: t.accent,
              color: brandTextColor(t.accent),
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
              boxShadow:
                `0 0 24px ${t.accentGlow}, 0 4px 12px rgba(0,0,0,0.2)`,
            }}
          >
            Get paid now
          </button>
        </div>

        {/* Stats */}
        <div
          className="fade-up fade-up-3"
          style={{
            display: "flex",
            gap: 0,
            background: t.statBg,
            borderRadius: 12,
            padding: "4px 24px",
            border: `1px solid ${t.border}`,
          }}
        >
          <Stat value="6.17%" label="Current APY" t={t} />
          <Stat value="~96%" label="Yield captured" t={t} />
          <Stat value="0 SOL" label="Minimum stake" t={t} />
        </div>

        {/* How it works */}
        <div className="fade-up fade-up-4" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <h2
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: t.muted,
              margin: 0,
            }}
          >
            How it works
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Feature t={t}
              step={1}
              title="Connect your wallet"
              desc="We detect your existing stake accounts delegated to Validator XYZ automatically."
            />
            <Feature t={t}
              step={2}
              title="Choose amount and duration"
              desc="Pick how much staked SOL to forward-sell and lock into a quarterly maturity."
            />
            <Feature t={t}
              step={3}
              title="Receive SOL today"
              desc="Your future staking rewards are sold on the Pye orderbook. You get SOL upfront — your stake keeps earning."
            />
            <Feature t={t}
              step={4}
              title="Redeem at maturity"
              desc="At the end of the period, your full principal is returned to your wallet. Nothing leaves the validator."
            />
          </div>
        </div>

        {/* Footer */}
        <div
          className="fade-up fade-up-5"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `1px solid ${t.border}`,
            paddingTop: 24,
          }}
        >
          <span style={{ fontSize: 12, color: t.muted }}>
            Powered by Pye Finance
          </span>
          <span style={{ fontSize: 12, color: t.muted }}>
            Staking with Validator XYZ
          </span>
        </div>
      </div>

      {/* Widget overlay */}
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: t.scrim,
            backdropFilter: "blur(8px)",
            zIndex: 9999,
            ...(isNeutral
              ? ({
                  "--c-brand": brandColor,
                  "--c-brand-hi": "rgba(255,255,255,0.2)",
                  "--c-brand-sh": "rgba(0,0,0,0.2)",
                  "--c-brand-text": brandTextColor(brandColor),
                } as React.CSSProperties)
              : {}),
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <PyeWidget
            rpcUrl={import.meta.env.VITE_RPC_URL}
            supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
            supabaseAnonKey={import.meta.env.VITE_SUPABASE_ANON_KEY}
            voteAccount={import.meta.env.VITE_VOTE_ACCOUNT}
            theme={theme}
            onClose={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
