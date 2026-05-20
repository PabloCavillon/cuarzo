import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin, apiError } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  let user;
  try { user = await requireSuperAdmin(); } catch (e) { return apiError(e); }

  const { id } = await params;

  const ticket = await prisma.supportTicket.findUnique({ where: { id } });
  if (!ticket) return NextResponse.json({ error: "Ticket no encontrado." }, { status: 404 });

  const { body } = await req.json().catch(() => ({})) as { body?: string };
  if (!body?.trim()) return NextResponse.json({ error: "Respuesta vacía." }, { status: 400 });

  const [reply] = await prisma.$transaction([
    prisma.supportTicketReply.create({
      data: {
        ticketId:  id,
        authorId:  user.realTenantId !== user.tenantId ? null : user.id,
        fromAdmin: true,
        body:      body.trim(),
      },
      include: { author: { select: { id: true, name: true } } },
    }),
    prisma.supportTicket.update({
      where: { id },
      data:  { status: "in_progress", updatedAt: new Date() },
    }),
  ]);

  return NextResponse.json({
    reply: {
      id:        reply.id,
      body:      reply.body,
      fromAdmin: reply.fromAdmin,
      createdAt: reply.createdAt.toISOString(),
      author:    reply.author ? { name: reply.author.name } : null,
    },
  }, { status: 201 });
}
