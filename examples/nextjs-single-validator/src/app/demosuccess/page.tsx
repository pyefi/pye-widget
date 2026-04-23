"use client";

import { useRef } from "react";
import {
  __DemoStepComplete,
  __DemoWidget,
  __DemoFooter,
  __DemoWidgetStoreContext,
  __demoCreateWidgetStore,
  __DEMO_THEME_CSS,
} from "@pye/widget";

export default function DemoSuccessPage() {
  const storeRef = useRef<ReturnType<typeof __demoCreateWidgetStore>>(undefined);
  if (!storeRef.current) {
    const store = __demoCreateWidgetStore();
    store.setState({
      screen: "complete",
      selectedMaturityId: "q42026",
      depositAmount: "1.5",
      sellAmountSol: 0.234,
      txSignature: "5demo1111111111111111111111111111111111111111111111111111111111",
      txStatus: "success",
      txStep: "complete",
    });
    storeRef.current = store;
  }

  return (
    <div
      data-theme="pye-light"
      style={{
        minHeight: "100vh",
        background: "#f1efed",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: 60,
      }}
    >
      <style>{__DEMO_THEME_CSS}</style>
      <__DemoWidgetStoreContext.Provider value={storeRef.current}>
        <__DemoWidget>
          <__DemoStepComplete />
          <__DemoFooter />
        </__DemoWidget>
      </__DemoWidgetStoreContext.Provider>
    </div>
  );
}
