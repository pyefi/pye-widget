import { createElement } from "react";
import { createRoot } from "react-dom/client";
import PyeWidget from "./PyeWidget";

function mount() {
  let container = document.getElementById("pye-widget");
  if (!container) {
    container = document.createElement("div");
    container.id = "pye-widget";
    document.body.appendChild(container);
  }

  // Read config from data attributes on the script tag or container
  const script =
    document.querySelector<HTMLScriptElement>("script[data-pye-widget]") ??
    document.currentScript as HTMLScriptElement | null;

  const el = script ?? container;

  const props = {
    rpcUrl: el.dataset.rpcUrl ?? "https://api.mainnet-beta.solana.com",
    apiBaseUrl: el.dataset.apiUrl ?? "https://app.pye.fi",
    supabaseUrl: el.dataset.supabaseUrl ?? "",
    supabaseAnonKey: el.dataset.supabaseAnonKey ?? "",
    validatorName: el.dataset.validator ?? undefined,
    theme: (el.dataset.theme as "dark" | "light") ?? "dark",
  };

  const root = createRoot(container);
  root.render(createElement(PyeWidget, props));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}
