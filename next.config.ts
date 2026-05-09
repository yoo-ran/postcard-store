import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd1r1t0ctsj0cph.cloudfront.net',
      },
    ],
  },
};

export default nextConfig;
