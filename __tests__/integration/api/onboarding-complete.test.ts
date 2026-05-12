import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const authMock = vi.hoisted(() => vi.fn());

const prismaMock = vi.hoisted(() => ({
  tenant: { update: vi.fn().mockResolvedValue({}) },
}));

vi.mock("@/auth",       () => ({ auth: authMock }));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

// ── Imports ───────────────────────────────────────────────────────────────────

import { POST } from "@/app/api/admin/onboarding-complete/route";

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/admin/onboarding-complete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue({ user: { id: "user-1", tenantId: "tenant-1" } });
    prismaMock.tenant.update.mockResolvedValue({});
  });

  it("returns 200 ok for authenticated user", async () => {
    const res = await POST();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it("sets onboarded: true on the tenant", async () => {
    await POST();
    expect(prismaMock.tenant.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "tenant-1" },
        data:  { onboarded: true },
      }),
    );
  });

  it("returns 401 when not authenticated", async () => {
    authMock.mockResolvedValue(null);
    const res = await POST();
    expect(res.status).toBe(401);
    expect(prismaMock.tenant.update).not.toHaveBeenCalled();
  });
});
