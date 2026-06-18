import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/flux-ui",
  assetPrefix: "/flux-ui",
  transpilePackages: ["@payglocal_ui/flux-ui"],
};

export default nextConfig;
