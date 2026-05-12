import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMPSubscription } from "@/lib/mercadopago";

const MP_STATUS_MAP: Record<string, "pending" | "authorized" | "paused" | "cancelled" | "expired"> = {
  pending:    "pending",
  authorized: "authorized",
  paused:     "paused",
  cancelled:  "cancelled",
  ended:      "expired",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { type?: string; data?: { id?: string } };

    if (body.type !== "subscription_preapproval" || !body.data?.id) {
      return NextResponse.json({ ok: true });
    }

    const mpSubId = body.data.id;
    const mpSub   = await getMPSubscription(mpSubId);

    const sub = await prisma.subscription.findFirst({ where: { mpSubId } });
    if (!sub) return NextResponse.json({ ok: true });

    const status = MP_STATUS_MAP[mpSub.status ?? ""] ?? "pending";

    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status,
        mpPayerId:          String(mpSub.payer_id ?? ""),
        currentPeriodStart: mpSub.date_created ? new Date(mpSub.date_created) : undefined,
        currentPeriodEnd:   mpSub.next_payment_date ? new Date(mpSub.next_payment_date) : undefined,
        ...(status === "cancelled" ? { cancelledAt: new Date() } : {}),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("MP webhook error:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
