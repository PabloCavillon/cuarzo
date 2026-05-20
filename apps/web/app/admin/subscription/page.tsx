import { redirect } from "next/navigation";
import { requireAuth, apiError } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { SubscriptionClient } from "./SubscriptionClient";
import { FREE_MODULE_MAX } from "@/lib/utils/module-catalog";

export default async function SubscriptionPage() {
  let user;
  try {
    user = await requireAuth("staff");
  } catch (e) {
    void apiError(e);
    redirect("/login");
  }

  const tid = user.tenantId;

  const [plans, sub] = await Promise.all([
    prisma.subscriptionPlan.findMany({
      where:   { active: true },
      orderBy: { priceUSD: "asc" },
    }),
    prisma.subscription.findUnique({
      where:   { tenantId: tid },
      include: { plan: true },
    }),
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">Suscripción</h2>
        <p className="text-sm text-white/40 mt-0.5">Administrá tu plan Cuarzo</p>
      </div>

      <SubscriptionClient
        plans={plans.map((p) => ({
          id:       p.id,
          slug:     p.slug,
          name:     p.name,
          priceUSD: p.priceUSD.toString(),
          features: p.slug === "free"
            ? [
                `Elegí ${FREE_MODULE_MAX} módulos: Bookings, Catálogo, Stock, Caja o Pedidos`,
                "1 usuario",
                "50 reservas/mes · 10 productos",
                "Sin límite de tiempo",
              ]
            : p.features as string[],
        }))}
        current={sub
          ? {
              status:           sub.status,
              planSlug:         sub.plan.slug,
              planName:         sub.plan.name,
              mpCheckoutUrl:    sub.mpCheckoutUrl,
              currentPeriodEnd: sub.currentPeriodEnd?.toISOString() ?? null,
              cancelledAt:      sub.cancelledAt?.toISOString() ?? null,
            }
          : null}
      />
    </div>
  );
}
