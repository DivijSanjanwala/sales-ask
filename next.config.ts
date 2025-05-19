import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    GHL_API_BASE: process.env.GHL_API_BASE,
    GO_HIGH_LEVEL_TOKEN: process.env.GO_HIGH_LEVEL_TOKEN,
    GO_HIGH_LEVEL_CLIENT_SECRET: process.env.GO_HIGH_LEVEL_CLIENT_SECRET,
    GO_HIGH_LEVEL_SHARED_SECRET: process.env.GO_HIGH_LEVEL_SHARED_SECRET,
  }
};

export default nextConfig;
