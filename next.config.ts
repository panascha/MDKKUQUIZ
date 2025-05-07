import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost'], // Allow loading images from your Node backend
  },
};

export default nextConfig;
