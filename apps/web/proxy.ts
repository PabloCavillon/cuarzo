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
  "POST /api/contact": { requests: 5, windowMs: 60_000 },
};

// ─── Rate-limit proxy ────────────────────────────────────────────────────────
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
        { error: "Too many requests. Please wait a moment and try again." },
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
  matcher: ["/api/contact"],
};
