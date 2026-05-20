import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeJsonRequest } from "../../helpers/mock-factories";
import { NextRequest } from "next/server";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const prismaMock = vi.hoisted(() => ({
  invitation: { findUnique: vi.fn(), update: vi.fn() },
  user:       { findFirst: vi.fn(), create: vi.fn() },
  $transaction: vi.fn(),
}));

vi.mock("@/lib/prisma",  () => ({ prisma: prismaMock }));
vi.mock("bcryptjs", () => ({ default: { hash: vi.fn() } }));

// ── Imports ───────────────────────────────────────────────────────────────────

import { POST } from "@/app/api/auth/accept-invite/route";
import bcrypt from "bcryptjs";

// ── Helpers ───────────────────────────────────────────────────────────────────

const URL = "http://localhost:3000/api/auth/accept-invite";

function req(body: unknown, extraHeaders?: Record<string, string>): NextRequest {
  return new NextRequest(makeJsonRequest(URL, body, extraHeaders));
}

const VALID_INVITATION = {
  id:         "inv-1",
  token:      "valid-token",
  tenantId:   "tenant-1",
  email:      "invited@example.com",
  role:       "staff",
  acceptedAt: null,
  expiresAt:  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days in the future
  tenant:     { name: "Mi Tienda" },
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/auth/accept-invite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.invitation.findUnique.mockResolvedValue(VALID_INVITATION);
    prismaMock.user.findFirst.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({ id: "new-user" });
    prismaMock.invitation.update.mockResolvedValue({});
    // $transaction receives an array of already-started promises — resolve them all
    prismaMock.$transaction.mockImplementation((ops: Promise<unknown>[]) => Promise.all(ops));
    vi.mocked(bcrypt.hash).mockResolvedValue("hashed-pw" as never);
  });

  // ── Happy path ──────────────────────────────────────────────────────────────

  it("creates user + marks invitation accepted and returns 201", async () => {
    const res = await POST(req({ token: "valid-token", name: "Juan Pérez", password: "SecurePass123" }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(prismaMock.$transaction).toHaveBeenCalledOnce();
  });

  it("executes create user and update invitation in a single transaction", async () => {
    await POST(req({ token: "valid-token", name: "Juan", password: "SecurePass123" }));

    const txOps = prismaMock.$transaction.mock.calls[0][0] as unknown[];
    expect(txOps).toHaveLength(2);
  });

  // ── Body size guard ─────────────────────────────────────────────────────────

  it("returns 413 when content-length exceeds 4096 bytes", async () => {
    const res = await POST(req({ token: "t", name: "N", password: "p" }, { "content-length": "5000" }));
    expect(res.status).toBe(413);
  });

  // ── Validation ──────────────────────────────────────────────────────────────

  it("returns 400 for malformed JSON", async () => {
    const badReq = new NextRequest("http://localhost/api/auth/accept-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{bad-json",
    });
    const res = await POST(badReq);
    expect(res.status).toBe(400);
  });

  it("returns 400 when token is missing", async () => {
    const res = await POST(req({ token: "", name: "Juan", password: "SecurePass123" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Token");
  });

  it("returns 400 when name is too short (< 2 chars)", async () => {
    const res = await POST(req({ token: "t", name: "X", password: "SecurePass123" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Nombre");
  });

  it("returns 400 when password is too short (< 8 chars)", async () => {
    const res = await POST(req({ token: "t", name: "Juan", password: "short" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Contraseña");
  });

  it("returns 400 when password is too long (> 128 chars)", async () => {
    const res = await POST(req({ token: "t", name: "Juan", password: "x".repeat(129) }));
    expect(res.status).toBe(400);
  });

  // ── Invitation state checks ─────────────────────────────────────────────────

  it("returns 404 when token is not found", async () => {
    prismaMock.invitation.findUnique.mockResolvedValue(null);
    const res = await POST(req({ token: "bad-token", name: "Juan", password: "SecurePass123" }));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toContain("no encontrada");
  });

  it("returns 409 when invitation has already been accepted", async () => {
    prismaMock.invitation.findUnique.mockResolvedValue({
      ...VALID_INVITATION,
      acceptedAt: new Date("2026-01-01"),
    });
    const res = await POST(req({ token: "used-token", name: "Juan", password: "SecurePass123" }));
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toContain("usada");
  });

  it("returns 410 when invitation has expired", async () => {
    prismaMock.invitation.findUnique.mockResolvedValue({
      ...VALID_INVITATION,
      expiresAt: new Date(Date.now() - 1000), // 1 second in the past
    });
    const res = await POST(req({ token: "expired-token", name: "Juan", password: "SecurePass123" }));
    expect(res.status).toBe(410);
    const body = await res.json();
    expect(body.error).toContain("expiró");
  });

  it("returns 409 when a user with the invited email already exists in the tenant", async () => {
    prismaMock.user.findFirst.mockResolvedValue({ id: "already-there" });
    const res = await POST(req({ token: "valid-token", name: "Juan", password: "SecurePass123" }));
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toContain("email");
  });

  // ── User creation details ───────────────────────────────────────────────────

  it("creates user with the email from the invitation (not user-supplied)", async () => {
    await POST(req({ token: "valid-token", name: "Juan Pérez", password: "SecurePass123" }));

    const txOps = prismaMock.$transaction.mock.calls[0][0] as unknown[];
    // First op is user.create — resolve it to inspect the data
    expect(prismaMock.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ email: "invited@example.com", role: "staff" }),
      }),
    );
  });

  it("trims the name before storing", async () => {
    await POST(req({ token: "valid-token", name: "  Juan Pérez  ", password: "SecurePass123" }));
    expect(prismaMock.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: "Juan Pérez" }),
      }),
    );
  });
});
