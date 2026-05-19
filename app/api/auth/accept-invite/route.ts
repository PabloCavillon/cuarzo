import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > 4096) {
    return Response.json({ error: "Solicitud demasiado grande." }, { status: 413 });
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return Response.json({ error: "JSON inválido." }, { status: 400 }); }

  const { token, name, password } = body as Record<string, unknown>;

  if (typeof token    !== "string" || !token)                               return Response.json({ error: "Token inválido." }, { status: 400 });
  if (typeof name     !== "string" || name.trim().length < 2)               return Response.json({ error: "Nombre inválido." }, { status: 400 });
  if (typeof password !== "string" || password.length < 8 || password.length > 128) return Response.json({ error: "Contraseña inválida." }, { status: 400 });

  const inv = await prisma.invitation.findUnique({
    where:   { token },
    include: { tenant: true },
  });

  if (!inv)              return Response.json({ error: "Invitación no encontrada." },  { status: 404 });
  if (inv.acceptedAt)    return Response.json({ error: "La invitación ya fue usada." }, { status: 409 });
  if (inv.expiresAt < new Date()) return Response.json({ error: "La invitación expiró." }, { status: 410 });

  const existing = await prisma.user.findFirst({
    where: { tenantId: inv.tenantId, email: inv.email },
  });
  if (existing) return Response.json({ error: "Ya existe una cuenta con este email." }, { status: 409 });

  const hashed = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.create({
      data: {
        tenantId: inv.tenantId,
        email:    inv.email,
        name:     name.trim(),
        role:     inv.role,
        password: hashed,
      },
    }),
    prisma.invitation.update({
      where: { id: inv.id },
      data:  { acceptedAt: new Date() },
    }),
  ]);

  return Response.json({ ok: true }, { status: 201 });
}
