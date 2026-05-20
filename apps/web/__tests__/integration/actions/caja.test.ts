import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeAuthUser, makeFormData } from "../../helpers/mock-factories";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const sessionMock = vi.hoisted(() => ({ requireAuth: vi.fn() }));

const prismaMock = vi.hoisted(() => ({
  cajaMovimiento: {
    findUnique: vi.fn(),
    create:     vi.fn(),
    update:     vi.fn(),
    delete:     vi.fn(),
  },
}));

vi.mock("@/lib/session", () => sessionMock);
vi.mock("@/lib/prisma",  () => ({ prisma: prismaMock }));

// ── Imports ───────────────────────────────────────────────────────────────────

import { createMovimiento, updateMovimiento, deleteMovimiento } from "@/app/admin/finance/actions";

// ── Setup ─────────────────────────────────────────────────────────────────────

const TENANT = "tenant-1";
const USER   = makeAuthUser({ tenantId: TENANT });

beforeEach(() => {
  vi.resetAllMocks();
  sessionMock.requireAuth.mockResolvedValue(USER);
});

// ── createMovimiento ──────────────────────────────────────────────────────────

describe("createMovimiento", () => {
  it("creates an ingreso movement and returns ok: true", async () => {
    prismaMock.cajaMovimiento.create.mockResolvedValue({ id: "m1" });

    const fd = makeFormData({
      tipo: "ingreso", monto: "1500", descripcion: "Pago cliente",
      metodoPago: "efectivo", fecha: "2026-05-01",
    });
    const result = await createMovimiento(fd);

    expect(result).toEqual({ ok: true });
    expect(prismaMock.cajaMovimiento.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tipo: "ingreso", monto: 1500, tenantId: TENANT }),
      }),
    );
  });

  it("creates an egreso movement", async () => {
    prismaMock.cajaMovimiento.create.mockResolvedValue({ id: "m2" });

    const fd = makeFormData({
      tipo: "egreso", monto: "500", descripcion: "Compra insumos",
    });
    const result = await createMovimiento(fd);
    expect(result).toEqual({ ok: true });
    expect(prismaMock.cajaMovimiento.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tipo: "egreso" }),
      }),
    );
  });

  it("returns error for invalid tipo", async () => {
    const fd = makeFormData({ tipo: "otro", monto: "100", descripcion: "Test" });
    const result = await createMovimiento(fd);
    expect(result).toEqual({ ok: false, error: "Tipo inválido" });
    expect(prismaMock.cajaMovimiento.create).not.toHaveBeenCalled();
  });

  it("returns error for monto = 0", async () => {
    const fd = makeFormData({ tipo: "ingreso", monto: "0", descripcion: "Test" });
    const result = await createMovimiento(fd);
    expect(result).toEqual({ ok: false, error: "Monto debe ser mayor a 0" });
  });

  it("returns error for negative monto", async () => {
    const fd = makeFormData({ tipo: "ingreso", monto: "-50", descripcion: "Test" });
    const result = await createMovimiento(fd);
    expect(result).toEqual({ ok: false, error: "Monto debe ser mayor a 0" });
  });

  it("returns error when descripcion is missing", async () => {
    const fd = makeFormData({ tipo: "ingreso", monto: "100", descripcion: "" });
    const result = await createMovimiento(fd);
    expect(result).toEqual({ ok: false, error: "Descripción requerida" });
  });

  it("defaults metodoPago to 'efectivo' when not provided", async () => {
    prismaMock.cajaMovimiento.create.mockResolvedValue({ id: "m3" });
    const fd = makeFormData({ tipo: "ingreso", monto: "200", descripcion: "Test" });
    await createMovimiento(fd);
    const callData = prismaMock.cajaMovimiento.create.mock.calls[0][0].data;
    expect(callData.metodoPago).toBe("efectivo");
  });

  it("uses today as fecha when not provided", async () => {
    prismaMock.cajaMovimiento.create.mockResolvedValue({ id: "m4" });
    const before = new Date();
    const fd = makeFormData({ tipo: "ingreso", monto: "100", descripcion: "Test" });
    await createMovimiento(fd);
    const after = new Date();

    const callData = prismaMock.cajaMovimiento.create.mock.calls[0][0].data;
    const fecha = callData.fecha as Date;
    expect(fecha.getTime()).toBeGreaterThanOrEqual(before.getTime() - 100);
    expect(fecha.getTime()).toBeLessThanOrEqual(after.getTime() + 100);
  });

  it("returns error when unauthenticated", async () => {
    sessionMock.requireAuth.mockRejectedValue(new Error("No autorizado."));
    const fd = makeFormData({ tipo: "ingreso", monto: "100", descripcion: "Test" });
    const result = await createMovimiento(fd);
    expect(result).toEqual({ ok: false, error: "No autorizado." });
  });
});

