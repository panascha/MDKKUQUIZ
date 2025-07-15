import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'medquizbackend-101913825665.asia-southeast1.run.app' },
    ],
  },
};

export default nextConfig;