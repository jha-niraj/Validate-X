import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
  // Disable static optimization to avoid prerendering issues
  output: 'standalone',
};

export default nextConfig;
