import { useEffect, useRef } from "react";
import { useWalletStore } from "@pye/sdk/react";
import { useWidgetStore } from "../stores/widget-store";
import { Widget, Body, Footer, StepHeader } from "./shared/Layout";
import HomeScreen from "./screens/HomeScreen";
import ConnectWallet from "./screens/ConnectWallet";
import SellYield from "./screens/SellYield";
import ReviewQuote from "./screens/ReviewQuote";
import StepComplete from "./screens/StepComplete";
import RedeemComplete from "./screens/RedeemComplete";

interface WidgetShellProps {
  validatorName?: string;
}

const STEP_CONFIG: Record<string, { step?: number; total?: number; label?: string }> = {
  "connect-wallet": { label: "Connect Wallet" },
  "sell-yield": { step: 1, total: 2 },
  "review-quote": { step: 2, total: 2 },
};

export default function WidgetShell({ validatorName }: WidgetShellProps) {
  const screen = useWidgetStore((s) => s.screen);
  const goBack = useWidgetStore((s) => s.goBack);
  const reset = useWidgetStore((s) => s.reset);
  const navigate = useWidgetStore((s) => s.navigate);
  const walletPublicKey = useWalletStore((s) => s.publicKey);
  const prevWalletRef = useRef<string | null>(null);

  // Reset widget selections when wallet changes mid-flow
  useEffect(() => {
    if (!walletPublicKey) {
      prevWalletRef.current = null;
      return;
    }
    if (prevWalletRef.current && prevWalletRef.current !== walletPublicKey) {
      reset();
      navigate("sell-yield");
    }
    prevWalletRef.current = walletPublicKey;
  }, [walletPublicKey, reset, navigate, screen]);

  // Home has its own TabBar header — no StepHeader
  if (screen === "home") {
    return <HomeScreen validatorName={validatorName} />;
  }

  // Complete screens have their own custom headers
  if (screen === "complete") {
    return (
      <Widget>
        <StepComplete />
        <Footer />
      </Widget>
    );
  }

  if (screen === "redeem-complete") {
    return (
      <Widget>
        <RedeemComplete />
        <Footer />
      </Widget>
    );
  }

  const config = STEP_CONFIG[screen];

  return (
    <Widget>
      <StepHeader
        step={config?.step}
        total={config?.total}
        label={config?.label}
        hideStep={!config?.step}
        onBack={goBack}
        onClose={reset}
      />
      <Body>
        {screen === "connect-wallet" && <ConnectWallet />}
        {screen === "sell-yield" && <SellYield />}
        {screen === "review-quote" && <ReviewQuote />}
      </Body>
      <Footer />
    </Widget>
  );
}
