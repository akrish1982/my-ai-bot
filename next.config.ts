import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Enables portable builds for VPS/Docker deployment
};

export default nextConfig;
