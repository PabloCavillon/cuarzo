"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { sendOrderCreated, sendOrderStatusUpdate } from "@/lib/integrations/email";

type ActionResult = { ok: true } | { ok: false; error: string };
type CreateResult = { ok: true; id: string } | { ok: false; error: string };

// ─── Create order ─────────────────────────────────────────────────────────────

export async function createOrder(fd: FormData): Promise<CreateResult> {
  try {
    const user = await requireAuth("staff");
    const tid  = user.tenantId;

    const clientName  = (fd.get("clientName") as string)?.trim();
    const clientEmail = (fd.get("clientEmail") as string)?.trim().toLowerCase();
    const clientPhone = (fd.get("clientPhone") as string)?.trim() || null;
    const notes       = (fd.get("notes") as string)?.trim() || null;
    const itemsJson   = fd.get("items") as string;

    if (!clientName || !clientEmail) return { ok: false, error: "Nombre y email del cliente son requeridos" };

    type ItemInput = { productId: string; variantId: string | null; skuSnap: string; nameSnap: string; qty: number; unitPrice: number };
    let items: ItemInput[] = [];
    try { items = JSON.parse(itemsJson) as ItemInput[]; } catch { return { ok: false, error: "Items inválidos" }; }
    if (!items.length) return { ok: false, error: "El pedido debe tener al menos un producto" };

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

    void sendOrderCreated({
      to:      clientEmail,
      name:    clientName,
      orderId: order.id,
      items:   items.map((it) => ({ nameSnap: it.nameSnap, skuSnap: it.skuSnap, qty: it.qty, unitPrice: it.unitPrice })),
      total,
    });

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

    await prisma.order.update({ where: { id }, data: { status: status as never } });

    // On confirm → create stock movements (sale) — single transaction, no N+1
    if (status === "confirmed") {
      const [items, warehouses] = await Promise.all([
        prisma.orderItem.findMany({ where: { orderId: id } }),
        prisma.stockWarehouse.findMany({
          where: { tenantId: tid, active: true },
          take: 1,
          orderBy: { name: "asc" },
        }),
      ]);
      const warehouseId = warehouses[0]?.id;

      if (warehouseId && items.length) {
        // Batch-load all relevant stock items in one query
        const stockItems = await prisma.stockItem.findMany({
          where: {
            warehouseId,
            OR: items.map((it) => ({
              productId: it.productId,
              variantId: it.variantId ?? null,
            })),
          },
        });
        const stockMap = new Map(
          stockItems.map((s) => [`${s.productId}:${s.variantId ?? ""}`, s])
        );

        // One atomic transaction for all movements + stock updates
        await prisma.$transaction(
          items.flatMap((item) => {
            const key     = `${item.productId}:${item.variantId ?? ""}`;
            const current = stockMap.get(key);
            const newQty  = Math.max(0, (current?.qty ?? 0) - item.qty);

            return [
              prisma.stockMovement.create({
                data: {
                  tenantId:      tid,
                  productId:     item.productId,
                  variantId:     item.variantId,
                  warehouseId,
                  delta:         -item.qty,
                  reason:        "sale",
                  referenceId:   id,
                  referenceType: "order",
                },
              }),
              current
                ? prisma.stockItem.update({ where: { id: current.id }, data: { qty: newQty } })
                : prisma.stockItem.create({
                    data: { tenantId: tid, productId: item.productId, variantId: item.variantId, warehouseId, qty: 0 },
                  }),
            ];
          })
        );
      }
    }

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);

    const EMAIL_NOTIFY = ["confirmed", "processing", "shipped", "delivered"];
    if (EMAIL_NOTIFY.includes(status)) {
      void sendOrderStatusUpdate({
        to:      order.client.email,
        name:    order.client.name,
        orderId: id,
        status,
        total:   Number(order.total.toString()),
      });
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

    if (!amount || amount <= 0 || amount > 999_999_999.99) return { ok: false, error: "Monto inválido" };
    if (!method) return { ok: false, error: "Método de pago requerido" };

    await prisma.$transaction([
      prisma.payment.create({
        data: {
          tenantId: tid,
          orderId,
          amount,
          currency: "ARS",
          method:   method as never,
          status:   "completed",
        },
      }),
    ]);

    revalidatePath(`/admin/orders/${orderId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error inesperado" };
  }
}
