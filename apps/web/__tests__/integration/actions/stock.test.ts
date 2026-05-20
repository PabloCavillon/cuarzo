import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeAuthUser, makeFormData } from "../../helpers/mock-factories";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const sessionMock = vi.hoisted(() => ({ requireAuth: vi.fn() }));

const prismaMock = vi.hoisted(() => ({
  catalogProduct: {
    findUnique: vi.fn(),
  },
  stockWarehouse: {
    findUnique: vi.fn(),
  },
  stockItem: {
    findFirst: vi.fn(),
    create:    vi.fn(),
    update:    vi.fn(),
  },
  stockMovement: {
    create: vi.fn(),
  },
  $transaction: vi.fn(),
}));

vi.mock("@/lib/session", () => sessionMock);
vi.mock("@/lib/prisma",  () => ({ prisma: prismaMock }));

// ── Imports ───────────────────────────────────────────────────────────────────

import { adjustStock } from "@/app/admin/stock/actions";

// ── Setup ─────────────────────────────────────────────────────────────────────

const TENANT = "tenant-1";
const USER   = makeAuthUser({ tenantId: TENANT });

beforeEach(() => {
  vi.resetAllMocks();
  sessionMock.requireAuth.mockResolvedValue(USER);
  prismaMock.$transaction.mockImplementation(async (ops: unknown[]) => {
    for (const op of ops) await op;
    return [];
  });
});

// ── adjustStock ───────────────────────────────────────────────────────────────

