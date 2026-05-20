import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const prismaMock = vi.hoisted(() => ({
  user:               { findFirst: vi.fn() },
  passwordResetToken: { create: vi.fn().mockResolvedValue({}) },
}));

const emailMock = vi.hoisted(() => ({
  sendPasswordReset: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/email",  () => emailMock);

// ── Imports ───────────────────────────────────────────────────────────────────

import { POST } from "@/app/api/auth/forgot-password/route";

// ── Helpers ───────────────────────────────────────────────────────────────────

const EXISTING_USER = { id: "user-1", email: "ana@example.com", name: "Ana García" };

function postReq(body: unknown, extraHeaders?: Record<string, string>): NextRequest {
  const json = JSON.stringify(body);
  return new NextRequest("http://localhost/api/auth/forgot-password", {
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

describe("POST /api/auth/forgot-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.user.findFirst.mockResolvedValue(EXISTING_USER);
    prismaMock.passwordResetToken.create.mockResolvedValue({});
  });

  // ── Happy path ───────────────────────────────────────────────────────────────

  it("returns 200 ok for existing email", async () => {
    const res = await POST(postReq({ email: "ana@example.com" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it("creates a password reset token for existing user", async () => {
    await POST(postReq({ email: "ana@example.com" }));
    expect(prismaMock.passwordResetToken.create).toHaveBeenCalledOnce();
    expect(prismaMock.passwordResetToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ email: "ana@example.com" }),
      }),
    );
  });

  it("fires sendPasswordReset for existing user", async () => {
    await POST(postReq({ email: "ana@example.com" }));
    expect(emailMock.sendPasswordReset).toHaveBeenCalledOnce();
    expect(emailMock.sendPasswordReset).toHaveBeenCalledWith(
      expect.objectContaining({ to: "ana@example.com", name: EXISTING_USER.name }),
    );
  });

  it("token expiresAt is approximately 1 hour from now", async () => {
    const before = new Date();
    await POST(postReq({ email: "ana@example.com" }));
    const after = new Date();
    const { data } = prismaMock.passwordResetToken.create.mock.calls[0][0];
    const expected = 60 * 60 * 1000;
    expect(data.expiresAt.getTime() - before.getTime()).toBeGreaterThanOrEqual(expected - 500);
    expect(data.expiresAt.getTime() - after.getTime()).toBeLessThanOrEqual(expected + 500);
  });

  it("normalizes email to lowercase before lookup", async () => {
    await POST(postReq({ email: "ANA@EXAMPLE.COM" }));
    expect(prismaMock.user.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: "ana@example.com" } }),
    );
  });

  // ── Security: no email enumeration ──────────────────────────────────────────

  it("returns 200 even for non-existent email (no enumeration)", async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    const res = await POST(postReq({ email: "ghost@example.com" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it("does NOT create a token for non-existent user", async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    await POST(postReq({ email: "ghost@example.com" }));
    expect(prismaMock.passwordResetToken.create).not.toHaveBeenCalled();
  });

  it("does NOT fire email for non-existent user", async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    await POST(postReq({ email: "ghost@example.com" }));
    expect(emailMock.sendPasswordReset).not.toHaveBeenCalled();
  });

  // ── Validation ───────────────────────────────────────────────────────────────

  it("returns 400 for invalid email format", async () => {
    const res = await POST(postReq({ email: "not-an-email" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for missing email", async () => {
    const res = await POST(postReq({}));
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid JSON", async () => {
    const badReq = new NextRequest("http://localhost/api/auth/forgot-password", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    "not-json{",
    });
    const res = await POST(badReq);
    expect(res.status).toBe(400);
  });

  it("returns 413 for oversized body", async () => {
    const res = await POST(postReq({ email: "a@b.com" }, { "content-length": "2000" }));
    expect(res.status).toBe(413);
  });
});
