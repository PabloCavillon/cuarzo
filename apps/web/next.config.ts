import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

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
  { key: "X-Content-Type-Options",     value: "nosniff" },
  { key: "X-Frame-Options",            value: "DENY" },
  { key: "Strict-Transport-Security",  value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Referrer-Policy",            value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",         value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "X-DNS-Prefetch-Control",     value: "on" },
  { key: "Content-Security-Policy",    value: CSP },
];

// Permanent redirects from old Spanish route names to English equivalents.
// Keeps external links, bookmarks, and API clients working after the rename.
const legacyRedirects = [
  { source: "/admin/bookings/:path*", destination: "/admin/appointments/:path*", permanent: true },
  { source: "/admin/caja/:path*",     destination: "/admin/finance/:path*",      permanent: true },
  { source: "/admin/caja",            destination: "/admin/finance",             permanent: true },
  { source: "/admin/clients/:path*",  destination: "/admin/customers/:path*",    permanent: true },
  { source: "/admin/clients",         destination: "/admin/customers",           permanent: true },
  { source: "/admin/soporte/:path*",  destination: "/admin/tickets/:path*",      permanent: true },
  { source: "/admin/soporte",         destination: "/admin/tickets",             permanent: true },
  { source: "/tienda/:path*",         destination: "/store/:path*",              permanent: true },
  { source: "/turnera/:path*",        destination: "/appointments/:path*",       permanent: true },
  { source: "/turnera",               destination: "/appointments",              permanent: true },
  { source: "/api/turnera/:path*",    destination: "/api/appointments/:path*",   permanent: true },
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

  async redirects() {
    return legacyRedirects;
  },
};

export default nextConfig;
