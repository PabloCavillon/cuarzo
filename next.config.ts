import type { NextConfig } from "next";

// React dev mode uses eval() for source-map reconstruction — allow it only in development.
const isDev = process.env.NODE_ENV === "development";

// Content Security Policy
// unsafe-inline is required for Next.js hydration scripts and framer-motion inline styles.
// frame-ancestors, base-uri, form-action and object-src still provide strong protections.
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  // Prevent browsers from inferring MIME type — stops scripts disguised as images
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Deny being embedded in iframes → prevents clickjacking
  { key: "X-Frame-Options", value: "DENY" },
  // Force HTTPS for 2 years, including subdomains — safe on Vercel
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Only send origin (no path) to external sites
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Restrict browser feature access
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  // Speed up DNS while keeping it safe
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // CSP — enforce resource loading restrictions
  { key: "Content-Security-Policy", value: CSP },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
