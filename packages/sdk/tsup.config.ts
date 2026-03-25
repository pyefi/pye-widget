import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    react: "src/react.ts",
  },
  format: ["esm"],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  external: [
    "react",
    "react-dom",
    "@solana/web3.js",
    "@solana/spl-token",
    "@solana/wallet-adapter-react",
    "@solana/kit",
    "@cks-systems/manifest-sdk",
    "@supabase/supabase-js",
  ],
});
