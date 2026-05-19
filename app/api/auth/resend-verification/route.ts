import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { sendEmailVerification } from "@/lib/integrations/email";

export async function POST(req: NextRequest) {
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > 512) {
    return Response.json({ error: "Solicitud demasiado grande." }, { status: 413 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "No autenticado." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return Response.json({ error: "Usuario no encontrado." }, { status: 404 });
  if (user.emailVerified) return Response.json({ ok: true }); // already verified

  const token     = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.emailVerificationToken.create({
    data: { userId: user.id, token, expiresAt },
  });

  const verifyUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/auth/verify-email?token=${token}`;
  void sendEmailVerification({ to: user.email, name: user.name, verifyUrl });

  return Response.json({ ok: true });
}
