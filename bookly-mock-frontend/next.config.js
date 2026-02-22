// eslint-disable-next-line @typescript-eslint/no-var-requires
const createNextIntlPlugin = require("next-intl/plugin");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const apiGatewayUrl =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:3000";
const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3000";
const directServiceUrls = [
  process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || "http://localhost:3001",
  process.env.NEXT_PUBLIC_RESOURCES_SERVICE_URL || "http://localhost:3002",
  process.env.NEXT_PUBLIC_AVAILABILITY_SERVICE_URL || "http://localhost:3003",
  process.env.NEXT_PUBLIC_STOCKPILE_SERVICE_URL || "http://localhost:3004",
  process.env.NEXT_PUBLIC_REPORTS_SERVICE_URL || "http://localhost:3005",
];

const connectSrc = [
  "'self'",
  apiGatewayUrl,
  wsUrl,
  ...directServiceUrls,
  "wss:",
]
  .filter(Boolean)
  .filter((value, index, array) => array.indexOf(value) === index)
  .join(" ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone", // Required for Docker deployment
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "date-fns",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-toast",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-avatar",
      "@radix-ui/react-separator",
      "@radix-ui/react-label",
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              `connect-src ${connectSrc}`,
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
    ];
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

module.exports = withBundleAnalyzer(withNextIntl(nextConfig));
