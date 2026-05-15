import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const authMock = vi.hoisted(() => vi.fn());

const prismaMock = vi.hoisted(() => ({
  tenant: {
    findUnique: vi.fn().mockResolvedValue({ plan: "free" }),
    update:     vi.fn().mockResolvedValue({}),
  },
  tenantModule: { upsert: vi.fn().mockResolvedValue({}) },
  $transaction: vi.fn((fn: (tx: unknown) => Promise<unknown>) =>
    fn({
      tenantModule: { upsert: vi.fn().mockResolvedValue({}) },
      tenant:       { update: vi.fn().mockResolvedValue({}) },
    })
  ),
}));

vi.mock("@/auth",             () => ({ auth: authMock }));
vi.mock("@/lib/prisma",       () => ({ prisma: prismaMock }));
vi.mock("@/lib/plan-limits",  () => ({
  FREE_MODULE_INFO: { turnera: {}, catalog: {} },
  FREE_MODULE_MAX:  2,
}));

// ── Imports ───────────────────────────────────────────────────────────────────

import { POST } from "@/app/api/admin/onboarding-complete/route";

function makeReq(body: unknown) {
  return new NextRequest("http://localhost/api/admin/onboarding-complete", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/admin/onboarding-complete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue({ user: { id: "user-1", tenantId: "tenant-1" } });
    prismaMock.tenant.findUnique.mockResolvedValue({ plan: "free" });
  });

  it("returns 200 ok for authenticated user", async () => {
    const res = await POST(makeReq({ modules: ["turnera"] }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it("returns 401 when not authenticated", async () => {
    authMock.mockResolvedValue(null);
    const res = await POST(makeReq({}));
    expect(res.status).toBe(401);
  });

  it("rejects invalid module for free plan", async () => {
    const res = await POST(makeReq({ modules: ["fiscal"] }));
    expect(res.status).toBe(400);
  });

  it("rejects too many modules for free plan", async () => {
    const res = await POST(makeReq({ modules: ["turnera", "catalog", "stock"] }));
    expect(res.status).toBe(400);
  });
});
