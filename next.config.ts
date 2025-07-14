import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'medquizbackend.onrender.com' },
    ],
  },
};

export default nextConfig;