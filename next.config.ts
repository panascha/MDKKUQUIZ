import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      { protocol: 'https', hostname: 'medquizbackend-101913825665.asia-southeast1.run.app' },
      { protocol: 'https', hostname: 'media1.tenor.com' },
    ],
  },
};

export default nextConfig;