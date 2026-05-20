import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const authMock = vi.hoisted(() => vi.fn());

const prismaMock = vi.hoisted(() => ({
  client:          { findMany: vi.fn().mockResolvedValue([]) },
  supplier:        { findMany: vi.fn().mockResolvedValue([]) },
  catalogProduct:  { findMany: vi.fn().mockResolvedValue([]) },
  order:           { findMany: vi.fn().mockResolvedValue([]) },
  turneraBooking:  { findMany: vi.fn().mockResolvedValue([]) },
  cajaMovimiento:  { findMany: vi.fn().mockResolvedValue([]) },
}));

vi.mock("@/auth",       () => ({ auth: authMock }));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

// ── Imports ───────────────────────────────────────────────────────────────────

import { GET } from "@/app/api/admin/export/route";

// ── Helpers ───────────────────────────────────────────────────────────────────

const SESSION = { user: { id: "user-1", tenantId: "tenant-1" } };

function getReq(params?: Record<string, string>): NextRequest {
  const url = new URL("http://localhost/api/admin/export");
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  }
  return new NextRequest(url.toString());
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("GET /api/admin/export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue(SESSION);
    // Reset all findMany to return empty arrays
    for (const key of Object.keys(prismaMock) as (keyof typeof prismaMock)[]) {
      (prismaMock[key] as { findMany: ReturnType<typeof vi.fn> }).findMany.mockResolvedValue([]);
    }
  });

  // ── Auth ─────────────────────────────────────────────────────────────────────

  it("returns 401 when not authenticated", async () => {
    authMock.mockResolvedValue(null);
    const res = await GET(getReq({ module: "clients" }));
    expect(res.status).toBe(401);
  });

  it("returns 401 when session has no tenantId", async () => {
    authMock.mockResolvedValue({ user: { id: "u1" } });
    const res = await GET(getReq({ module: "clients" }));
    expect(res.status).toBe(401);
  });

  // ── Validation ───────────────────────────────────────────────────────────────

  it("returns 400 when module param is missing", async () => {
    const res = await GET(getReq());
    expect(res.status).toBe(400);
  });

  it("returns 400 for unknown module", async () => {
    const res = await GET(getReq({ module: "unknown" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Módulo inválido");
  });

  // ── CSV response ─────────────────────────────────────────────────────────────

  it("returns Content-Type text/csv for clients module", async () => {
    const res = await GET(getReq({ module: "clients" }));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/csv");
  });

  it("returns Content-Disposition with filename for clients", async () => {
    const res = await GET(getReq({ module: "clients" }));
    const cd = res.headers.get("content-disposition") ?? "";
    expect(cd).toContain("clients");
    expect(cd).toContain(".csv");
  });

  // ── Each valid module ─────────────────────────────────────────────────────────

  it.each(["clients", "suppliers", "products", "orders", "bookings", "caja"] as const)(
    "returns 200 for module '%s'",
    async (mod) => {
      const res = await GET(getReq({ module: mod }));
      expect(res.status).toBe(200);
    },
  );

  // ── Data included in CSV ──────────────────────────────────────────────────────

  it("includes client data in the CSV response", async () => {
    prismaMock.client.findMany.mockResolvedValue([
      { name: "Ana García", email: "ana@example.com", phone: "1234", address: "", notes: "", active: true, createdAt: new Date("2026-01-01") },
    ]);
    const res = await GET(getReq({ module: "clients" }));
    const text = await res.text();
    expect(text).toContain("Ana García");
    expect(text).toContain("ana@example.com");
  });

  it("queries the correct tenant", async () => {
    await GET(getReq({ module: "clients" }));
    expect(prismaMock.client.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: "tenant-1" } }),
    );
  });

  it("returns empty CSV (headers only) when no data exists", async () => {
    const res = await GET(getReq({ module: "clients" }));
    const text = await res.text();
    // Only the header row — no data rows
    expect(text.trim().split("\n")).toHaveLength(1);
  });
});
