import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin, apiError } from "@/lib/session";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try { await requireSuperAdmin(); } catch (e) { return apiError(e); }

  const { id } = await params;

  const users = await prisma.user.findMany({
    where:   { tenantId: id },
    select:  { id: true, name: true, email: true, role: true, active: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ users });
}
