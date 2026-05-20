import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const prismaMock = vi.hoisted(() => ({
  user:               { findFirst: vi.fn(), update: vi.fn() },
  passwordResetToken: { findUnique: vi.fn(), update: vi.fn() },
  $transaction:       vi.fn(),
}));

vi.mock("@/lib/prisma",  () => ({ prisma: prismaMock }));
vi.mock("bcryptjs", () => ({ default: { hash: vi.fn() } }));

// ── Imports ───────────────────────────────────────────────────────────────────

import { POST } from "@/app/api/auth/reset-password/route";
import bcrypt from "bcryptjs";

// ── Helpers ───────────────────────────────────────────────────────────────────

const VALID_TOKEN  = "a".repeat(64);
const FUTURE_DATE  = new Date(Date.now() + 60 * 60 * 1000); // 1h from now
const PAST_DATE    = new Date(Date.now() - 1);              // already expired

const RESET_TOKEN  = {
  id:        "rt-1",
  email:     "ana@example.com",
  token:     VALID_TOKEN,
  expiresAt: FUTURE_DATE,
  usedAt:    null,
};

const USER = { id: "user-1", email: "ana@example.com" };

function postReq(body: unknown, extraHeaders?: Record<string, string>): NextRequest {
  const json = JSON.stringify(body);
  return new NextRequest("http://localhost/api/auth/reset-password", {
    method:  "POST",
    headers: {
      "Content-Type":   "application/json",
      "content-length": String(json.length),
      ...extraHeaders,
    },
    body: json,
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/auth/reset-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.passwordResetToken.findUnique.mockResolvedValue(RESET_TOKEN);
    prismaMock.user.findFirst.mockResolvedValue(USER);
    prismaMock.$transaction.mockResolvedValue([{}, {}]);
    vi.mocked(bcrypt.hash).mockResolvedValue("hashed-pw" as never);
  });

  // ── Happy path ───────────────────────────────────────────────────────────────

  it("returns 200 ok for valid token and password", async () => {
    const res = await POST(postReq({ token: VALID_TOKEN, password: "newpassword123" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it("hashes the new password with bcrypt before storing", async () => {
    await POST(postReq({ token: VALID_TOKEN, password: "newpassword123" }));
    expect(bcrypt.hash).toHaveBeenCalledWith("newpassword123", 12);
  });

  it("runs user.update and token.update in a transaction", async () => {
    await POST(postReq({ token: VALID_TOKEN, password: "newpassword123" }));
    expect(prismaMock.$transaction).toHaveBeenCalledOnce();
    // The transaction receives an array with two operations
    const txArgs = prismaMock.$transaction.mock.calls[0][0];
    expect(Array.isArray(txArgs)).toBe(true);
    expect(txArgs).toHaveLength(2);
  });

  // ── Validation ───────────────────────────────────────────────────────────────

  it("returns 400 for missing token", async () => {
    const res = await POST(postReq({ password: "newpassword123" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for empty token string", async () => {
    const res = await POST(postReq({ token: "   ", password: "newpassword123" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for password shorter than 8 chars", async () => {
    const res = await POST(postReq({ token: VALID_TOKEN, password: "short" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("contraseña");
  });

  it("returns 400 for password longer than 128 chars", async () => {
    const res = await POST(postReq({ token: VALID_TOKEN, password: "x".repeat(129) }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid JSON", async () => {
    const badReq = new NextRequest("http://localhost/api/auth/reset-password", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    "bad{json",
    });
    const res = await POST(badReq);
    expect(res.status).toBe(400);
  });

  it("returns 413 for oversized body", async () => {
    const res = await POST(postReq({ token: VALID_TOKEN, password: "pw123456" }, { "content-length": "5000" }));
    expect(res.status).toBe(413);
  });

  // ── Token state checks ───────────────────────────────────────────────────────

  it("returns 400 when token does not exist", async () => {
    prismaMock.passwordResetToken.findUnique.mockResolvedValue(null);
    const res = await POST(postReq({ token: "nonexistent", password: "newpassword123" }));
    expect(res.status).toBe(400);
  });

  it("returns 409 when token has already been used", async () => {
    prismaMock.passwordResetToken.findUnique.mockResolvedValue({
      ...RESET_TOKEN, usedAt: new Date(),
    });
    const res = await POST(postReq({ token: VALID_TOKEN, password: "newpassword123" }));
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toContain("ya fue utilizado");
  });

  it("returns 410 when token has expired", async () => {
    prismaMock.passwordResetToken.findUnique.mockResolvedValue({
      ...RESET_TOKEN, expiresAt: PAST_DATE,
    });
    const res = await POST(postReq({ token: VALID_TOKEN, password: "newpassword123" }));
    expect(res.status).toBe(410);
    const body = await res.json();
    expect(body.error).toContain("expiró");
  });

  it("returns 400 when user linked to the token is not found", async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    const res = await POST(postReq({ token: VALID_TOKEN, password: "newpassword123" }));
    expect(res.status).toBe(400);
  });
});
