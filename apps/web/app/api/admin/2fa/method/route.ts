import { NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  let user;
  try { user = await requireAuth(); } catch (e) { return apiError(e); }

  const dbUser = await prisma.user.findUnique({
    where:  { id: user.id },
    select: { twoFaMethod: true, totpEnabled: true },
  });

  return NextResponse.json({ method: dbUser?.totpEnabled ? (dbUser.twoFaMethod ?? null) : null });
}
