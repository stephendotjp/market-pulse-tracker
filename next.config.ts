import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  basePath: isProd ? "" : "/market-pulse",
  assetPrefix: isProd ? "" : "/market-pulse",
  env: { NEXT_PUBLIC_BASE_PATH: isProd ? "" : "/market-pulse" },
};

export default nextConfig;
