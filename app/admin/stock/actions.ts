"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { sendLowStockAlert } from "@/lib/email";

type ActionResult = { ok: true } | { ok: false; error: string };

const VALID_REASONS = [
  "adjustment", "purchase", "sale",
  "return_customer", "return_supplier", "damage", "initial",
] as const;
type MovementReason = typeof VALID_REASONS[number];

export async function adjustStock(formData: FormData): Promise<ActionResult> {
  let user;
  try { user = await requireAuth("staff"); } catch { return { ok: false, error: "No autorizado." }; }

  const productId   = String(formData.get("productId")   ?? "").trim();
  const warehouseId = String(formData.get("warehouseId") ?? "").trim();
  const newQtyRaw   = String(formData.get("newQty")      ?? "");
  const reasonRaw   = String(formData.get("reason")      ?? "adjustment");
  const notes       = String(formData.get("notes")       ?? "").trim() || null;

  const newQty = parseInt(newQtyRaw, 10);
  if (!productId)                    return { ok: false, error: "Producto requerido." };
  if (!warehouseId)                  return { ok: false, error: "Depósito requerido." };
  if (isNaN(newQty) || newQty < 0)  return { ok: false, error: "La cantidad debe ser ≥ 0." };

  const reason: MovementReason = VALID_REASONS.includes(reasonRaw as MovementReason)
    ? (reasonRaw as MovementReason)
    : "adjustment";

  // Verify ownership
  const [product, warehouse] = await Promise.all([
    prisma.catalogProduct.findUnique({ where: { id: productId }, select: { tenantId: true } }),
    prisma.stockWarehouse.findUnique({ where: { id: warehouseId }, select: { tenantId: true } }),
  ]);
  if (!product  || product.tenantId  !== user.tenantId) return { ok: false, error: "Producto no encontrado." };
  if (!warehouse || warehouse.tenantId !== user.tenantId) return { ok: false, error: "Depósito no encontrado." };

  // Get current qty then write atomically
  const current = await prisma.stockItem.findFirst({
    where: { tenantId: user.tenantId, productId, variantId: null, warehouseId },
  });
  const currentQty = current?.qty ?? 0;
  const delta = newQty - currentQty;

  if (delta === 0) return { ok: true };

  try {
    await prisma.$transaction([
      prisma.stockMovement.create({
        data: {
          tenantId: user.tenantId,
          productId,
          warehouseId,
          delta,
          reason,
          notes,
        },
      }),
      current
        ? prisma.stockItem.update({ where: { id: current.id }, data: { qty: newQty } })
        : prisma.stockItem.create({
            data: { tenantId: user.tenantId, productId, warehouseId, qty: newQty },
          }),
    ]);
    revalidatePath("/admin/stock");
    revalidatePath("/admin/stock/movements");

    // Low stock alert — fire-and-forget when new qty falls below minStock
    if (current && newQty > 0) {
      const item = await prisma.stockItem.findFirst({
        where:   { tenantId: user.tenantId, productId, warehouseId },
        include: { product: true, warehouse: true },
      });
      if (item && item.minStock > 0 && newQty <= item.minStock) {
        const owner = await prisma.user.findFirst({
          where:  { tenantId: user.tenantId, role: "owner" },
          select: { email: true },
        });
        const tenant = await prisma.tenant.findUnique({
          where:  { id: user.tenantId },
          select: { name: true },
        });
        if (owner && tenant) {
          void sendLowStockAlert({
            to:         owner.email,
            tenantName: tenant.name,
            products:   [{
              name:      item.product.name,
              sku:       item.product.sku,
              qty:       newQty,
              minStock:  item.minStock,
              warehouse: item.warehouse.name,
            }],
          });
        }
      }
    }

    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
