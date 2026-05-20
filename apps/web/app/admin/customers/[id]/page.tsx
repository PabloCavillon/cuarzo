import { notFound, redirect } from "next/navigation";
import { requireAuth, apiError } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { ClientDetailClient } from "./ClientDetailClient";

type P = Promise<{ id: string }>;

export default async function ClientDetailPage({ params }: { params: P }) {
  let user;
  try {
    user = await requireAuth("staff");
  } catch (e) {
    void apiError(e);
    redirect("/login");
  }

  const { id } = await params;
  const tid    = user.tenantId;

  const client = await prisma.client.findUnique({ where: { id } });
  if (!client || client.tenantId !== tid) notFound();

  const [orders, bookings] = await Promise.all([
    client.email
      ? prisma.order.findMany({
          where: {
            tenantId: tid,
            client:   { email: client.email.toLowerCase() },
          },
          include: { _count: { select: { items: true } } },
          orderBy: { createdAt: "desc" },
          take:    50,
        })
      : Promise.resolve([]),
    client.email
      ? prisma.turneraBooking.findMany({
          where:   { tenantId: tid, clientEmail: { equals: client.email, mode: "insensitive" } },
          orderBy: [{ date: "desc" }, { time: "desc" }],
          take:    50,
          select:  { id: true, code: true, serviceNameSnap: true, date: true, time: true, status: true, priceSnap: true },
        })
      : Promise.resolve([]),
  ]);

  const orderRevenue = orders
    .filter((o) => !["cancelled", "refunded"].includes(o.status))
    .reduce((a, o) => a + Number(o.total.toString()), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <ClientDetailClient
        client={{
          id:        client.id,
          name:      client.name,
          email:     client.email ?? null,
          phone:     client.phone ?? null,
          address:   client.address ?? null,
          notes:     client.notes ?? null,
          active:    client.active,
          createdAt: client.createdAt.toISOString(),
        }}
        orders={orders.map((o) => ({
          id:        o.id,
          status:    o.status,
          total:     o.total.toString(),
          itemCount: o._count.items,
          createdAt: o.createdAt.toISOString(),
        }))}
        bookings={bookings.map((b) => ({
          id:             b.id,
          code:           b.code,
          serviceNameSnap: b.serviceNameSnap,
          date:           b.date,
          time:           b.time,
          status:         b.status,
          priceSnap:      b.priceSnap.toString(),
        }))}
        orderRevenue={orderRevenue}
      />
    </div>
  );
}
