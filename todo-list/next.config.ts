import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['192.168.11.106:3000', 'localhost:3000', '192.168.18.79:3000']
    }
  },
  allowedDevOrigins: ['192.168.18.79', '192.168.11.106'],
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:3002/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;

