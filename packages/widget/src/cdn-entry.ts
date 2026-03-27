import { createElement } from "react";
import { createRoot } from "react-dom/client";
import PyeWidget from "./PyeWidget";
import type { PyeWidgetProps } from "./types";

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
    (document.currentScript as HTMLScriptElement | null);

  const el = script ?? container;

  const props = {
    rpcUrl: el.dataset.rpcUrl ?? "https://api.mainnet-beta.solana.com",
    supabaseUrl: el.dataset.supabaseUrl ?? "",
    supabaseAnonKey: el.dataset.supabaseAnonKey ?? "",
    voteAccount: el.dataset.voteAccount ?? undefined,
    theme: (el.dataset.theme ?? "pye-light") as PyeWidgetProps["theme"],
  };

  const root = createRoot(container);
  root.render(createElement(PyeWidget, props));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}
