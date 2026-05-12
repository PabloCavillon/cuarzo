import { notFound, redirect } from "next/navigation";
import { requireAuth, apiError } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { OrderDetail } from "./OrderDetail";

type P = Promise<{ id: string }>;

export default async function OrderDetailPage({ params }: { params: P }) {
  let user;
  try {
    user = await requireAuth("staff");
  } catch (e) {
    void apiError(e);
    redirect("/login");
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where:   { id },
    include: {
      client:   true,
      items:    { orderBy: { id: "asc" } },
      payments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!order || order.tenantId !== user.tenantId) notFound();

  const paid = order.payments
    .filter((p) => p.status === "completed")
    .reduce((a, p) => a + Number(p.amount), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">Pedido</h2>
        <p className="text-sm text-white/40 mt-0.5 font-mono">{order.id.slice(0, 8).toUpperCase()}</p>
      </div>

      <OrderDetail
        order={{
          id:        order.id,
          status:    order.status,
          subtotal:  order.subtotal.toString(),
          discount:  order.discount.toString(),
          tax:       order.tax.toString(),
          total:     order.total.toString(),
          notes:     order.notes ?? null,
          createdAt: order.createdAt.toISOString(),
          client: {
            name:  order.client.name,
            email: order.client.email,
            phone: order.client.phone ?? null,
          },
          items: order.items.map((it) => ({
            id:        it.id,
            skuSnap:   it.skuSnap,
            nameSnap:  it.nameSnap,
            qty:       it.qty,
            unitPrice: it.unitPrice.toString(),
          })),
          payments: order.payments.map((p) => ({
            id:        p.id,
            amount:    p.amount.toString(),
            currency:  p.currency,
            method:    p.method,
            status:    p.status,
            createdAt: p.createdAt.toISOString(),
          })),
        }}
        paid={paid}
      />
    </div>
  );
}
