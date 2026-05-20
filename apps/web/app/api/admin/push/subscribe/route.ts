import { NextRequest, NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  let user;
  try { user = await requireAuth("staff"); } catch (e) {
    return apiError(e);
  }

  let body: { endpoint: string; keys: { p256dh: string; auth: string } };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const { endpoint, keys } = body;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: "Suscripción inválida." }, { status: 400 });
  }

  await prisma.pushSubscription.upsert({
    where:  { endpoint },
    update: { p256dh: keys.p256dh, auth: keys.auth },
    create: {
      userId:   user.id,
      tenantId: user.tenantId,
      endpoint,
      p256dh:   keys.p256dh,
      auth:     keys.auth,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  let user;
  try { user = await requireAuth("staff"); } catch (e) {
    return apiError(e);
  }

  let body: { endpoint: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  await prisma.pushSubscription
    .delete({ where: { endpoint: body.endpoint, userId: user.id } })
    .catch(() => {});

  return NextResponse.json({ ok: true });
}
