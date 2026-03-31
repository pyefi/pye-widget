import { Buffer } from "buffer";
(window as any).Buffer = Buffer;

import { useState } from "react";
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

const DARK_THEMES = new Set<string>([
  "pye-dark",
  "neutral-dark",
  "midnight",
  "graphite",
]);

function brandTextColor(hex: string): string {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return "#ffffff";
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.4 ? "#000000" : "#ffffff";
}

function App() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<WidgetTheme>("pye-light");
  const [brandColor, setBrandColor] = useState("#9a4dff");
  const [brandHex, setBrandHex] = useState("#9a4dff");

  const isNeutral = theme.startsWith("neutral");
  const isDark = DARK_THEMES.has(theme);

  const handleHexInput = (val: string) => {
    setBrandHex(val);
    if (/^#[0-9a-f]{6}$/i.test(val)) setBrandColor(val);
  };

  const controlStyle: React.CSSProperties = {
    padding: "6px 10px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    background: isDark ? "#2c2c2e" : "#f2f2f2",
    color: isDark ? "#aeaeb2" : "#666",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    fontSize: 12,
    fontFamily: "'Inter', sans-serif",
    outline: "none",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: isDark ? "#0e0e10" : "#ffffff",
        fontFamily: "'Inter', sans-serif",
        transition: "background 0.2s",
      }}
    >
      {/* Theme selector */}
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value as WidgetTheme)}
        style={{
          ...controlStyle,
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 10000,
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

      {/* Brand colour picker — neutral themes only */}
      {isNeutral && (
        <div
          style={{
            ...controlStyle,
            position: "fixed",
            top: 56,
            right: 20,
            zIndex: 10000,
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
              color: isDark ? "#aeaeb2" : "#666",
              fontSize: 12,
              fontFamily: "monospace",
            }}
          />
        </div>
      )}

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          style={{
            padding: "14px 32px",
            fontSize: 16,
            fontWeight: 600,
            fontFamily: "'Inter', sans-serif",
            background: isNeutral ? brandColor : "#9a4dff",
            color: isNeutral ? brandTextColor(brandColor) : "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Open Widget
        </button>
      ) : (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.4)",
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
          {/* No voteAccount — shows all stake accounts for the connected wallet */}
          <PyeWidget
            rpcUrl="https://mainnet.helius-rpc.com/?api-key=REDACTED"
            supabaseUrl="https://tfrickmnrfyjkvjhmuik.supabase.co"
            supabaseAnonKey="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmcmlja21ucmZ5amt2amhtdWlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NDkyMDksImV4cCI6MjA1OTAyNTIwOX0.1wl2FWa5g0tkUn6yRcg1AyF6ixWN7SyoD89cFGxkQKM"
            theme={theme}
            onClose={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
