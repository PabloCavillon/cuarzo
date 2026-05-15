import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin, apiError } from "@/lib/session";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try { await requireSuperAdmin(); } catch (e) { return apiError(e); }

  const { id } = await params;

  const ticket = await prisma.supportTicket.findUnique({
    where:   { id },
    include: {
      tenant:  { select: { id: true, name: true } },
      user:    { select: { id: true, name: true } },
      replies: {
        include: { author: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!ticket) return NextResponse.json({ error: "Ticket no encontrado." }, { status: 404 });

  return NextResponse.json({
    ticket: {
      id:         ticket.id,
      subject:    ticket.subject,
      body:       ticket.body,
      status:     ticket.status,
      createdAt:  ticket.createdAt.toISOString(),
      tenantName: ticket.tenant.name,
      tenantId:   ticket.tenant.id,
      userName:   ticket.user.name,
      replyCount: ticket.replies.length,
      replies: ticket.replies.map((r) => ({
        id:        r.id,
        body:      r.body,
        fromAdmin: r.fromAdmin,
        createdAt: r.createdAt.toISOString(),
        author:    r.author ? { name: r.author.name } : null,
      })),
    },
  });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try { await requireSuperAdmin(); } catch (e) { return apiError(e); }

  const { id } = await params;
  const { status } = await req.json().catch(() => ({})) as { status?: string };

  if (!status || !["open","in_progress","resolved","closed"].includes(status)) {
    return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
  }

  await prisma.supportTicket.update({
    where: { id },
    data:  { status: status as never },
  });

  return NextResponse.json({ ok: true });
}
