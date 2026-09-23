import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  serverExternalPackages: ['@react-pdf/renderer'],
};

export default nextConfig;
