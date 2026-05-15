import { NextRequest, NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { generateTotpSecret, getTotpUri, verifyTotp } from "@/lib/totp";

export async function GET(_req: NextRequest) {
  let user;
  try { user = await requireAuth(); } catch (e) { return apiError(e); }

  const dbUser = await prisma.user.findUnique({
    where:  { id: user.id },
    select: { totpSecret: true, email: true, name: true },
  });
  if (!dbUser) return apiError(Object.assign(new Error("Usuario no encontrado"), { status: 404 }));

  const secret = dbUser.totpSecret ?? generateTotpSecret();

  if (!dbUser.totpSecret) {
    await prisma.user.update({ where: { id: user.id }, data: { totpSecret: secret } });
  }

  const uri = getTotpUri(secret, dbUser.email, "Cuarzo");
  return NextResponse.json({ secret, uri });
}

export async function POST(req: NextRequest) {
  let user;
  try { user = await requireAuth(); } catch (e) { return apiError(e); }

  const { method, code } = await req.json().catch(() => ({})) as { method?: string; code?: string };

  if (!method || !["totp", "email"].includes(method)) {
    return NextResponse.json({ error: "Método inválido." }, { status: 400 });
  }

  if (method === "totp") {
    const dbUser = await prisma.user.findUnique({
      where:  { id: user.id },
      select: { totpSecret: true },
    });
    if (!dbUser?.totpSecret) return NextResponse.json({ error: "Generá el secret primero." }, { status: 400 });
    if (!code || !verifyTotp(code, dbUser.totpSecret)) {
      return NextResponse.json({ error: "Código incorrecto. Verificá tu app." }, { status: 400 });
    }
    await prisma.user.update({
      where: { id: user.id },
      data:  { totpEnabled: true, twoFaMethod: "totp" },
    });
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data:  { totpEnabled: true, twoFaMethod: "email", totpSecret: null },
    });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest) {
  let user;
  try { user = await requireAuth(); } catch (e) { return apiError(e); }

  await prisma.user.update({
    where: { id: user.id },
    data:  { totpEnabled: false, twoFaMethod: null, totpSecret: null, emailOtpCode: null, emailOtpExpiry: null },
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.delete("x-2fa-auth");
  return res;
}
