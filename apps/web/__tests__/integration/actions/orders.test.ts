import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeAuthUser, makeFormData } from "../../helpers/mock-factories";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const sessionMock = vi.hoisted(() => ({ requireAuth: vi.fn() }));

const prismaMock = vi.hoisted(() => ({
  order: {
    findUnique: vi.fn(),
    create:     vi.fn(),
    update:     vi.fn(),
    updateMany: vi.fn(),
  },
  catalogProduct: {
    findMany: vi.fn(),
  },
  orderClient: {
    upsert: vi.fn(),
  },
  orderItem: {
    findMany: vi.fn(),
  },
  payment: {
    create: vi.fn(),
  },
  stockWarehouse: {
    findMany:  vi.fn(),
    findFirst: vi.fn(),
  },
  stockItem: {
    findFirst: vi.fn(),
    findMany:  vi.fn(),
    create:    vi.fn(),
    update:    vi.fn(),
    updateMany: vi.fn(),
  },
  stockMovement: {
    create:   vi.fn(),
    findMany: vi.fn(),
  },
  $transaction: vi.fn(),
}));

const emailMock = vi.hoisted(() => ({
  sendOrderCreated:      vi.fn().mockResolvedValue(undefined),
  sendOrderStatusUpdate: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/auth/session", () => sessionMock);
vi.mock("@/lib/db/prisma",  () => ({ prisma: prismaMock }));
vi.mock("@/lib/utils/plan-limits", () => ({
  hasModule:         async () => true,
  checkProductLimit: async () => true,
}));
vi.mock("@/lib/integrations/email",   () => emailMock);

// ── Imports ───────────────────────────────────────────────────────────────────

import { createOrder, updateOrderStatus, registerPayment } from "@/app/admin/orders/actions";

// ── Setup ─────────────────────────────────────────────────────────────────────

const TENANT = "tenant-1";
const USER   = makeAuthUser({ tenantId: TENANT, role: "staff" });

const ITEMS = [
  { productId: "prod-1", variantId: null, skuSnap: "SKU-1", nameSnap: "Producto A", qty: 2, unitPrice: 500 },
];

beforeEach(() => {
  vi.resetAllMocks();
  sessionMock.requireAuth.mockResolvedValue(USER);
  prismaMock.$transaction.mockImplementation((arg: unknown) =>
    typeof arg === "function" ? arg(prismaMock) : Promise.all(arg as Promise<unknown>[]));
  prismaMock.order.updateMany.mockResolvedValue({ count: 1 });
  prismaMock.stockMovement.findMany.mockResolvedValue([]);
    prismaMock.stockItem.findMany.mockResolvedValue([]);
    prismaMock.catalogProduct.findMany.mockImplementation(({ where }: { where: { id: { in: string[] } } }) =>
      Promise.resolve(where.id.in.map((id) => ({ id, sku: "SKU", name: "Producto", variants: [] }))));
});

// ── createOrder ───────────────────────────────────────────────────────────────

describe("createOrder", () => {
  it.each([
    ["negative quantity", { qty: -5 }],
    ["fractional quantity", { qty: 1.5 }],
    ["negative price", { unitPrice: -1 }],
  ])("rejects %s", async (_, change) => {
    const fd = makeFormData({ clientName: "A", clientEmail: "a@b.com", items: JSON.stringify([{ ...ITEMS[0], ...change }]) });
    expect((await createOrder(fd)).ok).toBe(false);
    expect(prismaMock.order.create).not.toHaveBeenCalled();
  });

  it("rejects a product from another business", async () => {
    prismaMock.catalogProduct.findMany.mockResolvedValue([]);
    const fd = makeFormData({ clientName: "A", clientEmail: "a@b.com", items: JSON.stringify(ITEMS) });
    expect(await createOrder(fd)).toEqual({ ok: false, error: "Producto no encontrado" });
  });

  it("creates an order and returns ok: true with the order id", async () => {
    prismaMock.orderClient.upsert.mockResolvedValue({ id: "oc-1" });
    prismaMock.order.create.mockResolvedValue({ id: "ord-1" });

    const fd = makeFormData({
      clientName:  "Juan García",
      clientEmail: "juan@example.com",
      items:       JSON.stringify(ITEMS),
    });
    const result = await createOrder(fd);

    expect(result).toEqual({ ok: true, id: "ord-1" });
    expect(prismaMock.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tenantId: TENANT, status: "draft" }),
      }),
    );
  });

  it("normalizes clientEmail to lowercase", async () => {
    prismaMock.orderClient.upsert.mockResolvedValue({ id: "oc-1" });
    prismaMock.order.create.mockResolvedValue({ id: "ord-1" });

    const fd = makeFormData({
      clientName: "X", clientEmail: "UPPER@EXAMPLE.COM", items: JSON.stringify(ITEMS),
    });
    await createOrder(fd);

    expect(prismaMock.orderClient.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId_email: { tenantId: TENANT, email: "upper@example.com" } },
      }),
    );
  });

  it("returns error when clientName is missing", async () => {
    const fd = makeFormData({ clientName: "", clientEmail: "a@b.com", items: JSON.stringify(ITEMS) });
    const result = await createOrder(fd);
    expect(result).toEqual({ ok: false, error: "Nombre y email del cliente son requeridos" });
  });

  it("returns error when clientEmail is missing", async () => {
    const fd = makeFormData({ clientName: "A", clientEmail: "", items: JSON.stringify(ITEMS) });
    const result = await createOrder(fd);
    expect(result).toEqual({ ok: false, error: "Nombre y email del cliente son requeridos" });
  });

  it("returns error when items JSON is malformed", async () => {
    const fd = makeFormData({ clientName: "A", clientEmail: "a@b.com", items: "not-json" });
    const result = await createOrder(fd);
    expect(result).toEqual({ ok: false, error: "Items inválidos" });
  });

  it("returns error when items array is empty", async () => {
    const fd = makeFormData({ clientName: "A", clientEmail: "a@b.com", items: "[]" });
    const result = await createOrder(fd);
    expect(result).toEqual({ ok: false, error: "El pedido debe tener al menos un producto" });
  });

  it("computes total as sum of qty * unitPrice", async () => {
    prismaMock.orderClient.upsert.mockResolvedValue({ id: "oc-1" });
    prismaMock.order.create.mockResolvedValue({ id: "ord-1" });

    const items = [
      { productId: "p1", variantId: null, skuSnap: "S1", nameSnap: "A", qty: 3, unitPrice: 100 },
      { productId: "p2", variantId: null, skuSnap: "S2", nameSnap: "B", qty: 2, unitPrice: 250 },
    ];
    const fd = makeFormData({ clientName: "A", clientEmail: "a@b.com", items: JSON.stringify(items) });
    await createOrder(fd);

    const callData = prismaMock.order.create.mock.calls[0][0].data;
    expect(callData.subtotal).toBe(800); // 300 + 500
    expect(callData.total).toBe(800);
  });

  it("fires sendOrderCreated without awaiting (fire-and-forget)", async () => {
    prismaMock.orderClient.upsert.mockResolvedValue({ id: "oc-1" });
    prismaMock.order.create.mockResolvedValue({ id: "ord-42" });

    const fd = makeFormData({ clientName: "A", clientEmail: "a@b.com", items: JSON.stringify(ITEMS) });
    await createOrder(fd);

    // Email is void (fire-and-forget), may be called async — but since mocked it resolves sync
    expect(emailMock.sendOrderCreated).toHaveBeenCalledOnce();
    expect(emailMock.sendOrderCreated).toHaveBeenCalledWith(
      expect.objectContaining({ to: "a@b.com" }),
    );
  });
});

