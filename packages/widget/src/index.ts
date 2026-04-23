export { default as PyeWidget } from "./PyeWidget";
export type { PyeWidgetProps, WidgetTheme } from "./types";

// Demo / preview exports — used by example apps to render screens in isolation.
export { default as __DemoStepComplete } from "./components/screens/StepComplete";
export { WidgetStoreContext as __DemoWidgetStoreContext, createWidgetStore as __demoCreateWidgetStore } from "./stores/widget-store";
export { Widget as __DemoWidget, Footer as __DemoFooter } from "./components/shared/Layout";
export { THEME_CSS as __DEMO_THEME_CSS } from "./components/design-system";
