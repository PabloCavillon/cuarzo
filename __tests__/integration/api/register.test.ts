import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeJsonRequest } from "../../helpers/mock-factories";
import { NextRequest } from "next/server";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const prismaMock = vi.hoisted(() => ({
  tenant:                   { create: vi.fn() },
  tenantModule:             { create: vi.fn() },
  user:                     { findFirst: vi.fn(), create: vi.fn() },
  emailVerificationToken:   { create: vi.fn().mockResolvedValue({}) },
  $transaction: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("bcryptjs", () => ({ default: { hash: vi.fn() } }));

// ── Imports ───────────────────────────────────────────────────────────────────

import { POST } from "@/app/api/auth/register/route";
import bcrypt from "bcryptjs";

// ── Helpers ───────────────────────────────────────────────────────────────────

const URL = "http://localhost:3000/api/auth/register";

function req(body: unknown, extraHeaders?: Record<string, string>): NextRequest {
  return new NextRequest(makeJsonRequest(URL, body, extraHeaders));
}

const VALID_BODY = {
  businessName: "Mi Tienda",
  name: "Ana García",
  email: "ana@example.com",
  password: "password123",
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.tenant.create.mockResolvedValue({ id: "new-tenant-id", name: "Mi Tienda", slug: "mi-tienda-abc123" });
    prismaMock.tenantModule.create.mockResolvedValue({});
    prismaMock.user.findFirst.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({ id: "new-user" });
    // $transaction with async callback — pass prismaMock as the tx client
    prismaMock.$transaction.mockImplementation(async (fn: (tx: typeof prismaMock) => Promise<unknown>) => fn(prismaMock));
    prismaMock.emailVerificationToken.create.mockResolvedValue({});
    vi.mocked(bcrypt.hash).mockResolvedValue("hashed-pw" as never);
  });

  // ── Happy path ──────────────────────────────────────────────────────────────

  it("creates a tenant + user and returns 201 for valid input", async () => {
    const res = await POST(req(VALID_BODY));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(prismaMock.$transaction).toHaveBeenCalledOnce();
    expect(prismaMock.tenant.create).toHaveBeenCalledOnce();
    expect(prismaMock.user.create).toHaveBeenCalledOnce();
  });

  it("stores the password as a hash, not plaintext", async () => {
    await POST(req(VALID_BODY));
    const callData = prismaMock.user.create.mock.calls[0][0].data;
    expect(callData.password).toBe("hashed-pw");
    expect(callData.password).not.toBe("password123");
  });

  it("normalizes email to lowercase before storing", async () => {
    await POST(req({ ...VALID_BODY, email: "UPPER@EXAMPLE.COM" }));
    const callData = prismaMock.user.create.mock.calls[0][0].data;
    expect(callData.email).toBe("upper@example.com");
  });

  it("assigns 'owner' role to the registering user", async () => {
    await POST(req(VALID_BODY));
    const callData = prismaMock.user.create.mock.calls[0][0].data;
    expect(callData.role).toBe("owner");
  });

  it("creates the tenant with the supplied business name", async () => {
    await POST(req({ ...VALID_BODY, businessName: "Panadería El Sol" }));
    const tenantData = prismaMock.tenant.create.mock.calls[0][0].data;
    expect(tenantData.name).toBe("Panadería El Sol");
    expect(tenantData.plan).toBe("free");
  });

  it("creates the turnera module for the new tenant", async () => {
    await POST(req(VALID_BODY));
    const moduleData = prismaMock.tenantModule.create.mock.calls[0][0].data;
    expect(moduleData.module).toBe("turnera");
  });

  it("trims name and businessName before storing", async () => {
    await POST(req({ ...VALID_BODY, name: "  Ana García  ", businessName: "  Mi Tienda  " }));
    const userData   = prismaMock.user.create.mock.calls[0][0].data;
    const tenantData = prismaMock.tenant.create.mock.calls[0][0].data;
    expect(userData.name).toBe("Ana García");
    expect(tenantData.name).toBe("Mi Tienda");
  });

  // ── Body size guard ─────────────────────────────────────────────────────────

  it("returns 413 when content-length exceeds 4096 bytes", async () => {
    const res = await POST(req(VALID_BODY, { "content-length": "5000" }));
    expect(res.status).toBe(413);
  });

  // ── Validation ──────────────────────────────────────────────────────────────

  it("returns 400 for invalid JSON body", async () => {
    const badReq = new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-valid-json{",
    });
    const res = await POST(badReq);
    expect(res.status).toBe(400);
  });

  it("returns 400 when businessName is too short (< 2 chars)", async () => {
    const res = await POST(req({ ...VALID_BODY, businessName: "X" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("negocio");
  });

  it("returns 400 when businessName is too long (> 100 chars)", async () => {
    const res = await POST(req({ ...VALID_BODY, businessName: "A".repeat(101) }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when name is too short (< 2 chars)", async () => {
    const res = await POST(req({ ...VALID_BODY, name: "X" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("nombre");
  });

  it("returns 400 when name is too long (> 100 chars)", async () => {
    const res = await POST(req({ ...VALID_BODY, name: "A".repeat(101) }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when email is invalid", async () => {
    const res = await POST(req({ ...VALID_BODY, email: "not-an-email" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Email");
  });

  it("returns 400 when password is too short (< 8 chars)", async () => {
    const res = await POST(req({ ...VALID_BODY, password: "short" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("contraseña");
  });

  it("returns 400 when password is too long (> 128 chars)", async () => {
    const res = await POST(req({ ...VALID_BODY, password: "x".repeat(129) }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when name is not a string", async () => {
    const res = await POST(req({ ...VALID_BODY, name: 42 }));
    expect(res.status).toBe(400);
  });

  // ── Duplicate guard ─────────────────────────────────────────────────────────

  it("returns 409 when email already exists globally", async () => {
    prismaMock.user.findFirst.mockResolvedValue({ id: "existing" });
    const res = await POST(req({ ...VALID_BODY, email: "existing@example.com" }));
    expect(res.status).toBe(409);
    const body = await res.json();
    // Must not reveal "ya está registrado" — intentionally vague message
    expect(body.error).not.toContain("ya está registrado");
  });
});
