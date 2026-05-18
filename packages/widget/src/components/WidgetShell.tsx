import { useEffect, useRef } from "react";
import { useWalletStore } from "@pyefi/sdk/react";
import { useWidgetStore, type WidgetScreen } from "../stores/widget-store";
import { Widget, Body, Footer, StepHeader } from "./shared/Layout";
import WelcomeScreen from "./screens/WelcomeScreen";
import ConnectWallet from "./screens/ConnectWallet";
import YieldForwardIntro from "./screens/YieldForwardIntro";
import SelectPosition from "./screens/SelectPosition";
import ChooseAmount from "./screens/ChooseAmount";
import ChooseDuration from "./screens/ChooseDuration";
import ReviewQuote from "./screens/ReviewQuote";
import RedeemList from "./screens/RedeemList";
import StepComplete from "./screens/StepComplete";
import RedeemComplete from "./screens/RedeemComplete";

const STEP_CONFIG: Partial<Record<WidgetScreen, { step: number; total: number }>> = {
  "select-position": { step: 1, total: 4 },
  "choose-amount": { step: 2, total: 4 },
  "choose-duration": { step: 3, total: 4 },
  "review-quote": { step: 4, total: 4 },
};

const REDEEM_TOOLTIP =
  "Each PT (Principal Token) is a 1:1 tokenised claim on your staked SOL. It accrues no rewards — those were sold upfront. Redeem at maturity to receive your full SOL stake back.";

function HeaderlessShell({ screen, children }: { screen: WidgetScreen; children: React.ReactNode }) {
  return (
    <Widget>
      <Body style={{ borderRadius: "10px 10px 0 0", borderTop: "none" }}>
        <div key={screen} className="pye-step-in">{children}</div>
      </Body>
      <Footer />
    </Widget>
  );
}

export default function WidgetShell() {
  const screen = useWidgetStore((s) => s.screen);
  const goBack = useWidgetStore((s) => s.goBack);
  const reset = useWidgetStore((s) => s.reset);
  const navigate = useWidgetStore((s) => s.navigate);
  const walletPublicKey = useWalletStore((s) => s.publicKey);
  const walletStatus = useWalletStore((s) => s.status);
  const prevWalletRef = useRef<string | null>(null);

  useEffect(() => {
    const connected = walletStatus === "connected";
    const atIntro = screen === "yield-forward-intro" || screen === "connect-wallet";

    if (connected && atIntro) {
      navigate("welcome");
    } else if (!connected && !atIntro) {
      reset();
    }
  }, [walletStatus, screen, navigate, reset]);

  // Reset mid-flow if the connected wallet changes
  useEffect(() => {
    if (!walletPublicKey) {
      prevWalletRef.current = null;
      return;
    }
    if (prevWalletRef.current && prevWalletRef.current !== walletPublicKey) {
      reset();
      navigate("welcome");
    }
    prevWalletRef.current = walletPublicKey;
  }, [walletPublicKey, reset, navigate]);

  if (screen === "complete") {
    return <Widget><StepComplete /><Footer /></Widget>;
  }

  if (screen === "redeem-complete") {
    return <Widget><RedeemComplete /><Footer /></Widget>;
  }

  if (screen === "welcome") {
    return <Widget><WelcomeScreen /><Footer /></Widget>;
  }

  if (screen === "yield-forward-intro") {
    return <HeaderlessShell screen={screen}><YieldForwardIntro /></HeaderlessShell>;
  }

  if (screen === "connect-wallet") {
    return <HeaderlessShell screen={screen}><ConnectWallet /></HeaderlessShell>;
  }

  if (screen === "redeem-list") {
    return (
      <Widget>
        <StepHeader hideStep label="Your positions" tooltipText={REDEEM_TOOLTIP} onBack={goBack} />
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
