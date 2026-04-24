import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";
import type { WidgetTheme } from "@pye/widget";
import { color, font, button } from "../tokens";

type Tab = "react" | "next" | "cdn";

interface Props {
  theme: WidgetTheme;
  voteAccount: string;
}

export default function CodeSnippet({ theme, voteAccount }: Props) {
  const [tab, setTab] = useState<Tab>("react");
  const [copied, setCopied] = useState(false);
  const [highlighted, setHighlighted] = useState("");
  const mode = useThemeMode();

  const snippet = buildSnippet(tab, theme, voteAccount);

  useEffect(() => {
    let cancelled = false;
    const lang = tab === "cdn" ? "html" : "tsx";
    codeToHtml(snippet, {
      lang,
      theme: mode === "dark" ? "github-dark-dimmed" : "github-light",
    }).then((h) => {
      if (!cancelled) setHighlighted(h);
    });
    return () => { cancelled = true; };
  }, [snippet, tab, mode]);

  const copy = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h2 style={{
            fontFamily: font.sans, fontSize: 22, fontWeight: 600,
            margin: 0, letterSpacing: "-0.015em", color: color.textPrimary,
          }}>
            Drop it in
          </h2>
          <p style={{ fontSize: 14, color: color.textSecondary, margin: "6px 0 0" }}>
            Code reflects the settings you picked above.
          </p>
        </div>
        <a
          href="https://docs.pye.fi/validators/rewards-widget"
          target="_blank" rel="noreferrer"
          style={{
            fontSize: 13, color: color.brandPurple,
            textDecoration: "none", fontWeight: 500,
          }}
        >
          See full integration docs →
        </a>
      </div>

      <div style={{
        borderRadius: 10,
        overflow: "hidden",
        background: color.surfaceRaised,
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 8px 8px 12px",
          background: color.surfaceDefault,
          borderRadius: "10px 10px 0 0",
          boxShadow: `inset 0 1px 0 ${color.elevationHighlight}, inset 0 -1px 0 ${color.elevationShadow}`,
        }}>
          <div style={{
            display: "flex", gap: 2, padding: 2,
            background: color.surfaceLowered2,
            borderRadius: 8,
            boxShadow: `inset 0 -1px 0 ${color.elevationHighlight}`,
          }}>
            {(["react", "next", "cdn"] as Tab[]).map((t) => {
              const selected = tab === t;
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    padding: "7px 10px", fontSize: 13, fontWeight: 500, fontFamily: font.sans,
                    background: selected ? color.surfaceRaised : "transparent",
                    color: selected ? color.textPrimary : color.textSecondary,
                    border: "none",
                    boxShadow: selected
                      ? `inset 0 1px 0 ${color.elevationHighlight}, inset 0 -1px 0 ${color.elevationShadow}`
                      : "none",
                    borderRadius: 6, cursor: "pointer",
                  }}
                >
                  {t === "react" ? "React (Vite)" : t === "next" ? "Next.js" : "HTML / CDN"}
                </button>
              );
            })}
          </div>
          <button
            onClick={copy}
            style={{
              ...button.secondary,
              background: color.elevationHighlight,
              padding: "6px 12px", fontSize: 12, fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <div
          className="shiki-container"
          style={{
            padding: "20px 22px", overflow: "auto",
            fontSize: 13, lineHeight: 1.7,
            fontFamily: font.mono,
            background: color.surfaceLowered2,
            borderRadius: "0 0 10px 10px",
            boxShadow: `inset 0 -1px 0 ${color.elevationHighlight}`,
          }}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </div>
    </section>
  );
}

function useThemeMode(): "light" | "dark" {
  const [mode, setMode] = useState<"light" | "dark">(() =>
    typeof document !== "undefined" &&
    document.documentElement.getAttribute("data-theme-mode") === "dark"
      ? "dark" : "light",
  );
  useEffect(() => {
    const root = document.documentElement;
    const obs = new MutationObserver(() => {
      setMode(root.getAttribute("data-theme-mode") === "dark" ? "dark" : "light");
    });
    obs.observe(root, { attributes: true, attributeFilter: ["data-theme-mode"] });
    return () => obs.disconnect();
  }, []);
  return mode;
}

function buildSnippet(tab: Tab, theme: WidgetTheme, voteAccount: string): string {
  const votePart = voteAccount ? `\n    voteAccount={import.meta.env.VITE_VOTE_ACCOUNT}` : "";
  const voteEnvLine = voteAccount ? `\nVITE_VOTE_ACCOUNT=${voteAccount}` : "";

  if (tab === "react") {
    return `import { PyeWidget } from "@pye/widget";

export default function App() {
  return (
    <PyeWidget
      rpcUrl={import.meta.env.VITE_RPC_URL}
      supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
      supabaseAnonKey={import.meta.env.VITE_SUPABASE_ANON_KEY}${votePart}
      theme="${theme}"
    />
  );
}

// .env.local
// VITE_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
// VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
// VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY${voteEnvLine ? `\n// ${voteEnvLine.trim()}` : ""}`;
  }

  if (tab === "next") {
    const nextVote = voteAccount ? `\n      voteAccount={process.env.NEXT_PUBLIC_VOTE_ACCOUNT}` : "";
    return `"use client";
import { PyeWidget } from "@pye/widget";

export default function RewardsPage() {
  return (
    <PyeWidget
      rpcUrl={process.env.NEXT_PUBLIC_RPC_URL!}
      supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!}
      supabaseAnonKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}${nextVote}
      theme="${theme}"
    />
  );
}`;
  }

  // CDN
  const cdnVote = voteAccount ? `\n    data-vote-account="${voteAccount}"` : "";
  return `<!-- Drop anywhere in your HTML -->
<div
  id="pye-widget"
  data-rpc-url="YOUR_RPC_URL"
  data-supabase-url="YOUR_SUPABASE_URL"
  data-supabase-anon-key="YOUR_SUPABASE_ANON_KEY"${cdnVote}
  data-theme="${theme}"
></div>
<script src="https://cdn.pye.fi/widget/latest/pye-widget.iife.js"></script>`;
}
