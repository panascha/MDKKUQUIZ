import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      { protocol: 'https', hostname: 'medquizbackend-101913825665.asia-southeast1.run.app' },
      { protocol: 'https', hostname: 'medquizbackend-production-04fe.up.railway.app' },
      { protocol: 'https', hostname: 'media1.tenor.com' },
      { protocol: 'http', hostname: '10.101.111.139' , port: '5000', pathname: '/**'},
      { protocol: 'https', hostname: '10.101.111.139' },
      { protocol: 'https', hostname: 'mseb.md.kku.ac.th' },
    ],
  },
};

export default nextConfig;
