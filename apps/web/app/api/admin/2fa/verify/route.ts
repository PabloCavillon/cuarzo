import { NextRequest, NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { verifyTotp } from "@/lib/auth/totp";

export async function POST(req: NextRequest) {
  let user;
  try { user = await requireAuth(); } catch (e) { return apiError(e); }

  const { code } = await req.json().catch(() => ({})) as { code?: string };
  if (!code?.trim()) return NextResponse.json({ error: "Código requerido." }, { status: 400 });

  const dbUser = await prisma.user.findUnique({
    where:  { id: user.id },
    select: { totpEnabled: true, twoFaMethod: true, totpSecret: true, emailOtpCode: true, emailOtpExpiry: true },
  });

  if (!dbUser?.totpEnabled) {
    return NextResponse.json({ error: "2FA no configurado." }, { status: 400 });
  }

  let valid = false;

  if (dbUser.twoFaMethod === "totp" && dbUser.totpSecret) {
    valid = verifyTotp(code, dbUser.totpSecret);
  } else if (dbUser.twoFaMethod === "email") {
    const expired = !dbUser.emailOtpExpiry || dbUser.emailOtpExpiry < new Date();
    valid = !expired && dbUser.emailOtpCode === code.trim();
    if (valid) {
      await prisma.user.update({
        where: { id: user.id },
        data:  { emailOtpCode: null, emailOtpExpiry: null },
      });
    }
  }

  if (!valid) return NextResponse.json({ error: "Código incorrecto o expirado." }, { status: 401 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("x-2fa-auth", user.id, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict",
    path:     "/",
    maxAge:   60 * 60 * 12,
  });
  return res;
}
