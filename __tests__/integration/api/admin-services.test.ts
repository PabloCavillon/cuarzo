import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const sessionMock = vi.hoisted(() => ({ requireAuth: vi.fn() }));

const prismaMock = vi.hoisted(() => ({
  tenant:         { findUnique: vi.fn() },
  turneraService: { create: vi.fn(), count: vi.fn() },
}));

vi.mock("@/lib/session", () => sessionMock);
vi.mock("@/lib/prisma",  () => ({ prisma: prismaMock }));

// ── Imports ───────────────────────────────────────────────────────────────────

import { POST } from "@/app/api/admin/services/route";

// ── Fixtures ─────────────────────────────────────────────────────────────────

const AUTH_USER = { id: "user-1", tenantId: "tenant-1", role: "owner" };
const CREATED_SVC = { id: "svc-1", name: "Corte clásico", durationMin: 30, price: 800 };

function formReq(fields: Record<string, string>): NextRequest {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  return new NextRequest("http://localhost/api/admin/services", { method: "POST", body: fd });
}

function jsonReq(body: unknown): NextRequest {
  const json = JSON.stringify(body);
  return new NextRequest("http://localhost/api/admin/services", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    json,
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/admin/services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionMock.requireAuth.mockResolvedValue(AUTH_USER);
    prismaMock.tenant.findUnique.mockResolvedValue({ plan: "pro" });
    prismaMock.turneraService.count.mockResolvedValue(0);
    prismaMock.turneraService.create.mockResolvedValue(CREATED_SVC);
  });

  // ── Happy path (FormData) ────────────────────────────────────────────────────

  it("creates a service from FormData and returns 201", async () => {
    const res = await POST(formReq({ name: "Corte clásico", durationMin: "30", price: "800" }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.service).toBeDefined();
  });

  it("passes the correct tenantId to prisma", async () => {
    await POST(formReq({ name: "Corte clásico", durationMin: "30", price: "0" }));
    expect(prismaMock.turneraService.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ tenantId: "tenant-1" }) }),
    );
  });

  it("creates a service from JSON body and returns 201", async () => {
    const res = await POST(jsonReq({ name: "Consulta", durationMin: 60, price: 5000 }));
    expect(res.status).toBe(201);
  });

  it("accepts price 0 (free service)", async () => {
    const res = await POST(formReq({ name: "Gratis", durationMin: "30", price: "0" }));
    expect(res.status).toBe(201);
    expect(prismaMock.turneraService.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ price: 0 }) }),
    );
  });

  // ── Auth ─────────────────────────────────────────────────────────────────────

  it("returns 401 when not authenticated", async () => {
    sessionMock.requireAuth.mockRejectedValue(new Error("Unauthorized"));
    const res = await POST(formReq({ name: "X", durationMin: "30", price: "0" }));
    expect(res.status).toBe(401);
    expect(prismaMock.turneraService.create).not.toHaveBeenCalled();
  });

  // ── Validation ───────────────────────────────────────────────────────────────

  it("returns 400 when name is empty", async () => {
    const res = await POST(formReq({ name: "", durationMin: "30", price: "0" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("nombre");
  });

  it("returns 400 when name is too short (1 char)", async () => {
    const res = await POST(formReq({ name: "X", durationMin: "30", price: "0" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when durationMin < 5", async () => {
    const res = await POST(formReq({ name: "Servicio", durationMin: "4", price: "0" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("5 minutos");
  });

  it("returns 400 for negative price", async () => {
    const res = await POST(formReq({ name: "Servicio", durationMin: "30", price: "-100" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("precio");
  });

  it("returns 402 when service limit for the plan is reached", async () => {
    prismaMock.tenant.findUnique.mockResolvedValue({ plan: "free" });
    prismaMock.turneraService.count.mockResolvedValue(5); // free plan limit is 5
    const res = await POST(formReq({ name: "Servicio extra", durationMin: "30", price: "0" }));
    expect(res.status).toBe(402);
    const body = await res.json();
    expect(body.error).toContain("límite");
  });

  it("returns 400 for invalid JSON body", async () => {
    const badReq = new NextRequest("http://localhost/api/admin/services", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    "bad{json",
    });
    const res = await POST(badReq);
    expect(res.status).toBe(400);
  });
});
