import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const prismaMock = vi.hoisted(() => ({
  user:                   { update: vi.fn() },
  emailVerificationToken: { findUnique: vi.fn(), update: vi.fn() },
  $transaction:           vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

// ── Imports ───────────────────────────────────────────────────────────────────

import { GET } from "@/app/api/auth/verify-email/route";

// ── Helpers ───────────────────────────────────────────────────────────────────

const VALID_TOKEN = "b".repeat(64);
const FUTURE_DATE = new Date(Date.now() + 24 * 60 * 60 * 1000);
const PAST_DATE   = new Date(Date.now() - 1);

const TOKEN_RECORD = {
  id:        "evt-1",
  userId:    "user-1",
  token:     VALID_TOKEN,
  expiresAt: FUTURE_DATE,
  usedAt:    null,
};

function getReq(token?: string): NextRequest {
  const url = new URL("http://localhost/api/auth/verify-email");
  if (token !== undefined) url.searchParams.set("token", token);
  return new NextRequest(url.toString());
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("GET /api/auth/verify-email", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.emailVerificationToken.findUnique.mockResolvedValue(TOKEN_RECORD);
    prismaMock.$transaction.mockResolvedValue([{}, {}]);
  });

  // ── Happy path ───────────────────────────────────────────────────────────────

  it("redirects to /admin?verified=1 for a valid token", async () => {
    const res = await GET(getReq(VALID_TOKEN));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/admin?verified=1");
  });

  it("runs user.update and token.update in a transaction", async () => {
    await GET(getReq(VALID_TOKEN));
    expect(prismaMock.$transaction).toHaveBeenCalledOnce();
    const txArgs = prismaMock.$transaction.mock.calls[0][0];
    expect(Array.isArray(txArgs)).toBe(true);
    expect(txArgs).toHaveLength(2);
  });

  // ── Edge cases ───────────────────────────────────────────────────────────────

  it("redirects to /admin (no error) when token is already used", async () => {
    prismaMock.emailVerificationToken.findUnique.mockResolvedValue({
      ...TOKEN_RECORD, usedAt: new Date(),
    });
    const res = await GET(getReq(VALID_TOKEN));
    expect(res.status).toBe(307);
    const location = res.headers.get("location") ?? "";
    expect(location).toContain("/admin");
    expect(location).not.toContain("error");
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("redirects to /verify-email?error=expired for expired token", async () => {
    prismaMock.emailVerificationToken.findUnique.mockResolvedValue({
      ...TOKEN_RECORD, expiresAt: PAST_DATE,
    });
    const res = await GET(getReq(VALID_TOKEN));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("error=expired");
  });

  it("redirects to /verify-email?error=invalid for unknown token", async () => {
    prismaMock.emailVerificationToken.findUnique.mockResolvedValue(null);
    const res = await GET(getReq("nonexistent-token"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("error=invalid");
  });

  it("redirects to /verify-email?error=missing when no token param", async () => {
    const res = await GET(getReq());
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("error=missing");
    expect(prismaMock.emailVerificationToken.findUnique).not.toHaveBeenCalled();
  });
});
