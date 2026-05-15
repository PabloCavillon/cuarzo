import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateEmailOtp } from "@/lib/totp";
import { sendEmailVerificationCode } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({})) as { email?: string };

  if (!email) return Response.json({ error: "Email requerido." }, { status: 400 });

  const user = await prisma.user.findFirst({
    where:  { email: email.trim().toLowerCase() },
    select: { id: true, name: true, emailVerified: true },
  });

  if (!user) return Response.json({ ok: true }); // Don't leak existence
  if (user.emailVerified) return Response.json({ ok: true });

  const code   = generateEmailOtp();
  const expiry = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data:  { emailVerifyCode: code, emailVerifyExpiry: expiry },
  });

  void sendEmailVerificationCode({ to: email.trim().toLowerCase(), name: user.name, code });

  return Response.json({ ok: true });
}
