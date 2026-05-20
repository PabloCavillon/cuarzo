/**
 * Tests for the rate-limiting logic in middleware.ts.
 *
 * Strategy: mock next-auth so that auth() is a passthrough (the wrapped
 * middleware is returned unchanged). Then call the exported middleware with
 * synthetic NextRequest objects and inspect the response.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

// ── Hoist mocks before any import ─────────────────────────────────────────────

vi.mock("next-auth", () => ({
  default: vi.fn((_config: unknown) => ({
    // auth(fn) → just return fn so the real inner middleware is exported
    auth: (fn: (req: NextRequest) => NextResponse) => fn,
  })),
}));

vi.mock("../../auth.config", () => ({ authConfig: {} }));

// ── Import after mocks are registered ─────────────────────────────────────────

// eslint-disable-next-line import/first
import middleware from "../../middleware";

// ── Helpers ───────────────────────────────────────────────────────────────────

let ipCounter = 0;
function uniqueIp() {
  return `10.0.0.${++ipCounter}`;
}

function makeReq(
  method: string,
  path: string,
  ip = uniqueIp(),
): NextRequest {
  const req = new NextRequest(`http://localhost${path}`, { method });
  // NextRequest reads IP from x-forwarded-for
  req.headers.set("x-forwarded-for", ip);
  return req;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("rate limiter — isAllowed", () => {
  beforeEach(() => {
    // Each test uses fresh IPs so the module-level counters don't bleed
  });

  it("passes the first request for a rate-limited route", () => {
    const req = makeReq("POST", "/api/appointments/bookings");
    const res = middleware(req as never);
    expect((res as NextResponse).status).not.toBe(429);
  });

  it("passes up to the limit and blocks the next one (POST /api/appointments/bookings → 5 req/min)", () => {
    const ip = uniqueIp();
    const path = "/api/appointments/bookings";
    let lastRes: NextResponse | undefined;

    for (let i = 0; i < 5; i++) {
      const res = middleware(makeReq("POST", path, ip) as never) as NextResponse;
      expect(res.status).not.toBe(429);
      lastRes = res;
    }
    expect(lastRes).toBeDefined();

    // 6th request must be rejected
    const blocked = middleware(makeReq("POST", path, ip) as never) as NextResponse;
    expect(blocked.status).toBe(429);
  });

  it("returns Retry-After header on 429", () => {
    const ip = uniqueIp();
    const path = "/api/auth/register"; // limit: 3

    for (let i = 0; i < 3; i++) middleware(makeReq("POST", path, ip) as never);

    const blocked = middleware(makeReq("POST", path, ip) as never) as NextResponse;
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("Retry-After")).toBe("60");
  });

  it("returns X-RateLimit-Limit header showing the configured limit", () => {
    const ip = uniqueIp();
    const path = "/api/auth/register"; // limit: 3

    for (let i = 0; i < 3; i++) middleware(makeReq("POST", path, ip) as never);

    const blocked = middleware(makeReq("POST", path, ip) as never) as NextResponse;
    expect(blocked.headers.get("X-RateLimit-Limit")).toBe("3");
  });

  it("does not rate-limit routes not in the LIMITS table", () => {
    const ip = uniqueIp();
    // /admin/dashboard is matched by the config but has no LIMITS entry
    for (let i = 0; i < 100; i++) {
      const res = middleware(makeReq("GET", "/admin/dashboard", ip) as never) as NextResponse;
      expect(res.status).not.toBe(429);
    }
  });

  it("different IPs are rate-limited independently", () => {
    const ip1 = uniqueIp();
    const ip2 = uniqueIp();
    const path = "/api/auth/register"; // limit: 3

    // Exhaust ip1's quota
    for (let i = 0; i < 3; i++) middleware(makeReq("POST", path, ip1) as never);
    const blockedIp1 = middleware(makeReq("POST", path, ip1) as never) as NextResponse;
    expect(blockedIp1.status).toBe(429);

    // ip2 should still be allowed
    const allowedIp2 = middleware(makeReq("POST", path, ip2) as never) as NextResponse;
    expect(allowedIp2.status).not.toBe(429);
  });

  it("GET and POST share different quota keys (different route keys)", () => {
    const ip = uniqueIp();
    // GET /api/appointments/bookings → 20 req/min
    // POST /api/appointments/bookings → 5 req/min

    // Exhaust POST quota
    for (let i = 0; i < 5; i++) middleware(makeReq("POST", "/api/appointments/bookings", ip) as never);
    const blockedPost = middleware(makeReq("POST", "/api/appointments/bookings", ip) as never) as NextResponse;
    expect(blockedPost.status).toBe(429);

    // GET quota is independent — first GET should pass
    const allowedGet = middleware(makeReq("GET", "/api/appointments/bookings", ip) as never) as NextResponse;
    expect(allowedGet.status).not.toBe(429);
  });

  it("uses x-real-ip as fallback when x-forwarded-for is absent", () => {
    const req = new NextRequest("http://localhost/api/auth/register", { method: "POST" });
    req.headers.set("x-real-ip", "192.168.1.1");
    // Should not throw — test that the middleware runs cleanly
    const res = middleware(req as never);
    expect(res).toBeDefined();
  });

  it("returns a 429 JSON error body", async () => {
    const ip = uniqueIp();
    for (let i = 0; i < 3; i++) middleware(makeReq("POST", "/api/auth/register", ip) as never);
    const blocked = middleware(makeReq("POST", "/api/auth/register", ip) as never) as NextResponse;
    expect(blocked.status).toBe(429);
    const body = await blocked.json();
    expect(typeof body.error).toBe("string");
    expect(body.error.length).toBeGreaterThan(0);
  });

  it("GET /api/appointments/services allows 60 req/min", () => {
    const ip = uniqueIp();
    for (let i = 0; i < 60; i++) {
      const res = middleware(makeReq("GET", "/api/appointments/services", ip) as never) as NextResponse;
      expect(res.status).not.toBe(429);
    }
    const blocked = middleware(makeReq("GET", "/api/appointments/services", ip) as never) as NextResponse;
    expect(blocked.status).toBe(429);
  });
});
