import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

export default defineConfig(({ mode }) => {
  const isIIFE = mode === "iife";

  return {
    plugins: [
      react(),
      ...(!isIIFE ? [dts({ rollupTypes: true, tsconfigPath: "./tsconfig.json" })] : []),
    ],
    build: {
      lib: isIIFE
        ? {
            entry: "src/cdn-entry.ts",
            name: "PyeWidget",
            formats: ["iife" as const],
            fileName: () => "pye-widget.iife.js",
          }
        : {
            entry: "src/index.ts",
            formats: ["es" as const],
            fileName: () => "pye-widget.es.js",
          },
      rollupOptions: isIIFE
        ? {}
        : {
            external: [
              "react",
              "react-dom",
              "react/jsx-runtime",
              "zustand",
              "zustand/vanilla",
              "zustand/middleware/immer",
              "immer",
              "@solana/web3.js",
              "@solana/spl-token",
              "@solana/wallet-adapter-base",
              "@solana/wallet-adapter-react",
              "@solana/wallet-adapter-react-ui",
              "@solana/wallet-adapter-wallets",
              "@solana/kit",
              "@cks-systems/manifest-sdk",
              "@supabase/supabase-js",
              "@pye/sdk",
              "@pye/sdk/react",
            ],
          },
      outDir: "dist",
      emptyOutDir: !isIIFE,
      sourcemap: true,
    },
  };
});