// ── updateOrderStatus ─────────────────────────────────────────────────────────

describe("updateOrderStatus", () => {
  const DRAFT_ORDER = {
    id:       "ord-1",
    tenantId: TENANT,
    status:   "draft",
    total:    { toString: () => "1000" },
    client:   { email: "client@example.com", name: "Cliente" },
  };

  it("transitions from draft to confirmed", async () => {
    prismaMock.order.findUnique.mockResolvedValue(DRAFT_ORDER);
    prismaMock.order.update.mockResolvedValue({});
    prismaMock.orderItem.findMany.mockResolvedValue([]);
    prismaMock.stockWarehouse.findMany.mockResolvedValue([]);

    const result = await updateOrderStatus("ord-1", "confirmed");

    expect(result).toEqual({ ok: true });
    expect(prismaMock.order.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "ord-1", status: "draft" }, data: { status: "confirmed" } }),
    );
  });

  it("takes stock from whichever warehouse has it", async () => {
    prismaMock.order.findUnique.mockResolvedValue(DRAFT_ORDER);
    prismaMock.orderItem.findMany.mockResolvedValue([{ productId: "p1", variantId: null, qty: 5, nameSnap: "Remera" }]);
    prismaMock.stockItem.findMany.mockResolvedValue([
      { id: "s1", warehouseId: "w1", qty: 3 },
      { id: "s2", warehouseId: "w2", qty: 2 },
    ]);
    prismaMock.stockItem.updateMany.mockResolvedValue({ count: 1 });

    expect(await updateOrderStatus("ord-1", "confirmed")).toEqual({ ok: true });
    expect(prismaMock.stockMovement.create).toHaveBeenCalledTimes(2);
  });

  it("refuses to confirm without enough stock", async () => {
    prismaMock.order.findUnique.mockResolvedValue(DRAFT_ORDER);
    prismaMock.orderItem.findMany.mockResolvedValue([{ productId: "p1", variantId: null, qty: 5, nameSnap: "Remera" }]);
    prismaMock.stockItem.findMany.mockResolvedValue([{ id: "s1", warehouseId: "w1", qty: 3 }]);
    prismaMock.stockItem.updateMany.mockResolvedValue({ count: 1 });

    expect(await updateOrderStatus("ord-1", "confirmed")).toEqual({ ok: false, error: "Stock insuficiente de Remera" });
  });

  it("still sells a product nobody tracks in stock", async () => {
    prismaMock.order.findUnique.mockResolvedValue(DRAFT_ORDER);
    prismaMock.orderItem.findMany.mockResolvedValue([{ productId: "p1", variantId: null, qty: 5, nameSnap: "Remera" }]);

    expect(await updateOrderStatus("ord-1", "confirmed")).toEqual({ ok: true });
  });

  it("gives stock back when a confirmed order is cancelled", async () => {
    prismaMock.order.findUnique.mockResolvedValue({ ...DRAFT_ORDER, status: "confirmed" });
    prismaMock.stockMovement.findMany.mockResolvedValue([
      { warehouseId: "w1", productId: "p1", variantId: null, delta: -3 },
    ]);

    const result = await updateOrderStatus("ord-1", "cancelled");

    expect(result).toEqual({ ok: true });
    expect(prismaMock.stockItem.updateMany).toHaveBeenCalledWith({
      where: { warehouseId: "w1", productId: "p1", variantId: null },
      data:  { qty: { increment: 3 } },
    });
  });

  it("transitions from draft to cancelled", async () => {
    prismaMock.order.findUnique.mockResolvedValue(DRAFT_ORDER);
    prismaMock.order.update.mockResolvedValue({});

    const result = await updateOrderStatus("ord-1", "cancelled");
    expect(result).toEqual({ ok: true });
  });

  it("returns error for invalid transition", async () => {
    prismaMock.order.findUnique.mockResolvedValue({ ...DRAFT_ORDER, status: "delivered" });
    const result = await updateOrderStatus("ord-1", "cancelled");
    expect(result).toEqual({ ok: false, error: expect.stringContaining("No se puede cambiar") });
  });

  it("returns error when order is not found", async () => {
    prismaMock.order.findUnique.mockResolvedValue(null);
    const result = await updateOrderStatus("missing", "confirmed");
    expect(result).toEqual({ ok: false, error: "Pedido no encontrado" });
  });

  it("returns error when order belongs to a different tenant", async () => {
    prismaMock.order.findUnique.mockResolvedValue({ ...DRAFT_ORDER, tenantId: "other" });
    const result = await updateOrderStatus("ord-1", "confirmed");
    expect(result).toEqual({ ok: false, error: "Pedido no encontrado" });
  });

  it("sends status update email for 'confirmed' transition", async () => {
    prismaMock.order.findUnique.mockResolvedValue(DRAFT_ORDER);
    prismaMock.order.update.mockResolvedValue({});
    prismaMock.orderItem.findMany.mockResolvedValue([]);
    prismaMock.stockWarehouse.findMany.mockResolvedValue([]);

    await updateOrderStatus("ord-1", "confirmed");

    expect(emailMock.sendOrderStatusUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: "confirmed", to: "client@example.com" }),
    );
  });

  it("does not send email for 'cancelled' transition", async () => {
    prismaMock.order.findUnique.mockResolvedValue(DRAFT_ORDER);
    prismaMock.order.update.mockResolvedValue({});

    await updateOrderStatus("ord-1", "cancelled");
    expect(emailMock.sendOrderStatusUpdate).not.toHaveBeenCalled();
  });

  it("sends email for shipped status", async () => {
    const shippingOrder = {
      ...DRAFT_ORDER,
      status: "processing",
      client: { email: "x@y.com", name: "X" },
    };
    prismaMock.order.findUnique.mockResolvedValue(shippingOrder);
    prismaMock.order.update.mockResolvedValue({});

    await updateOrderStatus("ord-1", "shipped");
    expect(emailMock.sendOrderStatusUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: "shipped" }),
    );
  });

  it("decrements stock when transitioning to confirmed and warehouse exists", async () => {
    prismaMock.order.findUnique.mockResolvedValue(DRAFT_ORDER);
    prismaMock.order.update.mockResolvedValue({});
    prismaMock.orderItem.findMany.mockResolvedValue([
      { productId: "prod-1", variantId: null, qty: 2 },
    ]);
    prismaMock.stockWarehouse.findMany.mockResolvedValue([{ id: "wh-1" }]);
    prismaMock.stockItem.findFirst.mockResolvedValue({ id: "si-1", qty: 10 });
    prismaMock.stockItem.update.mockResolvedValue({});
    prismaMock.stockMovement.create.mockResolvedValue({});
    prismaMock.$transaction.mockResolvedValue([]);

    await updateOrderStatus("ord-1", "confirmed");
    expect(prismaMock.$transaction).toHaveBeenCalled();
  });
});

