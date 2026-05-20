import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeAuthUser, makeFormData } from "../../helpers/mock-factories";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const sessionMock = vi.hoisted(() => ({ requireAuth: vi.fn() }));

const prismaMock = vi.hoisted(() => ({
  user: {
    findFirst:  vi.fn(),
    findUnique: vi.fn(),
    update:     vi.fn(),
    delete:     vi.fn(),
    count:      vi.fn(),
  },
  invitation: {
    findUnique: vi.fn(),
    upsert:     vi.fn(),
    delete:     vi.fn(),
  },
  tenant: {
    findUnique: vi.fn(),
  },
  auditLog: {
    create: vi.fn(),
  },
}));

const emailMock = vi.hoisted(() => ({
  sendInvitation: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/session",     () => sessionMock);
vi.mock("@/lib/prisma",      () => ({ prisma: prismaMock }));
vi.mock("@/lib/email",       () => emailMock);
vi.mock("@/lib/audit",       () => ({ audit: vi.fn().mockResolvedValue(undefined) }));

// ── Imports ───────────────────────────────────────────────────────────────────

import {
  inviteMember,
  cancelInvitation,
  removeMember,
  updateMemberRole,
} from "@/app/admin/settings/team/actions";

// ── Setup ─────────────────────────────────────────────────────────────────────

const TENANT = "tenant-1";
const ADMIN  = makeAuthUser({ id: "admin-1", tenantId: TENANT, role: "admin", name: "Admin User" });

beforeEach(() => {
  vi.resetAllMocks();
  sessionMock.requireAuth.mockResolvedValue(ADMIN);
  prismaMock.tenant.findUnique.mockResolvedValue({ id: TENANT, name: "Mi Tienda", plan: "pro" });
  prismaMock.invitation.upsert.mockResolvedValue({ id: "inv-1", token: "token-abc" });
  prismaMock.user.count.mockResolvedValue(1); // well under any plan limit
  prismaMock.auditLog.create.mockResolvedValue({});
});

// ── inviteMember ──────────────────────────────────────────────────────────────

describe("inviteMember", () => {
  it("creates an invitation and fires the email", async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);

    const fd = makeFormData({ email: "newmember@example.com", role: "staff" });
    const result = await inviteMember(fd);

    expect(result).toEqual({ ok: true });
    expect(prismaMock.invitation.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId_email: { tenantId: TENANT, email: "newmember@example.com" } },
      }),
    );
    expect(emailMock.sendInvitation).toHaveBeenCalledWith(
      expect.objectContaining({ to: "newmember@example.com", role: "staff" }),
    );
  });

  it("normalizes email to lowercase", async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);

    const fd = makeFormData({ email: "UPPER@EXAMPLE.COM", role: "staff" });
    await inviteMember(fd);

    expect(prismaMock.invitation.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId_email: { tenantId: TENANT, email: "upper@example.com" } },
      }),
    );
  });

  it("returns error for invalid email format", async () => {
    const fd = makeFormData({ email: "not-an-email", role: "staff" });
    const result = await inviteMember(fd);
    expect(result).toEqual({ ok: false, error: "Email inválido" });
    expect(prismaMock.invitation.upsert).not.toHaveBeenCalled();
  });

  it("returns error for empty email", async () => {
    const fd = makeFormData({ email: "", role: "staff" });
    const result = await inviteMember(fd);
    expect(result).toEqual({ ok: false, error: "Email inválido" });
  });

  it("returns error for invalid role", async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    const fd = makeFormData({ email: "x@y.com", role: "owner" });
    const result = await inviteMember(fd);
    expect(result).toEqual({ ok: false, error: "Rol inválido" });
  });

  it("returns error when user with that email already exists", async () => {
    prismaMock.user.findFirst.mockResolvedValue({ id: "existing-user" });
    const fd = makeFormData({ email: "existing@example.com", role: "staff" });
    const result = await inviteMember(fd);
    expect(result).toEqual({ ok: false, error: "Ya existe un miembro con ese email" });
    expect(prismaMock.invitation.upsert).not.toHaveBeenCalled();
  });

  it("can invite with role admin", async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    const fd = makeFormData({ email: "newadmin@example.com", role: "admin" });
    const result = await inviteMember(fd);
    expect(result).toEqual({ ok: true });
    expect(emailMock.sendInvitation).toHaveBeenCalledWith(
      expect.objectContaining({ role: "admin" }),
    );
  });

  it("sets expiresAt to 7 days from now", async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    const before = new Date();
    const fd = makeFormData({ email: "x@y.com", role: "staff" });
    await inviteMember(fd);
    const after = new Date();

    const upsertCall = prismaMock.invitation.upsert.mock.calls[0][0];
    const expiresAt = upsertCall.create.expiresAt as Date;
    const expectedMs = 7 * 24 * 60 * 60 * 1000;
    expect(expiresAt.getTime() - before.getTime()).toBeGreaterThanOrEqual(expectedMs - 100);
    expect(expiresAt.getTime() - after.getTime()).toBeLessThanOrEqual(expectedMs + 100);
  });
});

