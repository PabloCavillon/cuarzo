import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin, apiError } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  try { await requireSuperAdmin(); } catch (e) { return apiError(e); }

  const status = new URL(req.url).searchParams.get("status") ?? "";

  const tickets = await prisma.supportTicket.findMany({
    where: status ? { status: status as never } : {},
    include: {
      tenant:  { select: { id: true, name: true } },
      user:    { select: { id: true, name: true } },
      replies: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({
    tickets: tickets.map((t) => ({
      id:         t.id,
      subject:    t.subject,
      status:     t.status,
      createdAt:  t.createdAt.toISOString(),
      tenantName: t.tenant.name,
      tenantId:   t.tenant.id,
      userName:   t.user.name,
      replyCount: t.replies.length,
    })),
  });
}
