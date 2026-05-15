import { NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { generateEmailOtp } from "@/lib/totp";
import { sendTwoFaOtp } from "@/lib/email";

export async function POST() {
  let user;
  try { user = await requireAuth(); } catch (e) { return apiError(e); }

  const dbUser = await prisma.user.findUnique({
    where:  { id: user.id },
    select: { email: true, name: true, twoFaMethod: true, totpEnabled: true },
  });

  if (!dbUser?.totpEnabled || dbUser.twoFaMethod !== "email") {
    return NextResponse.json({ error: "Método no configurado." }, { status: 400 });
  }

  const code    = generateEmailOtp();
  const expiry  = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data:  { emailOtpCode: code, emailOtpExpiry: expiry },
  });

  await sendTwoFaOtp({ to: dbUser.email, name: dbUser.name, code });

  return NextResponse.json({ ok: true });
}
