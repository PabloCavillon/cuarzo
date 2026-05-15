import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  const userId  = session?.user?.id;
  if (!userId) return NextResponse.json({ email: null });

  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { email: true },
  });

  return NextResponse.json({ email: user?.email ?? null });
}