// ── registerPayment ───────────────────────────────────────────────────────────

describe("registerPayment", () => {
  const ORDER = { id: "ord-1", tenantId: TENANT };

  it("registers a payment and returns ok: true", async () => {
    prismaMock.order.findUnique.mockResolvedValue(ORDER);
    prismaMock.payment.create.mockResolvedValue({ id: "pay-1" });

    const fd = makeFormData({ amount: "500", method: "efectivo" });
    const result = await registerPayment("ord-1", fd);

    expect(result).toEqual({ ok: true });
    expect(prismaMock.payment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ orderId: "ord-1", amount: 500, currency: "ARS" }),
      }),
    );
  });

  it("returns error when order is not found", async () => {
    prismaMock.order.findUnique.mockResolvedValue(null);
    const fd = makeFormData({ amount: "100", method: "efectivo" });
    const result = await registerPayment("missing", fd);
    expect(result).toEqual({ ok: false, error: "Pedido no encontrado" });
  });

  it("returns error when amount is 0", async () => {
    prismaMock.order.findUnique.mockResolvedValue(ORDER);
    const fd = makeFormData({ amount: "0", method: "efectivo" });
    const result = await registerPayment("ord-1", fd);
    expect(result).toEqual({ ok: false, error: "Monto inválido" });
  });

  it("returns error when amount is negative", async () => {
    prismaMock.order.findUnique.mockResolvedValue(ORDER);
    const fd = makeFormData({ amount: "-100", method: "efectivo" });
    const result = await registerPayment("ord-1", fd);
    expect(result).toEqual({ ok: false, error: "Monto inválido" });
  });

  it("returns error when method is missing", async () => {
    prismaMock.order.findUnique.mockResolvedValue(ORDER);
    const fd = makeFormData({ amount: "100", method: "" });
    const result = await registerPayment("ord-1", fd);
    expect(result).toEqual({ ok: false, error: "Método de pago requerido" });
  });

  it("returns error when order belongs to a different tenant", async () => {
    prismaMock.order.findUnique.mockResolvedValue({ id: "ord-1", tenantId: "other" });
    const fd = makeFormData({ amount: "100", method: "efectivo" });
    const result = await registerPayment("ord-1", fd);
    expect(result).toEqual({ ok: false, error: "Pedido no encontrado" });
  });
});
