"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { createMPSubscription, cancelMPSubscription, createMPPlan } from "@/lib/api/mercadopago";

type ActionResult = { ok: true } | { ok: false; error: string };
type CheckoutResult = { ok: true; url: string } | { ok: false; error: string };

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function startSubscription(planSlug: string): Promise<CheckoutResult> {
  try {
    const user = await requireAuth("staff");
    const tid  = user.tenantId;

    const plan = await prisma.subscriptionPlan.findUnique({ where: { slug: planSlug } });
    if (!plan) return { ok: false, error: "Plan no encontrado" };
    if (Number(plan.priceUSD) === 0) {
      // Free plan: just upsert the subscription directly
      await prisma.subscription.upsert({
        where:  { tenantId: tid },
        create: { tenantId: tid, planId: plan.id, status: "authorized" },
        update: { planId: plan.id, status: "authorized", cancelledAt: null, mpSubId: null, mpCheckoutUrl: null },
      });
      revalidatePath("/admin/subscription");
      return { ok: true, url: "/admin/subscription" };
    }

    // Paid plan: ensure the plan exists in MP
    let mpPlanId = plan.mpPlanId;
    if (!mpPlanId) {
      const mpPlan = await createMPPlan({
        reason:    `Cuarzo ${plan.name}`,
        amountUSD: Number(plan.priceUSD),
        backUrl:   `${APP_URL}/admin/subscription`,
      });
      mpPlanId = mpPlan.id;
      await prisma.subscriptionPlan.update({ where: { id: plan.id }, data: { mpPlanId } });
    }

    const dbUser = await prisma.user.findFirst({ where: { tenantId: tid, role: "owner" } });
    const email  = dbUser?.email ?? "unknown@cuarzo.dev";

    const mpSub = await createMPSubscription({
      planMpId:  mpPlanId,
      payerEmail: email,
      backUrl:   `${APP_URL}/admin/subscription`,
    });

    await prisma.subscription.upsert({
      where:  { tenantId: tid },
      create: {
        tenantId:       tid,
        planId:         plan.id,
        status:         "pending",
        mpSubId:        mpSub.id,
        mpCheckoutUrl:  mpSub.checkoutUrl,
      },
      update: {
        planId:         plan.id,
        status:         "pending",
        mpSubId:        mpSub.id,
        mpCheckoutUrl:  mpSub.checkoutUrl,
        cancelledAt:    null,
      },
    });

    revalidatePath("/admin/subscription");
    return { ok: true, url: mpSub.checkoutUrl };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error inesperado" };
  }
}

export async function cancelSubscription(): Promise<ActionResult> {
  try {
    const user = await requireAuth("staff");
    const tid  = user.tenantId;

    const sub = await prisma.subscription.findUnique({ where: { tenantId: tid } });
    if (!sub) return { ok: false, error: "Sin suscripción activa" };

    if (sub.mpSubId) {
      await cancelMPSubscription(sub.mpSubId);
    }

    await prisma.subscription.update({
      where: { tenantId: tid },
      data:  { status: "cancelled", cancelledAt: new Date() },
    });

    revalidatePath("/admin/subscription");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error al cancelar" };
  }
}
