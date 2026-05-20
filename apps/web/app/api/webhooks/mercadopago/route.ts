import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getMPSubscription } from "@/lib/api/mercadopago";

const MP_STATUS_MAP: Record<string, "pending" | "authorized" | "paused" | "cancelled" | "expired"> = {
  pending:    "pending",
  authorized: "authorized",
  paused:     "paused",
  cancelled:  "cancelled",
  ended:      "expired",
};

// Verifies the X-Signature header sent by Mercado Pago.
// Format: "ts=<epoch>,v1=<hmac_sha256>"
// Signed string: "id:<data.id>;request-id:<x-request-id>;ts:<ts>"
function verifyMPSignature(req: NextRequest, rawBody: string, dataId: string): boolean {
  const secret    = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return true; // secret not configured — skip (log only)

  const sigHeader = req.headers.get("x-signature") ?? "";
  const requestId = req.headers.get("x-request-id") ?? "";

  const ts = sigHeader.match(/ts=(\d+)/)?.[1];
  const v1 = sigHeader.match(/v1=([a-f0-9]+)/)?.[1];
  if (!ts || !v1) return false;

  const template = `id:${dataId};request-id:${requestId};ts:${ts}`;
  const expected = crypto.createHmac("sha256", secret).update(template).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(v1, "hex"), Buffer.from(expected, "hex"));
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const body    = JSON.parse(rawBody) as { type?: string; data?: { id?: string } };

    if (body.type !== "subscription_preapproval" || !body.data?.id) {
      return NextResponse.json({ ok: true });
    }

    const mpSubId = body.data.id;

    if (!verifyMPSignature(req, rawBody, mpSubId)) {
      console.warn("MP webhook: invalid signature for sub", mpSubId);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const mpSub = await getMPSubscription(mpSubId).catch((err: unknown) => {
      console.error("MP webhook: failed to fetch subscription", mpSubId, err);
      throw err;
    });

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
