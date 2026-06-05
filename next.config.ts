import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow local network IP for testing across devices
  allowedDevOrigins: ["192.168.29.15", "localhost"],
};

export default nextConfig;
