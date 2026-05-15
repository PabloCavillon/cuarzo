import { NextRequest, NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/session";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  let user;
  try { user = await requireAuth("staff"); } catch (e) { return apiError(e); }

  const { id } = await params;

  const ticket = await prisma.supportTicket.findFirst({
    where: { id, tenantId: user.tenantId },
    include: {
      user: { select: { id: true, name: true } },
      replies: {
        include: { author: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!ticket) return NextResponse.json({ error: "Ticket no encontrado." }, { status: 404 });

  return NextResponse.json({ ticket });
}
