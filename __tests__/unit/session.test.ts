import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeAuthUser } from "../helpers/mock-factories";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const authMock = vi.hoisted(() => ({ auth: vi.fn() }));
const prismaMock = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
}));

vi.mock("@/auth",        () => authMock);
vi.mock("@/lib/prisma",  () => ({ prisma: prismaMock }));

// ── Imports (after mocks) ─────────────────────────────────────────────────────

import { requireAuth, apiError } from "@/lib/session";

// ── Helpers ───────────────────────────────────────────────────────────────────

function mockSession(userId: string | null) {
  authMock.auth.mockResolvedValue(
    userId ? { user: { id: userId } } : null,
  );
}

function mockDbUser(user: ReturnType<typeof makeAuthUser> | null) {
  prismaMock.user.findUnique.mockResolvedValue(
    user ? { ...user, active: true } : null,
  );
}

// ── requireAuth ───────────────────────────────────────────────────────────────

describe("requireAuth", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("throws 401 when there is no session", async () => {
    mockSession(null);
    await expect(requireAuth()).rejects.toMatchObject({ status: 401 });
  });

  it("throws 401 when session userId has no DB user", async () => {
    mockSession("user-1");
    mockDbUser(null);
    await expect(requireAuth()).rejects.toMatchObject({ status: 401 });
  });

  it("throws 401 when DB user is inactive", async () => {
    mockSession("user-1");
    prismaMock.user.findUnique.mockResolvedValue({ ...makeAuthUser(), active: false });
    await expect(requireAuth()).rejects.toMatchObject({ status: 401 });
  });

  it("resolves with the user when session + DB user are valid (no minRole)", async () => {
    const user = makeAuthUser({ role: "staff" });
    mockSession(user.id);
    mockDbUser(user);

    const result = await requireAuth();
    expect(result).toMatchObject({ id: user.id, role: "staff", tenantId: user.tenantId });
  });

  it("resolves when user role meets the minimum requirement exactly", async () => {
    const user = makeAuthUser({ role: "staff" });
    mockSession(user.id);
    mockDbUser(user);
    await expect(requireAuth("staff")).resolves.toMatchObject({ role: "staff" });
  });

  it("resolves when user role exceeds the minimum requirement", async () => {
    const user = makeAuthUser({ role: "admin" });
    mockSession(user.id);
    mockDbUser(user);
    await expect(requireAuth("staff")).resolves.toMatchObject({ role: "admin" });
  });

  it("resolves for owner when minRole is admin", async () => {
    const user = makeAuthUser({ role: "owner" });
    mockSession(user.id);
    mockDbUser(user);
    await expect(requireAuth("admin")).resolves.toMatchObject({ role: "owner" });
  });

  it("throws 403 when user role is below the minimum requirement", async () => {
    const user = makeAuthUser({ role: "staff" });
    mockSession(user.id);
    mockDbUser(user);
    await expect(requireAuth("admin")).rejects.toMatchObject({ status: 403 });
  });

  it("throws 403 for staff when minRole is owner", async () => {
    const user = makeAuthUser({ role: "staff" });
    mockSession(user.id);
    mockDbUser(user);
    await expect(requireAuth("owner")).rejects.toMatchObject({ status: 403 });
  });

  it("queries DB with the userId from the session token", async () => {
    const user = makeAuthUser({ id: "abc-123" });
    mockSession("abc-123");
    mockDbUser(user);

    await requireAuth();
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "abc-123" } }),
    );
  });
});

// ── apiError ──────────────────────────────────────────────────────────────────

describe("apiError", () => {
  it("returns the error's status code when present", async () => {
    const err = Object.assign(new Error("No autorizado."), { status: 401 });
    const res = apiError(err);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("No autorizado.");
  });

  it("defaults to 500 when error has no status", async () => {
    const res = apiError(new Error("Something broke"));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Something broke");
  });

  it("defaults to 500 for non-Error objects", async () => {
    const res = apiError("not an error");
    expect(res.status).toBe(500);
  });

  it("returns JSON content-type header", () => {
    const res = apiError(new Error("test"));
    expect(res.headers.get("Content-Type")).toBe("application/json");
  });

  it("returns 403 status for access denied errors", async () => {
    const err = Object.assign(new Error("Acceso denegado."), { status: 403 });
    const res = apiError(err);
    expect(res.status).toBe(403);
  });
});
