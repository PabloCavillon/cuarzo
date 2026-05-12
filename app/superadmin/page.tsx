import { prisma } from "@/lib/prisma";
import { SuperAdminClient } from "./SuperAdminClient";

export const metadata = { title: "Super Admin — Cuarzo" };

export default async function SuperAdminPage() {
  const [tenants, totals] = await Promise.all([
    prisma.tenant.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { users: true, turneraBookings: true, orders: true } },
        subscription: { include: { plan: true } },
      },
    }),
    prisma.$transaction([
      prisma.tenant.count(),
      prisma.user.count(),
      prisma.turneraBooking.count(),
    ]),
  ]);

  const [tenantCount, userCount, bookingCount] = totals;

  return (
    <SuperAdminClient
      tenants={tenants.map((t) => ({
        id:          t.id,
        name:        t.name,
        slug:        t.slug,
        plan:        t.plan,
        active:      t.active,
        onboarded:   t.onboarded,
        createdAt:   t.createdAt.toISOString(),
        userCount:   t._count.users,
        bookings:    t._count.turneraBookings,
        orders:      t._count.orders,
        subStatus:   t.subscription?.status ?? null,
        subPlan:     t.subscription?.plan.name ?? null,
      }))}
      stats={{ tenantCount, userCount, bookingCount }}
    />
  );
}
