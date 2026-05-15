import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { email, code } = await req.json().catch(() => ({})) as { email?: string; code?: string };

  if (!email || !code) {
    return Response.json({ error: "Email y código requeridos." }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where:  { email: email.trim().toLowerCase() },
    select: { id: true, emailVerifyCode: true, emailVerifyExpiry: true, emailVerified: true },
  });

  if (!user) return Response.json({ error: "Usuario no encontrado." }, { status: 404 });
  if (user.emailVerified) return Response.json({ ok: true });

  const expired = !user.emailVerifyExpiry || user.emailVerifyExpiry < new Date();
  if (expired || user.emailVerifyCode !== code.trim()) {
    return Response.json({ error: "Código incorrecto o expirado." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data:  { emailVerified: new Date(), emailVerifyCode: null, emailVerifyExpiry: null },
  });

  return Response.json({ ok: true });
}
