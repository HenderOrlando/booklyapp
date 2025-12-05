const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone', // Required for Docker deployment
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_GATEWAY_URL: process.env.NEXT_PUBLIC_API_GATEWAY_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  },
  async rewrites() {
    // Solo hacer proxy al backend si estamos en modo 'serve'
    const dataMode = process.env.NEXT_PUBLIC_DATA_MODE || "mock";

    if (dataMode === "serve") {
      const apiGatewayUrl =
        process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:3000";
      return [
        {
          source: "/api/:path*",
          destination: `${apiGatewayUrl}/api/:path*`,
        },
      ];
    }

    // En modo 'mock', no hacer proxy - usar Mock Service
    return [];
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

module.exports = withNextIntl(nextConfig);
