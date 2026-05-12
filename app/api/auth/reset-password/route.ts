import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > 4096) {
    return Response.json({ error: "Solicitud demasiado grande." }, { status: 413 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return Response.json({ error: "JSON inválido." }, { status: 400 });
  }

  const { token, password } = body as Record<string, unknown>;

  if (typeof token !== "string" || token.trim().length === 0) {
    return Response.json({ error: "Token requerido." }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8 || password.length > 128) {
    return Response.json({ error: "La contraseña debe tener entre 8 y 128 caracteres." }, { status: 400 });
  }

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });

  if (!resetToken) {
    return Response.json({ error: "Token inválido o expirado." }, { status: 400 });
  }
  if (resetToken.usedAt) {
    return Response.json({ error: "Este enlace ya fue utilizado." }, { status: 409 });
  }
  if (resetToken.expiresAt < new Date()) {
    return Response.json({ error: "El enlace expiró. Solicitá uno nuevo." }, { status: 410 });
  }

  const user = await prisma.user.findFirst({ where: { email: resetToken.email } });
  if (!user) {
    return Response.json({ error: "Token inválido." }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data:  { password: hashed },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data:  { usedAt: new Date() },
    }),
  ]);

  return Response.json({ ok: true });
}
