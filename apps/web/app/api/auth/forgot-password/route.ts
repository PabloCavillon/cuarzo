import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db/prisma";
import { inBackground } from "@/lib/integrations/background";
import { appUrl } from "@/lib/utils/app-url";
import { sendPasswordReset } from "@/lib/integrations/email";

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

    const resetUrl = `${appUrl()}/reset-password?token=${token}`;
    inBackground(() => sendPasswordReset({ to: normalizedEmail, name: user.name, resetUrl }));
  }

  return Response.json({ ok: true });
}
