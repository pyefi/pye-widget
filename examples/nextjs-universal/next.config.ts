import path from "path";
import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

// Load .env.local from the monorepo root so examples share one set of secrets
loadEnvConfig(path.resolve(__dirname, "../.."));

const nextConfig: NextConfig = {
  transpilePackages: ["@pye/sdk", "@pye/widget"],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

export default nextConfig;
