import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const prismaMock = vi.hoisted(() => ({
  tenant: { findUnique: vi.fn() },
  turneraService: { findMany: vi.fn() },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

// ── Imports ───────────────────────────────────────────────────────────────────

import { GET } from "@/app/api/appointments/services/route";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const DEMO_TENANT = { id: "demo-id", slug: "demo" };

const DB_SERVICES = [
  {
    id: "svc-1", name: "Corte de cabello", description: "Corte clásico",
    durationMin: 30, price: { toString: () => "800", valueOf: () => 800 },
    sortOrder: 1,
  },
  {
    id: "svc-2", name: "Coloración", description: null,
    durationMin: 90, price: { toString: () => "3500", valueOf: () => 3500 },
    sortOrder: 2,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getReq(slug?: string): NextRequest {
  const url = new URL("http://localhost/api/appointments/services");
  if (slug) url.searchParams.set("slug", slug);
  return new NextRequest(url.toString());
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("GET /api/appointments/services", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    prismaMock.tenant.findUnique.mockResolvedValue(DEMO_TENANT);
    prismaMock.turneraService.findMany.mockResolvedValue(DB_SERVICES);
  });

  it("returns 200 with a services array", async () => {
    const res = await GET(getReq());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.services)).toBe(true);
    expect(body.services).toHaveLength(2);
  });

  it("serializes Decimal price as a number", async () => {
    const res = await GET(getReq());
    const body = await res.json();
    for (const svc of body.services) {
      expect(typeof svc.price).toBe("number");
    }
  });

  it("maps null description to empty string", async () => {
    const res = await GET(getReq());
    const body = await res.json();
    const coloracion = body.services.find((s: { name: string }) => s.name === "Coloración");
    expect(coloracion?.description).toBe("");
  });

  it("includes all required fields in each service", async () => {
    const res = await GET(getReq());
    const body = await res.json();
    const [svc] = body.services;
    expect(svc).toHaveProperty("id");
    expect(svc).toHaveProperty("name");
    expect(svc).toHaveProperty("description");
    expect(svc).toHaveProperty("durationMin");
    expect(svc).toHaveProperty("price");
    expect(svc).toHaveProperty("sortOrder");
  });

  it("returns 503 when the tenant does not exist", async () => {
    prismaMock.tenant.findUnique.mockResolvedValue(null);
    const res = await GET(getReq());
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toContain("no disponible");
  });

  it("includes Cache-Control header for CDN caching", async () => {
    const res = await GET(getReq());
    expect(res.headers.get("Cache-Control")).toBeTruthy();
  });

  it("returns 500 on unexpected DB errors", async () => {
    prismaMock.turneraService.findMany.mockRejectedValue(new Error("DB down"));
    const res = await GET(getReq());
    expect(res.status).toBe(500);
  });

  it("returns empty array when no services exist", async () => {
    prismaMock.turneraService.findMany.mockResolvedValue([]);
    const res = await GET(getReq());
    const body = await res.json();
    expect(body.services).toEqual([]);
  });

  it("queries only active services for the tenant", async () => {
    await GET(getReq());
    expect(prismaMock.turneraService.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: DEMO_TENANT.id, active: true }),
      }),
    );
  });

  it("uses 'demo' slug by default when no slug param is provided", async () => {
    await GET(getReq());
    expect(prismaMock.tenant.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { slug: "demo" } }),
    );
  });

  it("uses the provided slug param when given", async () => {
    prismaMock.tenant.findUnique.mockResolvedValue({ ...DEMO_TENANT, slug: "mi-tienda" });
    await GET(getReq("mi-tienda"));
    expect(prismaMock.tenant.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { slug: "mi-tienda" } }),
    );
  });
});
