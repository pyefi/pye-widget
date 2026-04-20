import { useEffect, useRef } from "react";
import { useWalletStore } from "@pye/sdk/react";
import { useWidgetStore } from "../stores/widget-store";
import { Widget, Body, Footer, StepHeader } from "./shared/Layout";
import WelcomeScreen from "./screens/WelcomeScreen";
import ConnectWallet from "./screens/ConnectWallet";
import SelectPosition from "./screens/SelectPosition";
import ChooseAmount from "./screens/ChooseAmount";
import ChooseDuration from "./screens/ChooseDuration";
import ReviewQuote from "./screens/ReviewQuote";
import RedeemList from "./screens/RedeemList";
import StepComplete from "./screens/StepComplete";
import RedeemComplete from "./screens/RedeemComplete";

interface WidgetShellProps {
  validatorName?: string;
}

const STEP_CONFIG: Record<string, { step?: number; total?: number; label?: string }> = {
  "select-position": { step: 1, total: 4 },
  "choose-amount": { step: 2, total: 4 },
  "choose-duration": { step: 3, total: 4 },
  "review-quote": { step: 4, total: 4 },
};

export default function WidgetShell({ validatorName }: WidgetShellProps) {
  const screen = useWidgetStore((s) => s.screen);
  const goBack = useWidgetStore((s) => s.goBack);
  const reset = useWidgetStore((s) => s.reset);
  const navigate = useWidgetStore((s) => s.navigate);
  const walletPublicKey = useWalletStore((s) => s.publicKey);
  const walletStatus = useWalletStore((s) => s.status);
  const prevWalletRef = useRef<string | null>(null);
  const initializedRef = useRef(false);

  // Initial screen: if a wallet is already connected when the widget mounts,
  // skip connect-wallet and go straight to welcome.
  useEffect(() => {
    if (initializedRef.current) return;
    if (walletStatus === "connected" && screen === "connect-wallet") {
      navigate("welcome");
    }
    initializedRef.current = true;
  }, [walletStatus, screen, navigate]);

  // Reset widget selections when wallet changes mid-flow
  useEffect(() => {
    if (!walletPublicKey) {
      prevWalletRef.current = null;
      return;
    }
    if (prevWalletRef.current && prevWalletRef.current !== walletPublicKey) {
      console.log("[WidgetShell] wallet changed mid-flow:", prevWalletRef.current, "→", walletPublicKey, "| screen:", screen);
      reset();
      navigate("welcome");
    }
    prevWalletRef.current = walletPublicKey;
  }, [walletPublicKey, reset, navigate, screen]);

  // If wallet disconnects, send user back to connect screen
  useEffect(() => {
    if (walletStatus !== "connected" && screen !== "connect-wallet") {
      reset();
    }
  }, [walletStatus, screen, reset]);

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

  // Welcome: no header at all (it's the root once connected)
  if (screen === "welcome") {
    return (
      <Widget>
        <WelcomeScreen validatorName={validatorName} />
        <Footer />
      </Widget>
    );
  }

  // Connect wallet: no header
  if (screen === "connect-wallet") {
    return (
      <Widget>
        <Body style={{ borderRadius: "10px 10px 0 0", borderTop: "none" }}>
          <div key={screen} className="pye-step-in">
            <ConnectWallet />
          </div>
        </Body>
        <Footer />
      </Widget>
    );
  }

  // Redeem list: back to welcome, no step counter
  if (screen === "redeem-list") {
    return (
      <Widget>
        <StepHeader hideStep label="Your positions" tooltipText="Each PT (Principal Token) is a 1:1 tokenised claim on your staked SOL. It accrues no rewards — those were sold upfront. Redeem at maturity to receive your full SOL stake back." onBack={goBack} onClose={reset} />
        <RedeemList />
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
        hideStep={!config?.step}
        onBack={goBack}
        onClose={reset}
      />
      <Body>
        <div key={screen} className="pye-step-in">
          {screen === "select-position" && <SelectPosition />}
          {screen === "choose-amount" && <ChooseAmount />}
          {screen === "choose-duration" && <ChooseDuration />}
          {screen === "review-quote" && <ReviewQuote />}
        </div>
      </Body>
      <Footer />
    </Widget>
  );
}