// ── cancelInvitation ──────────────────────────────────────────────────────────

describe("cancelInvitation", () => {
  it("deletes the invitation and returns ok: true", async () => {
    prismaMock.invitation.findUnique.mockResolvedValue({ id: "inv-1", tenantId: TENANT });
    prismaMock.invitation.delete.mockResolvedValue({});

    const result = await cancelInvitation("inv-1");

    expect(result).toEqual({ ok: true });
    expect(prismaMock.invitation.delete).toHaveBeenCalledWith({ where: { id: "inv-1" } });
  });

  it("returns error when invitation is not found", async () => {
    prismaMock.invitation.findUnique.mockResolvedValue(null);
    const result = await cancelInvitation("missing");
    expect(result).toEqual({ ok: false, error: "No encontrado" });
  });

  it("returns error when invitation belongs to a different tenant", async () => {
    prismaMock.invitation.findUnique.mockResolvedValue({ id: "inv-1", tenantId: "other" });
    const result = await cancelInvitation("inv-1");
    expect(result).toEqual({ ok: false, error: "No encontrado" });
  });
});

// ── removeMember ──────────────────────────────────────────────────────────────

describe("removeMember", () => {
  const STAFF = { id: "staff-1", tenantId: TENANT, role: "staff" };

  it("removes a staff member and returns ok: true", async () => {
    prismaMock.user.findUnique.mockResolvedValue(STAFF);
    prismaMock.user.delete.mockResolvedValue({});

    const result = await removeMember("staff-1");

    expect(result).toEqual({ ok: true });
    expect(prismaMock.user.delete).toHaveBeenCalledWith({ where: { id: "staff-1" } });
  });

  it("returns error when trying to remove self", async () => {
    const result = await removeMember(ADMIN.id); // same id as the logged-in user
    expect(result).toEqual({ ok: false, error: "No podés eliminarte a vos mismo" });
    expect(prismaMock.user.delete).not.toHaveBeenCalled();
  });

  it("returns error when target user is not found", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    const result = await removeMember("missing");
    expect(result).toEqual({ ok: false, error: "Usuario no encontrado" });
  });

  it("returns error when target belongs to a different tenant", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: "x", tenantId: "other", role: "staff" });
    const result = await removeMember("x");
    expect(result).toEqual({ ok: false, error: "Usuario no encontrado" });
  });

  it("returns error when target is the owner", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: "owner-1", tenantId: TENANT, role: "owner" });
    const result = await removeMember("owner-1");
    expect(result).toEqual({ ok: false, error: "No se puede eliminar al owner" });
    expect(prismaMock.user.delete).not.toHaveBeenCalled();
  });
});

// ── updateMemberRole ──────────────────────────────────────────────────────────

describe("updateMemberRole", () => {
  const STAFF = { id: "staff-1", tenantId: TENANT, role: "staff" };

  it("updates a member's role and returns ok: true", async () => {
    prismaMock.user.findUnique.mockResolvedValue(STAFF);
    prismaMock.user.update.mockResolvedValue({});

    const result = await updateMemberRole("staff-1", "admin");

    expect(result).toEqual({ ok: true });
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "staff-1" }, data: { role: "admin" } }),
    );
  });

  it("returns error for invalid role value", async () => {
    const result = await updateMemberRole("staff-1", "owner");
    expect(result).toEqual({ ok: false, error: "Rol inválido" });
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("returns error when trying to change own role", async () => {
    const result = await updateMemberRole(ADMIN.id, "staff");
    expect(result).toEqual({ ok: false, error: "No podés cambiar tu propio rol" });
  });

  it("returns error when target is not found", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    const result = await updateMemberRole("missing", "staff");
    expect(result).toEqual({ ok: false, error: "Usuario no encontrado" });
  });

  it("returns error when target is the owner", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: "owner-1", tenantId: TENANT, role: "owner" });
    const result = await updateMemberRole("owner-1", "admin");
    expect(result).toEqual({ ok: false, error: "No se puede cambiar el rol del owner" });
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("returns error when target belongs to a different tenant", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: "x", tenantId: "other", role: "staff" });
    const result = await updateMemberRole("x", "admin");
    expect(result).toEqual({ ok: false, error: "Usuario no encontrado" });
  });

  it("accepts 'staff' as a valid role", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...STAFF, role: "admin" });
    prismaMock.user.update.mockResolvedValue({});
    const result = await updateMemberRole("staff-1", "staff");
    expect(result).toEqual({ ok: true });
  });
});
