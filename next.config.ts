import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const isDev = process.env.NODE_ENV !== "production";

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self'",
  "connect-src 'self' https://api.groq.com https://api.deepseek.com https://api-sandbox.duitku.com https://api-prod.duitku.com https://sandbox.duitku.com https://passport.duitku.com https://*.ingest.sentry.io",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://*.duitku.com https://duitku.com",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy.replace(/\s{2,}/g, " ").trim(),
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
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
};

// Sentry hanya aktif kalau SENTRY_DSN diisi — kalau tidak, export config biasa
export default process.env.SENTRY_DSN
  ? withSentryConfig(nextConfig, {
      silent: true,
      disableLogger: true,
      sourcemaps: { disable: true },
      widenClientFileUpload: false,
      automaticVercelMonitors: false,
    })
  : nextConfig;
