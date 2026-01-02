import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/public/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Allow images from localhost in development (private IP)
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Disable optimization for localhost images in development
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
