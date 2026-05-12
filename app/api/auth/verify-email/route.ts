import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/verify-email?error=missing", req.url));
  }

  const record = await prisma.emailVerificationToken.findUnique({ where: { token } });

  if (!record) {
    return NextResponse.redirect(new URL("/verify-email?error=invalid", req.url));
  }
  if (record.usedAt) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }
  if (record.expiresAt < new Date()) {
    return NextResponse.redirect(new URL("/verify-email?error=expired", req.url));
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data:  { emailVerified: new Date() },
    }),
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data:  { usedAt: new Date() },
    }),
  ]);

  return NextResponse.redirect(new URL("/admin?verified=1", req.url));
}
