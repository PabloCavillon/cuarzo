"use server";

import { revalidatePath } from "next/cache";
import { PaymentMethod } from "@/prisma/generated/client";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { hasModule } from "@/lib/utils/plan-limits";
import { inBackground } from "@/lib/integrations/background";
import { sendOrderCreated, sendOrderStatusUpdate } from "@/lib/integrations/email";

type ActionResult = { ok: true } | { ok: false; error: string };
type CreateResult = { ok: true; id: string } | { ok: false; error: string };

// ─── Create order ─────────────────────────────────────────────────────────────

export async function createOrder(fd: FormData): Promise<CreateResult> {
  try {
    const user = await requireAuth("staff");
    const tid  = user.tenantId;

    if (!(await hasModule(tid, "orders"))) return { ok: false, error: "Módulo no disponible en tu plan." };

    const clientName  = (fd.get("clientName") as string)?.trim();
    const clientEmail = (fd.get("clientEmail") as string)?.trim().toLowerCase();
    const clientPhone = (fd.get("clientPhone") as string)?.trim() || null;
    const notes       = (fd.get("notes") as string)?.trim() || null;
    const itemsJson   = fd.get("items") as string;

    if (!clientName || !clientEmail) return { ok: false, error: "Nombre y email del cliente son requeridos" };

    type ItemInput = { productId: string; variantId: string | null; qty: number; unitPrice: number };
    let lines: ItemInput[] = [];
    try { lines = JSON.parse(itemsJson) as ItemInput[]; } catch { return { ok: false, error: "Items inválidos" }; }
    if (!lines.length) return { ok: false, error: "El pedido debe tener al menos un producto" };

    // Name and SKU come from the catalog; the price stays editable because the form allows it.
    const products = await prisma.catalogProduct.findMany({
      where:   { id: { in: lines.map((l) => l.productId) }, tenantId: tid },
      include: { variants: true },
    });
    const items: (ItemInput & { skuSnap: string; nameSnap: string })[] = [];
    for (const line of lines) {
      const product = products.find((p) => p.id === line.productId);
      const variant = product?.variants.find((v) => v.id === line.variantId);
      if (!product || (line.variantId && !variant)) return { ok: false, error: "Producto no encontrado" };
      if (!Number.isInteger(line.qty) || line.qty < 1) return { ok: false, error: "Cantidad inválida" };
      if (!Number.isFinite(line.unitPrice) || line.unitPrice < 0) return { ok: false, error: "Precio inválido" };
      items.push({
        productId: product.id,
        variantId: variant?.id ?? null,
        skuSnap:   variant?.sku ?? product.sku,
        nameSnap:  variant ? `${product.name} · ${variant.name}` : product.name,
        qty:       line.qty,
        unitPrice: line.unitPrice,
      });
    }

    // Upsert order client
    const orderClient = await prisma.orderClient.upsert({
      where:  { tenantId_email: { tenantId: tid, email: clientEmail } },
      create: { tenantId: tid, email: clientEmail, name: clientName, phone: clientPhone },
      update: { name: clientName, phone: clientPhone },
    });

    const subtotal = items.reduce((acc, it) => acc + it.qty * it.unitPrice, 0);
    const total    = subtotal;

    const order = await prisma.order.create({
      data: {
        tenantId: tid,
        clientId: orderClient.id,
        status:   "draft",
        subtotal,
        discount: 0,
        tax:      0,
        total,
        notes,
        items: {
          create: items.map((it) => ({
            productId: it.productId,
            variantId: it.variantId ?? null,
            skuSnap:   it.skuSnap,
            nameSnap:  it.nameSnap,
            qty:       it.qty,
            unitPrice: it.unitPrice,
          })),
        },
      },
    });

    revalidatePath("/admin/orders");

    inBackground(() => sendOrderCreated({
      to:      clientEmail,
      name:    clientName,
      orderId: order.id,
      items:   items.map((it) => ({ nameSnap: it.nameSnap, skuSnap: it.skuSnap, qty: it.qty, unitPrice: it.unitPrice })),
      total,
    }));

    return { ok: true, id: order.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error inesperado" };
  }
}

// ─── Update status ─────────────────────────────────────────────────────────────

const VALID_TRANSITIONS: Record<string, string[]> = {
  draft:      ["confirmed", "cancelled"],
  confirmed:  ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped:    ["delivered"],
  delivered:  [],
  cancelled:  [],
  refunded:   [],
};

export async function updateOrderStatus(id: string, status: string): Promise<ActionResult> {
  try {
    const user = await requireAuth("staff");
    const tid  = user.tenantId;

    const order = await prisma.order.findUnique({
      where:   { id },
      include: { client: { select: { email: true, name: true } } },
    });
    if (!order || order.tenantId !== tid) return { ok: false, error: "Pedido no encontrado" };

    const allowed = VALID_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(status)) {
      return { ok: false, error: `No se puede cambiar de ${order.status} a ${status}` };
    }

    await prisma.$transaction(async (tx) => {
      // Guarded on the old status so two clicks cannot apply the stock change twice.
      const moved = await tx.order.updateMany({
        where: { id, status: order.status },
        data:  { status: status as never },
      });
      if (moved.count === 0) throw new Error("El pedido cambió de estado. Recargá la página.");

      if (status === "confirmed") {
        const items = await tx.orderItem.findMany({ where: { orderId: id } });

        for (const item of items) {
          const rows = await tx.stockItem.findMany({
            where:   { tenantId: tid, productId: item.productId, variantId: item.variantId ?? null, warehouse: { active: true } },
            orderBy: { qty: "desc" },
          });
          // Products nobody tracks in stock can still be sold.
          if (rows.length === 0) continue;

          let left = item.qty;
          for (const row of rows) {
            const taken = Math.min(row.qty, left);
            if (taken === 0) continue;
            // Guarded so a concurrent order cannot push the quantity below zero.
            const moved = await tx.stockItem.updateMany({
              where: { id: row.id, qty: { gte: taken } },
              data:  { qty: { decrement: taken } },
            });
            if (moved.count === 0) throw new Error(`Stock insuficiente de ${item.nameSnap}`);
            await tx.stockMovement.create({
              data: {
                tenantId:      tid,
                productId:     item.productId,
                variantId:     item.variantId,
                warehouseId:   row.warehouseId,
                delta:         -taken,
                reason:        "sale",
                referenceId:   id,
                referenceType: "order",
              },
            });
            left -= taken;
          }
          if (left > 0) throw new Error(`Stock insuficiente de ${item.nameSnap}`);
        }
      }

      if (status === "cancelled") {
        const sold = await tx.stockMovement.findMany({
          where: { tenantId: tid, referenceId: id, referenceType: "order", reason: "sale" },
        });
        for (const m of sold) {
          if (m.delta === 0) continue;
          await tx.stockItem.updateMany({
            where: { warehouseId: m.warehouseId, productId: m.productId, variantId: m.variantId ?? null },
            data:  { qty: { increment: -m.delta } },
          });
          await tx.stockMovement.create({
            data: {
              tenantId:      tid,
              productId:     m.productId,
              variantId:     m.variantId,
              warehouseId:   m.warehouseId,
              delta:         -m.delta,
              reason:        "adjustment",
              referenceId:   id,
              referenceType: "order",
            },
          });
        }
      }
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);

    const EMAIL_NOTIFY = ["confirmed", "processing", "shipped", "delivered"];
    if (EMAIL_NOTIFY.includes(status)) {
      inBackground(() => sendOrderStatusUpdate({
        to:      order.client.email,
        name:    order.client.name,
        orderId: id,
        status,
        total:   Number(order.total.toString()),
      }));
    }

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error inesperado" };
  }
}

// ─── Register payment ──────────────────────────────────────────────────────────

export async function registerPayment(orderId: string, fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireAuth("staff");
    const tid  = user.tenantId;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.tenantId !== tid) return { ok: false, error: "Pedido no encontrado" };

    const amount = parseFloat(fd.get("amount") as string);
    const method = (fd.get("method") as string)?.trim();

    if (order.status === "cancelled") return { ok: false, error: "El pedido está cancelado" };
    if (!amount || amount <= 0 || amount > 999_999_999.99) return { ok: false, error: "Monto inválido" };
    if (!method) return { ok: false, error: "Método de pago requerido" };
    if (!(method in PaymentMethod)) return { ok: false, error: "Método de pago inválido" };

    await prisma.payment.create({
      data: {
        tenantId: tid,
        orderId,
        amount,
        currency: "ARS",
        method:   method as PaymentMethod,
        status:   "completed",
      },
    });

    revalidatePath(`/admin/orders/${orderId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error inesperado" };
  }
}
