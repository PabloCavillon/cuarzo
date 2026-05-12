import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeAuthUser, makeFormData } from "../../helpers/mock-factories";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const sessionMock = vi.hoisted(() => ({
  requireAuth: vi.fn(),
}));

const prismaMock = vi.hoisted(() => ({
  client: {
    findUnique: vi.fn(),
    create:     vi.fn(),
    update:     vi.fn(),
  },
}));

vi.mock("@/lib/session", () => sessionMock);
vi.mock("@/lib/prisma",  () => ({ prisma: prismaMock }));

// ── Imports ───────────────────────────────────────────────────────────────────

import { createClient, updateClient, toggleClient } from "@/app/admin/clients/actions";

// ── Setup ─────────────────────────────────────────────────────────────────────

const TENANT = "tenant-1";
const USER   = makeAuthUser({ tenantId: TENANT });

beforeEach(() => {
  vi.resetAllMocks();
  sessionMock.requireAuth.mockResolvedValue(USER);
});

// ── createClient ──────────────────────────────────────────────────────────────

describe("createClient", () => {
  it("creates a client and returns ok: true", async () => {
    prismaMock.client.create.mockResolvedValue({ id: "c1" });

    const fd = makeFormData({ name: "Ana Pérez", email: "ana@example.com", phone: "1122334455" });
    const result = await createClient(fd);

    expect(result).toEqual({ ok: true });
    expect(prismaMock.client.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: "Ana Pérez", email: "ana@example.com", tenantId: TENANT }),
      }),
    );
  });

  it("returns error when name is missing", async () => {
    const fd = makeFormData({ name: "", email: "ana@example.com" });
    const result = await createClient(fd);
    expect(result).toEqual({ ok: false, error: "El nombre es requerido." });
    expect(prismaMock.client.create).not.toHaveBeenCalled();
  });

  it("returns error when unauthenticated", async () => {
    sessionMock.requireAuth.mockRejectedValue(Object.assign(new Error("No autorizado."), { status: 401 }));
    const fd = makeFormData({ name: "Ana" });
    const result = await createClient(fd);
    expect(result).toEqual({ ok: false, error: "No autorizado." });
  });

  it("returns empty fields as null (optional fields)", async () => {
    prismaMock.client.create.mockResolvedValue({ id: "c2" });
    const fd = makeFormData({ name: "Solo Nombre" });
    await createClient(fd);

    const callData = prismaMock.client.create.mock.calls[0][0].data;
    expect(callData.email).toBeNull();
    expect(callData.phone).toBeNull();
    expect(callData.address).toBeNull();
    expect(callData.notes).toBeNull();
  });

  it("propagates Prisma errors as ok: false", async () => {
    prismaMock.client.create.mockRejectedValue(new Error("DB error"));
    const fd = makeFormData({ name: "X" });
    const result = await createClient(fd);
    expect(result).toEqual({ ok: false, error: "DB error" });
  });
});

// ── updateClient ──────────────────────────────────────────────────────────────

describe("updateClient", () => {
  const EXISTING = { id: "c1", tenantId: TENANT, name: "Old Name" };

  it("updates a client when found in the same tenant", async () => {
    prismaMock.client.findUnique.mockResolvedValue(EXISTING);
    prismaMock.client.update.mockResolvedValue({ ...EXISTING, name: "New Name" });

    const fd = makeFormData({ name: "New Name", email: "new@email.com" });
    const result = await updateClient("c1", fd);

    expect(result).toEqual({ ok: true });
    expect(prismaMock.client.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "c1" } }),
    );
  });

  it("returns error when client is not found", async () => {
    prismaMock.client.findUnique.mockResolvedValue(null);
    const fd = makeFormData({ name: "X" });
    const result = await updateClient("missing", fd);
    expect(result).toEqual({ ok: false, error: "Cliente no encontrado." });
  });

  it("returns error when client belongs to a different tenant", async () => {
    prismaMock.client.findUnique.mockResolvedValue({ id: "c1", tenantId: "other-tenant" });
    const fd = makeFormData({ name: "X" });
    const result = await updateClient("c1", fd);
    expect(result).toEqual({ ok: false, error: "Cliente no encontrado." });
  });

  it("returns error when name is empty", async () => {
    prismaMock.client.findUnique.mockResolvedValue(EXISTING);
    const fd = makeFormData({ name: "" });
    const result = await updateClient("c1", fd);
    expect(result).toEqual({ ok: false, error: "El nombre es requerido." });
  });

  it("trims whitespace from name and other fields", async () => {
    prismaMock.client.findUnique.mockResolvedValue(EXISTING);
    prismaMock.client.update.mockResolvedValue({});

    const fd = makeFormData({ name: "  Trimmed  ", email: "  trim@email.com  " });
    await updateClient("c1", fd);

    const callData = prismaMock.client.update.mock.calls[0][0].data;
    expect(callData.name).toBe("Trimmed");
  });
});

// ── toggleClient ──────────────────────────────────────────────────────────────

describe("toggleClient", () => {
  const EXISTING = { id: "c1", tenantId: TENANT, active: true };

  it("deactivates a client", async () => {
    prismaMock.client.findUnique.mockResolvedValue(EXISTING);
    prismaMock.client.update.mockResolvedValue({});

    const result = await toggleClient("c1", false);

    expect(result).toEqual({ ok: true });
    expect(prismaMock.client.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { active: false } }),
    );
  });

  it("activates a client", async () => {
    prismaMock.client.findUnique.mockResolvedValue({ ...EXISTING, active: false });
    prismaMock.client.update.mockResolvedValue({});

    const result = await toggleClient("c1", true);
    expect(result).toEqual({ ok: true });
    expect(prismaMock.client.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { active: true } }),
    );
  });

  it("returns error when client is not found", async () => {
    prismaMock.client.findUnique.mockResolvedValue(null);
    const result = await toggleClient("missing", false);
    expect(result).toEqual({ ok: false, error: "Cliente no encontrado." });
  });

  it("returns error when client belongs to a different tenant", async () => {
    prismaMock.client.findUnique.mockResolvedValue({ id: "c1", tenantId: "other" });
    const result = await toggleClient("c1", false);
    expect(result).toEqual({ ok: false, error: "Cliente no encontrado." });
  });

  it("returns error when unauthenticated", async () => {
    sessionMock.requireAuth.mockRejectedValue(new Error("No autorizado."));
    const result = await toggleClient("c1", false);
    expect(result).toEqual({ ok: false, error: "No autorizado." });
  });
});