describe("adjustStock", () => {
  const PRODUCT   = { tenantId: TENANT };
  const WAREHOUSE = { tenantId: TENANT };

  it("creates a movement + updates stockItem and returns ok: true", async () => {
    prismaMock.catalogProduct.findUnique.mockResolvedValue(PRODUCT);
    prismaMock.stockWarehouse.findUnique.mockResolvedValue(WAREHOUSE);
    prismaMock.stockItem.findFirst.mockResolvedValue({ id: "si-1", qty: 5 });
    prismaMock.stockItem.update.mockResolvedValue({});
    prismaMock.stockMovement.create.mockResolvedValue({});

    const fd = makeFormData({ productId: "prod-1", warehouseId: "wh-1", newQty: "10" });
    const result = await adjustStock(fd);

    expect(result).toEqual({ ok: true });
    expect(prismaMock.$transaction).toHaveBeenCalled();
    const txArgs = prismaMock.$transaction.mock.calls[0][0] as unknown[];
    expect(txArgs).toHaveLength(2);
  });

  it("creates a new stockItem when none exists yet", async () => {
    prismaMock.catalogProduct.findUnique.mockResolvedValue(PRODUCT);
    prismaMock.stockWarehouse.findUnique.mockResolvedValue(WAREHOUSE);
    prismaMock.stockItem.findFirst.mockResolvedValue(null); // no existing item
    prismaMock.stockItem.create.mockResolvedValue({});
    prismaMock.stockMovement.create.mockResolvedValue({});

    const fd = makeFormData({ productId: "prod-1", warehouseId: "wh-1", newQty: "5" });
    const result = await adjustStock(fd);

    expect(result).toEqual({ ok: true });
    expect(prismaMock.$transaction).toHaveBeenCalled();
  });

  it("returns ok: true without hitting DB when delta is 0", async () => {
    prismaMock.catalogProduct.findUnique.mockResolvedValue(PRODUCT);
    prismaMock.stockWarehouse.findUnique.mockResolvedValue(WAREHOUSE);
    prismaMock.stockItem.findFirst.mockResolvedValue({ id: "si-1", qty: 10 });

    const fd = makeFormData({ productId: "prod-1", warehouseId: "wh-1", newQty: "10" });
    const result = await adjustStock(fd);

    expect(result).toEqual({ ok: true });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("returns error when productId is missing", async () => {
    const fd = makeFormData({ productId: "", warehouseId: "wh-1", newQty: "5" });
    const result = await adjustStock(fd);
    expect(result).toEqual({ ok: false, error: "Producto requerido." });
  });

  it("returns error when warehouseId is missing", async () => {
    const fd = makeFormData({ productId: "prod-1", warehouseId: "", newQty: "5" });
    const result = await adjustStock(fd);
    expect(result).toEqual({ ok: false, error: "Depósito requerido." });
  });

  it("returns error when newQty is negative", async () => {
    const fd = makeFormData({ productId: "prod-1", warehouseId: "wh-1", newQty: "-1" });
    const result = await adjustStock(fd);
    expect(result).toEqual({ ok: false, error: "La cantidad debe ser ≥ 0." });
  });

  it("returns error when newQty is not a number", async () => {
    const fd = makeFormData({ productId: "prod-1", warehouseId: "wh-1", newQty: "abc" });
    const result = await adjustStock(fd);
    expect(result).toEqual({ ok: false, error: "La cantidad debe ser ≥ 0." });
  });

  it("returns error when product is not found", async () => {
    prismaMock.catalogProduct.findUnique.mockResolvedValue(null);
    prismaMock.stockWarehouse.findUnique.mockResolvedValue(WAREHOUSE);
    const fd = makeFormData({ productId: "missing", warehouseId: "wh-1", newQty: "5" });
    const result = await adjustStock(fd);
    expect(result).toEqual({ ok: false, error: "Producto no encontrado." });
  });

  it("returns error when product belongs to a different tenant", async () => {
    prismaMock.catalogProduct.findUnique.mockResolvedValue({ tenantId: "other" });
    prismaMock.stockWarehouse.findUnique.mockResolvedValue(WAREHOUSE);
    const fd = makeFormData({ productId: "prod-1", warehouseId: "wh-1", newQty: "5" });
    const result = await adjustStock(fd);
    expect(result).toEqual({ ok: false, error: "Producto no encontrado." });
  });

  it("returns error when warehouse is not found", async () => {
    prismaMock.catalogProduct.findUnique.mockResolvedValue(PRODUCT);
    prismaMock.stockWarehouse.findUnique.mockResolvedValue(null);
    const fd = makeFormData({ productId: "prod-1", warehouseId: "missing", newQty: "5" });
    const result = await adjustStock(fd);
    expect(result).toEqual({ ok: false, error: "Depósito no encontrado." });
  });

  it("returns error when warehouse belongs to a different tenant", async () => {
    prismaMock.catalogProduct.findUnique.mockResolvedValue(PRODUCT);
    prismaMock.stockWarehouse.findUnique.mockResolvedValue({ tenantId: "other" });
    const fd = makeFormData({ productId: "prod-1", warehouseId: "wh-1", newQty: "5" });
    const result = await adjustStock(fd);
    expect(result).toEqual({ ok: false, error: "Depósito no encontrado." });
  });

  it("falls back to 'adjustment' for unknown reason values", async () => {
    prismaMock.catalogProduct.findUnique.mockResolvedValue(PRODUCT);
    prismaMock.stockWarehouse.findUnique.mockResolvedValue(WAREHOUSE);
    prismaMock.stockItem.findFirst.mockResolvedValue({ id: "si-1", qty: 0 });
    prismaMock.stockItem.update.mockResolvedValue({});
    prismaMock.stockMovement.create.mockResolvedValue({});

    const fd = makeFormData({ productId: "p1", warehouseId: "w1", newQty: "5", reason: "unknown_reason" });
    await adjustStock(fd);

    const txOps = prismaMock.$transaction.mock.calls[0][0] as unknown[];
    // The first op is stockMovement.create — check its reason arg
    expect(prismaMock.stockMovement.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ reason: "adjustment" }) }),
    );
  });

  it("accepts valid reason values", async () => {
    prismaMock.catalogProduct.findUnique.mockResolvedValue(PRODUCT);
    prismaMock.stockWarehouse.findUnique.mockResolvedValue(WAREHOUSE);
    prismaMock.stockItem.findFirst.mockResolvedValue({ id: "si-1", qty: 0 });
    prismaMock.stockItem.update.mockResolvedValue({});
    prismaMock.stockMovement.create.mockResolvedValue({});

    const fd = makeFormData({ productId: "p1", warehouseId: "w1", newQty: "3", reason: "purchase" });
    const result = await adjustStock(fd);
    expect(result).toEqual({ ok: true });

    expect(prismaMock.stockMovement.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ reason: "purchase" }) }),
    );
  });

  it("returns error when unauthenticated", async () => {
    sessionMock.requireAuth.mockRejectedValue(new Error("No autorizado."));
    const fd = makeFormData({ productId: "p1", warehouseId: "w1", newQty: "5" });
    const result = await adjustStock(fd);
    expect(result).toEqual({ ok: false, error: "No autorizado." });
  });
});
