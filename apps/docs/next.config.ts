import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/flux-ui",
  assetPrefix: process.env.NODE_ENV === "production" ? "/flux-ui" : undefined,
  transpilePackages: ["@payglocal_ui/flux-ui"],
};

export default nextConfig;
