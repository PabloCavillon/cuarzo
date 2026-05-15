import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin, apiError } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

type Ctx = { params: Promise<{ id: string }> };

function genPassword(len = 12): string {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#";
  return Array.from(randomBytes(len))
    .map((b) => chars[b % chars.length])
    .join("");
}

export async function POST(req: NextRequest, { params }: Ctx) {
  try { await requireSuperAdmin(); } catch (e) { return apiError(e); }

  const { id: tenantId } = await params;

  const { userId } = await req.json().catch(() => ({})) as { userId?: string };
  if (!userId) return NextResponse.json({ error: "userId requerido." }, { status: 400 });

  const user = await prisma.user.findFirst({
    where:  { id: userId, tenantId },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });

  const tempPassword = genPassword();
  const hashed       = await bcrypt.hash(tempPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data:  { password: hashed },
  });

  return NextResponse.json({ ok: true, tempPassword });
}
