import { useRef, useMemo, type ReactNode } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { configurePyeSDK, validators } from "@pye/sdk";
import {
  PyeSDKProvider,
  WalletSyncer,
  BalanceSyncer,
  MarketSyncer,
  ApySyncer,
} from "@pye/sdk/react";
import {
  createWidgetStore,
  WidgetStoreContext,
} from "./stores/widget-store";
import { THEME_CSS } from "./components/design-system";
import WidgetShell from "./components/WidgetShell";
import WalletChangeWatcher from "./components/WalletChangeWatcher";
import DemoSeeder from "./demo-mode/DemoSeeder";
import type { PyeWidgetProps } from "./types";

function resolveValidatorName(voteAccount?: string): string | undefined {
  if (!voteAccount) return undefined;
  for (const v of Object.values(validators)) {
    if (v.vote_account === voteAccount) return v.name;
  }
  return undefined;
}

export default function PyeWidget({
  rpcUrl,
  supabaseUrl,
  supabaseAnonKey,
  voteAccount,
  theme = "pye-light",
  onClose,
  demo = false,
}: PyeWidgetProps) {
  const configuredRef = useRef(false);
  if (!configuredRef.current) {
    configurePyeSDK({ rpcUrl, supabaseUrl, supabaseAnonKey, voteAccount });
    configuredRef.current = true;
  }

  const validatorName = useMemo(() => resolveValidatorName(voteAccount), [voteAccount]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    [],
  );

  const widgetStoreRef = useRef<ReturnType<typeof createWidgetStore>>(undefined);
  if (!widgetStoreRef.current) {
    widgetStoreRef.current = createWidgetStore({ demo });
  }

  // In demo mode we still mount ConnectionProvider + WalletProvider so the
  // wallet-adapter-react hooks have their contexts — but we skip the real
  // syncers and mount a DemoSeeder that pre-populates the SDK stores instead.
  const innerSyncers: ReactNode = demo ? (
    <DemoSeeder />
  ) : (
    <>
      <WalletSyncer />
      <BalanceSyncer />
      <MarketSyncer />
      <ApySyncer />
    </>
  );

  return (
    <div data-theme={theme}>
      <style>{THEME_CSS}</style>
      <ConnectionProvider endpoint={rpcUrl}>
        <WalletProvider wallets={wallets} autoConnect={!demo}>
          <PyeSDKProvider>
            {innerSyncers}
            <WidgetStoreContext.Provider value={widgetStoreRef.current}>
              {!demo && <WalletChangeWatcher />}
              <WidgetShell validatorName={validatorName} />
            </WidgetStoreContext.Provider>
          </PyeSDKProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  );
}
