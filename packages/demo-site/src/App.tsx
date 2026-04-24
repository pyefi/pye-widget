import { useState, useMemo } from "react";
import { PyeWidget } from "@pye/widget";
import type { WidgetTheme } from "@pye/widget";
import { validators } from "@pye/sdk";
import NavBar from "./components/NavBar";
import Hero from "./components/Hero";
import ControlPanel, { type DataSource, type Display } from "./components/ControlPanel";
import WidgetFrame from "./components/WidgetFrame";
import CodeSnippet from "./components/CodeSnippet";
import FeatureGrid from "./components/FeatureGrid";
import Footer from "./components/Footer";

// A curated shortlist of real allowed validators shown in the mode picker.
const PREFERRED = ["alchemy", "all-nodes", "coinbase", "helius", "binance"];
function getValidatorChoices() {
  const list = PREFERRED
    .map((id) => validators[id as keyof typeof validators])
    .filter(Boolean);
  return list.map((v) => ({ label: v!.name, vote_account: v!.vote_account }));
}

export default function App() {
  const [theme, setTheme] = useState<WidgetTheme>("pye-light");
  const [dataSource, setDataSource] = useState<DataSource>("demo");
  const [display, setDisplay] = useState<Display>("inline");

  const validatorChoices = useMemo(getValidatorChoices, []);
  // "" means universal (no voteAccount)
  const [voteAccount, setVoteAccount] = useState<string>(validatorChoices[0]?.vote_account ?? "");

  const isDemo = dataSource === "demo";

  // Env vars are only required for live mode; demo mode ignores them.
  const rpcUrl = import.meta.env.VITE_RPC_URL ?? "https://api.mainnet-beta.solana.com";
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "https://demo.invalid";
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "demo";

  return (
    <div style={{ minHeight: "100dvh" }}>
      <NavBar />

      <main className="demo-main" style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Hero />

        <section className="demo-grid">
          <WidgetFrame
            display={display}
            theme={theme}
          >
            <PyeWidget
              key={`${dataSource}-${voteAccount}-${theme}-${display}`}
              rpcUrl={rpcUrl}
              supabaseUrl={supabaseUrl}
              supabaseAnonKey={supabaseAnonKey}
              voteAccount={voteAccount || undefined}
              theme={theme}
              demo={isDemo}
            />
          </WidgetFrame>

          <ControlPanel
            theme={theme}
            onTheme={setTheme}
            dataSource={dataSource}
            onDataSource={setDataSource}
            display={display}
            onDisplay={setDisplay}
            voteAccount={voteAccount}
            onVoteAccount={setVoteAccount}
            validatorChoices={validatorChoices}
          />
        </section>

        <CodeSnippet
          theme={theme}
          voteAccount={voteAccount}
        />

        <FeatureGrid />
      </main>

      <Footer />
    </div>
  );
}
