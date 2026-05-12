import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordReset } from "@/lib/email";

export async function POST(req: NextRequest) {
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > 1024) {
    return Response.json({ error: "Solicitud demasiado grande." }, { status: 413 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return Response.json({ error: "JSON inválido." }, { status: 400 });
  }

  const { email } = body as Record<string, unknown>;
  if (typeof email !== "string" || !email.includes("@")) {
    return Response.json({ error: "Email inválido." }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Always return 200 to avoid revealing whether the email exists
  const user = await prisma.user.findFirst({ where: { email: normalizedEmail } });
  if (user) {
    const token     = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { email: normalizedEmail, token, expiresAt },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;
    void sendPasswordReset({ to: normalizedEmail, name: user.name, resetUrl });
  }

  return Response.json({ ok: true });
}
