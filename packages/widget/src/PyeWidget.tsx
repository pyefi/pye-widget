import { useRef, useMemo } from "react";
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
    widgetStoreRef.current = createWidgetStore();
  }

  return (
    <div data-theme={theme}>
      <style>{THEME_CSS}</style>
      <ConnectionProvider endpoint={rpcUrl}>
        <WalletProvider wallets={wallets} autoConnect>
          <PyeSDKProvider>
            <WalletSyncer />
            <BalanceSyncer />
            <MarketSyncer />
            <ApySyncer />
            <WidgetStoreContext.Provider value={widgetStoreRef.current}>
              <WalletChangeWatcher />
              <WidgetShell validatorName={validatorName} />
            </WidgetStoreContext.Provider>
          </PyeSDKProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  );
}
