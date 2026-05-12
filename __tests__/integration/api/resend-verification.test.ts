import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const authMock = vi.hoisted(() => vi.fn());

const prismaMock = vi.hoisted(() => ({
  user:                   { findUnique: vi.fn() },
  emailVerificationToken: { create: vi.fn().mockResolvedValue({}) },
}));

const emailMock = vi.hoisted(() => ({
  sendEmailVerification: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/auth",       () => ({ auth: authMock }));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/email",  () => emailMock);

// ── Imports ───────────────────────────────────────────────────────────────────

import { POST } from "@/app/api/auth/resend-verification/route";

// ── Helpers ───────────────────────────────────────────────────────────────────

const SESSION  = { user: { id: "user-1" } };
const UNVERIFIED_USER = { id: "user-1", email: "ana@example.com", name: "Ana García", emailVerified: null };
const VERIFIED_USER   = { ...UNVERIFIED_USER, emailVerified: new Date() };

function postReq(extraHeaders?: Record<string, string>): NextRequest {
  return new NextRequest("http://localhost/api/auth/resend-verification", {
    method: "POST",
    headers: { "content-length": "0", ...extraHeaders },
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/auth/resend-verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue(SESSION);
    prismaMock.user.findUnique.mockResolvedValue(UNVERIFIED_USER);
    prismaMock.emailVerificationToken.create.mockResolvedValue({});
  });

  it("returns 200 ok for authenticated unverified user", async () => {
    const res = await POST(postReq());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it("creates a new email verification token", async () => {
    await POST(postReq());
    expect(prismaMock.emailVerificationToken.create).toHaveBeenCalledOnce();
    expect(prismaMock.emailVerificationToken.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: "user-1" }) }),
    );
  });

  it("fires sendEmailVerification", async () => {
    await POST(postReq());
    expect(emailMock.sendEmailVerification).toHaveBeenCalledOnce();
    expect(emailMock.sendEmailVerification).toHaveBeenCalledWith(
      expect.objectContaining({ to: "ana@example.com" }),
    );
  });

  it("returns 200 ok (idempotent) when user is already verified", async () => {
    prismaMock.user.findUnique.mockResolvedValue(VERIFIED_USER);
    const res = await POST(postReq());
    expect(res.status).toBe(200);
    expect(prismaMock.emailVerificationToken.create).not.toHaveBeenCalled();
    expect(emailMock.sendEmailVerification).not.toHaveBeenCalled();
  });

  it("returns 401 when not authenticated", async () => {
    authMock.mockResolvedValue(null);
    const res = await POST(postReq());
    expect(res.status).toBe(401);
  });

  it("returns 404 when user is not found in DB", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    const res = await POST(postReq());
    expect(res.status).toBe(404);
  });

  it("returns 413 for oversized body", async () => {
    const res = await POST(postReq({ "content-length": "1000" }));
    expect(res.status).toBe(413);
  });
});
