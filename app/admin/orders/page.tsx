import { redirect } from "next/navigation";
import { requireAuth, apiError } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { OrdersClient } from "./OrdersClient";

type SP = Promise<Record<string, string | undefined>>;

export default async function OrdersPage({ searchParams }: { searchParams: SP }) {
  let user;
  try {
    user = await requireAuth("staff");
  } catch (e) {
    void apiError(e);
    redirect("/login");
  }

  const sp     = await searchParams;
  const tid    = user.tenantId;
  const q      = sp.q?.trim() ?? "";
  const status = sp.status?.trim() ?? "";

  const orders = await prisma.order.findMany({
    where: {
      tenantId: tid,
      ...(status ? { status: status as never } : {}),
      ...(q ? {
        client: {
          OR: [
            { name:  { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        },
      } : {}),
    },
    include: {
      client: { select: { name: true, email: true } },
      _count:  { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">Pedidos</h2>
        <p className="text-sm text-white/40 mt-0.5">Gestión de órdenes de venta</p>
      </div>

      <OrdersClient
        orders={orders.map((o) => ({
          id:          o.id,
          status:      o.status,
          clientName:  o.client.name,
          clientEmail: o.client.email,
          total:       o.total.toString(),
          itemCount:   o._count.items,
          createdAt:   o.createdAt.toISOString(),
        }))}
        filters={{ q, status }}
      />
    </div>
  );
}
