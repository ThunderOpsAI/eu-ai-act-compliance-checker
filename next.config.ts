import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.DOCKER_BUILD === 'true' ? { output: 'standalone' } : {}),
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  serverExternalPackages: ['@react-pdf/renderer'],
};

export default nextConfig;
