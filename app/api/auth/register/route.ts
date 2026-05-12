import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendEmailVerification } from "@/lib/email";

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/;

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 40);
}

export async function POST(req: NextRequest) {
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > 4096) {
    return Response.json({ error: "Solicitud demasiado grande." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "JSON inválido." }, { status: 400 });
  }

  const { businessName, name, email, password } = body as Record<string, unknown>;

  if (typeof businessName !== "string" || businessName.trim().length < 2 || businessName.trim().length > 100) {
    return Response.json({ error: "El nombre del negocio debe tener entre 2 y 100 caracteres." }, { status: 400 });
  }
  if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100) {
    return Response.json({ error: "El nombre debe tener entre 2 y 100 caracteres." }, { status: 400 });
  }
  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return Response.json({ error: "Email inválido." }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8 || password.length > 128) {
    return Response.json({ error: "La contraseña debe tener entre 8 y 128 caracteres." }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Check globally — one email = one account across all tenants
  const existing = await prisma.user.findFirst({ where: { email: normalizedEmail } });
  if (existing) {
    return Response.json(
      { error: "Si el email no está registrado, podés crear tu cuenta." },
      { status: 409 }
    );
  }

  const hashed = await bcrypt.hash(password, 12);
  const slug = `${toSlug(businessName.trim())}-${Math.random().toString(36).slice(2, 8)}`;

  let createdUserId: string;

  await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: { name: businessName.trim(), slug, plan: "free" },
    });
    const [user] = await Promise.all([
      tx.user.create({
        data: {
          tenantId: tenant.id,
          email:    normalizedEmail,
          name:     name.trim(),
          role:     "owner",
          password: hashed,
        },
      }),
      tx.tenantModule.create({ data: { tenantId: tenant.id, module: "turnera" } }),
    ]);
    createdUserId = user.id;
  });

  // Send verification email (fire-and-forget)
  const verifyToken = randomBytes(32).toString("hex");
  const expiresAt   = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await prisma.emailVerificationToken.create({
    data: { userId: createdUserId!, token: verifyToken, expiresAt },
  });
  const verifyUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/auth/verify-email?token=${verifyToken}`;
  void sendEmailVerification({ to: normalizedEmail, name: name.trim(), verifyUrl });

  return Response.json({ ok: true, redirectTo: "/admin/onboarding" }, { status: 201 });
}
