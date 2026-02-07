import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Disable source maps in production for security/privacy
  productionBrowserSourceMaps: false,
};

export default nextConfig;
