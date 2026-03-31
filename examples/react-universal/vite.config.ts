import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    "process.env": {},
    "process.version": JSON.stringify("v18.0.0"),
    "process.browser": true,
  },
  resolve: {
    alias: {
      stream: "stream-browserify",
      assert: "assert",
    },
  },
});
