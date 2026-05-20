import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeAuthUser, makeFormData } from "../../helpers/mock-factories";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const sessionMock = vi.hoisted(() => ({ requireAuth: vi.fn() }));

const prismaMock = vi.hoisted(() => ({
  catalogProduct: {
    findUnique: vi.fn(),
    create:     vi.fn(),
    update:     vi.fn(),
  },
}));

vi.mock("@/lib/session", () => sessionMock);
vi.mock("@/lib/prisma",  () => ({ prisma: prismaMock }));

// ── Imports ───────────────────────────────────────────────────────────────────

import { createProduct, updateProduct, toggleProduct } from "@/app/admin/catalog/actions";

// ── Setup ─────────────────────────────────────────────────────────────────────

const TENANT = "tenant-1";
const USER   = makeAuthUser({ tenantId: TENANT });

beforeEach(() => {
  vi.resetAllMocks();
  sessionMock.requireAuth.mockResolvedValue(USER);
});

// ── createProduct ─────────────────────────────────────────────────────────────

describe("createProduct", () => {
  it("creates a product and returns ok: true", async () => {
    prismaMock.catalogProduct.create.mockResolvedValue({ id: "prod-1" });

    const fd = makeFormData({ name: "Remera", sku: "rem-001", basePrice: "1500" });
    const result = await createProduct(fd);

    expect(result).toEqual({ ok: true });
    expect(prismaMock.catalogProduct.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: "Remera", sku: "REM-001", tenantId: TENANT }),
      }),
    );
  });

  it("uppercases the SKU", async () => {
    prismaMock.catalogProduct.create.mockResolvedValue({ id: "prod-2" });
    const fd = makeFormData({ name: "X", sku: "abc-123", basePrice: "0" });
    await createProduct(fd);

    const callData = prismaMock.catalogProduct.create.mock.calls[0][0].data;
    expect(callData.sku).toBe("ABC-123");
  });

  it("returns error when name is missing", async () => {
    const fd = makeFormData({ name: "", sku: "SKU", basePrice: "100" });
    const result = await createProduct(fd);
    expect(result).toEqual({ ok: false, error: "El nombre es requerido." });
    expect(prismaMock.catalogProduct.create).not.toHaveBeenCalled();
  });

  it("returns error when SKU is missing", async () => {
    const fd = makeFormData({ name: "X", sku: "", basePrice: "100" });
    const result = await createProduct(fd);
    expect(result).toEqual({ ok: false, error: "El SKU es requerido." });
  });

  it("returns error when basePrice is negative", async () => {
    const fd = makeFormData({ name: "X", sku: "SKU", basePrice: "-1" });
    const result = await createProduct(fd);
    expect(result).toEqual({ ok: false, error: "El precio no es válido." });
  });

  it("allows basePrice of 0 (free product)", async () => {
    prismaMock.catalogProduct.create.mockResolvedValue({ id: "prod-3" });
    const fd = makeFormData({ name: "Gratis", sku: "FREE", basePrice: "0" });
    const result = await createProduct(fd);
    expect(result).toEqual({ ok: true });
  });

  it("returns specific error for Prisma P2002 (duplicate SKU)", async () => {
    prismaMock.catalogProduct.create.mockRejectedValue({ code: "P2002" });
    const fd = makeFormData({ name: "X", sku: "DUP", basePrice: "100" });
    const result = await createProduct(fd);
    expect(result).toEqual({ ok: false, error: "El SKU ya existe para este tenant." });
  });

  it("returns error when unauthenticated", async () => {
    sessionMock.requireAuth.mockRejectedValue(new Error("No autorizado."));
    const fd = makeFormData({ name: "X", sku: "Y", basePrice: "1" });
    const result = await createProduct(fd);
    expect(result).toEqual({ ok: false, error: "No autorizado." });
  });

  it("stores categoryId when provided", async () => {
    prismaMock.catalogProduct.create.mockResolvedValue({ id: "prod-4" });
    const fd = makeFormData({ name: "X", sku: "SKU2", basePrice: "100", categoryId: "cat-1" });
    await createProduct(fd);

    const callData = prismaMock.catalogProduct.create.mock.calls[0][0].data;
    expect(callData.categoryId).toBe("cat-1");
  });
});

// ── updateProduct ─────────────────────────────────────────────────────────────

describe("updateProduct", () => {
  const EXISTING = { id: "prod-1", tenantId: TENANT };

  it("updates a product when found in the same tenant", async () => {
    prismaMock.catalogProduct.findUnique.mockResolvedValue(EXISTING);
    prismaMock.catalogProduct.update.mockResolvedValue({});

    const fd = makeFormData({ name: "Updated", sku: "UPD-001", basePrice: "2000" });
    const result = await updateProduct("prod-1", fd);

    expect(result).toEqual({ ok: true });
    expect(prismaMock.catalogProduct.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "prod-1" } }),
    );
  });

  it("returns error when product is not found", async () => {
    prismaMock.catalogProduct.findUnique.mockResolvedValue(null);
    const fd = makeFormData({ name: "X", sku: "Y", basePrice: "1" });
    const result = await updateProduct("missing", fd);
    expect(result).toEqual({ ok: false, error: "Producto no encontrado." });
  });

  it("returns error when product belongs to a different tenant", async () => {
    prismaMock.catalogProduct.findUnique.mockResolvedValue({ id: "prod-1", tenantId: "other" });
    const fd = makeFormData({ name: "X", sku: "Y", basePrice: "1" });
    const result = await updateProduct("prod-1", fd);
    expect(result).toEqual({ ok: false, error: "Producto no encontrado." });
  });

  it("returns specific error for duplicate SKU on update", async () => {
    prismaMock.catalogProduct.findUnique.mockResolvedValue(EXISTING);
    prismaMock.catalogProduct.update.mockRejectedValue({ code: "P2002" });

    const fd = makeFormData({ name: "X", sku: "DUP", basePrice: "100" });
    const result = await updateProduct("prod-1", fd);
    expect(result).toEqual({ ok: false, error: "El SKU ya existe para este tenant." });
  });
});

// ── toggleProduct ─────────────────────────────────────────────────────────────

describe("toggleProduct", () => {
  const EXISTING = { id: "prod-1", tenantId: TENANT, active: true };

  it("deactivates a product", async () => {
    prismaMock.catalogProduct.findUnique.mockResolvedValue(EXISTING);
    prismaMock.catalogProduct.update.mockResolvedValue({});

    const result = await toggleProduct("prod-1", false);

    expect(result).toEqual({ ok: true });
    expect(prismaMock.catalogProduct.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { active: false } }),
    );
  });

  it("activates a product", async () => {
    prismaMock.catalogProduct.findUnique.mockResolvedValue({ ...EXISTING, active: false });
    prismaMock.catalogProduct.update.mockResolvedValue({});

    const result = await toggleProduct("prod-1", true);
    expect(result).toEqual({ ok: true });
  });

  it("returns error when product is not found", async () => {
    prismaMock.catalogProduct.findUnique.mockResolvedValue(null);
    const result = await toggleProduct("missing", false);
    expect(result).toEqual({ ok: false, error: "Producto no encontrado." });
  });

  it("returns error when product belongs to a different tenant", async () => {
    prismaMock.catalogProduct.findUnique.mockResolvedValue({ id: "prod-1", tenantId: "other" });
    const result = await toggleProduct("prod-1", false);
    expect(result).toEqual({ ok: false, error: "Producto no encontrado." });
  });
});
