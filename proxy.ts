import { NextRequest, NextResponse } from "next/server";

// ─── Per-instance in-memory rate limiter ────────────────────────────────────
// Best-effort: resets on cold starts, not shared across Vercel instances.
// For distributed enforcement, replace with Upstash Redis (@upstash/ratelimit).

interface Window {
  n: number;
  reset: number;
}

const counters = new Map<string, Window>();

let callsSinceCleanup = 0;
function maybeCleanup(now: number) {
  if (++callsSinceCleanup < 500) return;
  callsSinceCleanup = 0;
  for (const [k, v] of counters) {
    if (now >= v.reset) counters.delete(k);
  }
}

function isAllowed(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  maybeCleanup(now);
  const w = counters.get(key);
  if (!w || now >= w.reset) {
    counters.set(key, { n: 1, reset: now + windowMs });
    return true;
  }
  if (w.n >= limit) return false;
  w.n++;
  return true;
}

// ─── Route limits ────────────────────────────────────────────────────────────
const LIMITS: Record<string, { requests: number; windowMs: number }> = {
  "POST /api/turnera/bookings":         { requests: 5,  windowMs: 60_000 },
  "GET /api/turnera/bookings":          { requests: 20, windowMs: 60_000 },
  "GET /api/turnera/services":          { requests: 60, windowMs: 60_000 },
  "POST /api/auth/register":            { requests: 3,  windowMs: 60_000 },
  "POST /api/auth/signin":              { requests: 10, windowMs: 60_000 },
  "POST /api/auth/forgot-password":     { requests: 3,  windowMs: 300_000 }, // 3 per 5 min
  "POST /api/auth/reset-password":      { requests: 5,  windowMs: 300_000 },
  "POST /api/auth/resend-verification": { requests: 3,  windowMs: 300_000 },
  "GET /api/admin/export":              { requests: 10, windowMs: 60_000 },
};

// ─── Proxy ────────────────────────────────────────────────────────────────────
export default function proxy(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const routeKey = `${req.method} ${req.nextUrl.pathname}`;
  const limit = LIMITS[routeKey];

  if (limit && process.env.NODE_ENV === "production") {
    const key = `${ip}:${routeKey}`;
    if (!isAllowed(key, limit.requests, limit.windowMs)) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Esperá un momento e intentá de nuevo." },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
            "X-RateLimit-Limit": String(limit.requests),
          },
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*", "/superadmin/:path*"],
};
