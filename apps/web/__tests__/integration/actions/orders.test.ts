import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeAuthUser, makeFormData } from "../../helpers/mock-factories";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const sessionMock = vi.hoisted(() => ({ requireAuth: vi.fn() }));

const prismaMock = vi.hoisted(() => ({
  order: {
    findUnique: vi.fn(),
    create:     vi.fn(),
    update:     vi.fn(),
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
    findMany: vi.fn(),
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

const emailMock = vi.hoisted(() => ({
  sendOrderCreated:      vi.fn().mockResolvedValue(undefined),
  sendOrderStatusUpdate: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/session", () => sessionMock);
vi.mock("@/lib/prisma",  () => ({ prisma: prismaMock }));
vi.mock("@/lib/email",   () => emailMock);

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
  prismaMock.$transaction.mockImplementation(async (ops: unknown[]) => {
    for (const op of ops) await op;
  });
});

// ── createOrder ───────────────────────────────────────────────────────────────

describe("createOrder", () => {
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
    expect(prismaMock.order.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "ord-1" }, data: { status: "confirmed" } }),
    );
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

    const fd = makeFormData({ amount: "500", method: "cash" });
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
    const fd = makeFormData({ amount: "100", method: "cash" });
    const result = await registerPayment("missing", fd);
    expect(result).toEqual({ ok: false, error: "Pedido no encontrado" });
  });

  it("returns error when amount is 0", async () => {
    prismaMock.order.findUnique.mockResolvedValue(ORDER);
    const fd = makeFormData({ amount: "0", method: "cash" });
    const result = await registerPayment("ord-1", fd);
    expect(result).toEqual({ ok: false, error: "Monto inválido" });
  });

  it("returns error when amount is negative", async () => {
    prismaMock.order.findUnique.mockResolvedValue(ORDER);
    const fd = makeFormData({ amount: "-100", method: "cash" });
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
    const fd = makeFormData({ amount: "100", method: "cash" });
    const result = await registerPayment("ord-1", fd);
    expect(result).toEqual({ ok: false, error: "Pedido no encontrado" });
  });
});
