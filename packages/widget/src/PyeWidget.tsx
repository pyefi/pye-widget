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
import { configurePyeSDK } from "@pye/sdk";
import {
  PyeSDKProvider,
  WalletSyncer,
  BalanceSyncer,
  MarketSyncer,
} from "@pye/sdk/react";
import {
  createWidgetStore,
  WidgetStoreContext,
} from "./stores/widget-store";
import { THEME_CSS } from "./components/design-system";
import WidgetShell from "./components/WidgetShell";
import type { PyeWidgetProps } from "./types";
import "./styles/fonts.css";

export default function PyeWidget({
  rpcUrl,
  apiBaseUrl,
  supabaseUrl,
  supabaseAnonKey,
  validatorName,
  theme = "pye-dark",
  onClose,
}: PyeWidgetProps) {
  const configuredRef = useRef(false);
  if (!configuredRef.current) {
    configurePyeSDK({ rpcUrl, apiBaseUrl, supabaseUrl, supabaseAnonKey });
    configuredRef.current = true;
  }

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
            <WidgetStoreContext.Provider value={widgetStoreRef.current}>
              <WidgetShell validatorName={validatorName} />
            </WidgetStoreContext.Provider>
          </PyeSDKProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  );
}