// ── updateMovimiento ──────────────────────────────────────────────────────────

describe("updateMovimiento", () => {
  const EXISTING = { id: "m1", tenantId: TENANT, fecha: new Date("2026-04-01") };

  it("updates a movimiento when found in the same tenant", async () => {
    prismaMock.cajaMovimiento.findUnique.mockResolvedValue(EXISTING);
    prismaMock.cajaMovimiento.update.mockResolvedValue({});

    const fd = makeFormData({
      tipo: "egreso", monto: "300", descripcion: "Actualizado",
    });
    const result = await updateMovimiento("m1", fd);

    expect(result).toEqual({ ok: true });
    expect(prismaMock.cajaMovimiento.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "m1" } }),
    );
  });

  it("returns error when movimiento is not found", async () => {
    prismaMock.cajaMovimiento.findUnique.mockResolvedValue(null);
    const fd = makeFormData({ tipo: "ingreso", monto: "100", descripcion: "T" });
    const result = await updateMovimiento("missing", fd);
    expect(result).toEqual({ ok: false, error: "Movimiento no encontrado" });
  });

  it("returns error when movimiento belongs to a different tenant", async () => {
    prismaMock.cajaMovimiento.findUnique.mockResolvedValue({ id: "m1", tenantId: "other" });
    const fd = makeFormData({ tipo: "ingreso", monto: "100", descripcion: "T" });
    const result = await updateMovimiento("m1", fd);
    expect(result).toEqual({ ok: false, error: "Movimiento no encontrado" });
  });

  it("preserves original fecha when not provided in update", async () => {
    prismaMock.cajaMovimiento.findUnique.mockResolvedValue(EXISTING);
    prismaMock.cajaMovimiento.update.mockResolvedValue({});

    const fd = makeFormData({ tipo: "ingreso", monto: "100", descripcion: "T", fecha: "" });
    await updateMovimiento("m1", fd);

    const callData = prismaMock.cajaMovimiento.update.mock.calls[0][0].data;
    expect(callData.fecha).toEqual(EXISTING.fecha);
  });

  it("returns error for invalid tipo on update", async () => {
    prismaMock.cajaMovimiento.findUnique.mockResolvedValue(EXISTING);
    const fd = makeFormData({ tipo: "invalido", monto: "100", descripcion: "T" });
    const result = await updateMovimiento("m1", fd);
    expect(result).toEqual({ ok: false, error: "Tipo inválido" });
  });
});

// ── deleteMovimiento ──────────────────────────────────────────────────────────

describe("deleteMovimiento", () => {
  const EXISTING = { id: "m1", tenantId: TENANT };

  it("deletes a movimiento and returns ok: true", async () => {
    prismaMock.cajaMovimiento.findUnique.mockResolvedValue(EXISTING);
    prismaMock.cajaMovimiento.delete.mockResolvedValue({});

    const result = await deleteMovimiento("m1");

    expect(result).toEqual({ ok: true });
    expect(prismaMock.cajaMovimiento.delete).toHaveBeenCalledWith({ where: { id: "m1" } });
  });

  it("returns error when movimiento is not found", async () => {
    prismaMock.cajaMovimiento.findUnique.mockResolvedValue(null);
    const result = await deleteMovimiento("missing");
    expect(result).toEqual({ ok: false, error: "Movimiento no encontrado" });
    expect(prismaMock.cajaMovimiento.delete).not.toHaveBeenCalled();
  });

  it("returns error when movimiento belongs to a different tenant", async () => {
    prismaMock.cajaMovimiento.findUnique.mockResolvedValue({ id: "m1", tenantId: "other-tenant" });
    const result = await deleteMovimiento("m1");
    expect(result).toEqual({ ok: false, error: "Movimiento no encontrado" });
    expect(prismaMock.cajaMovimiento.delete).not.toHaveBeenCalled();
  });

  it("returns error when unauthenticated", async () => {
    sessionMock.requireAuth.mockRejectedValue(new Error("No autorizado."));
    const result = await deleteMovimiento("m1");
    expect(result).toEqual({ ok: false, error: "No autorizado." });
  });

  it("propagates Prisma delete errors", async () => {
    prismaMock.cajaMovimiento.findUnique.mockResolvedValue(EXISTING);
    prismaMock.cajaMovimiento.delete.mockRejectedValue(new Error("FK constraint"));
    const result = await deleteMovimiento("m1");
    expect(result).toEqual({ ok: false, error: "FK constraint" });
  });
});
