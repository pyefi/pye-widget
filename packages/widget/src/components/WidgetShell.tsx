import { useWidgetStore } from "../stores/widget-store";
import { Widget, Body, Footer, StepHeader } from "./shared/Layout";
import HomeScreen from "./screens/HomeScreen";
import YieldForwardIntro from "./screens/YieldForwardIntro";
import ConnectWallet from "./screens/ConnectWallet";
import SelectPosition from "./screens/SelectPosition";
import ChooseAmount from "./screens/ChooseAmount";
import ChooseDuration from "./screens/ChooseDuration";
import ReviewQuote from "./screens/ReviewQuote";
import StepComplete from "./screens/StepComplete";

interface WidgetShellProps {
  validatorName?: string;
}

const STEP_CONFIG: Record<string, { step?: number; total?: number; label?: string }> = {
  "yield-forward-intro": { label: "Yield Forward" },
  "connect-wallet": { step: 1, total: 5 },
  "select-position": { step: 2, total: 5 },
  "choose-amount": { step: 3, total: 5 },
  "choose-duration": { step: 4, total: 5 },
  "review-quote": { step: 5, total: 5 },
};

export default function WidgetShell({ validatorName }: WidgetShellProps) {
  const screen = useWidgetStore((s) => s.screen);
  const goBack = useWidgetStore((s) => s.goBack);
  const reset = useWidgetStore((s) => s.reset);

  // Home has its own TabBar header — no StepHeader
  if (screen === "home") {
    return <HomeScreen validatorName={validatorName} />;
  }

  // Complete has its own custom header
  if (screen === "complete") {
    return (
      <Widget>
        <StepComplete />
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
        {screen === "yield-forward-intro" && <YieldForwardIntro />}
        {screen === "connect-wallet" && <ConnectWallet />}
        {screen === "select-position" && <SelectPosition />}
        {screen === "choose-amount" && <ChooseAmount />}
        {screen === "choose-duration" && <ChooseDuration />}
        {screen === "review-quote" && <ReviewQuote />}
      </Body>
      <Footer />
    </Widget>
  );
}
