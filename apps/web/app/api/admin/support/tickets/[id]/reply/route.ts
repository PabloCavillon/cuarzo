import { NextRequest, NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  let user;
  try { user = await requireAuth("staff"); } catch (e) { return apiError(e); }

  const { id } = await params;

  const ticket = await prisma.supportTicket.findFirst({
    where: { id, tenantId: user.tenantId },
  });
  if (!ticket) return NextResponse.json({ error: "Ticket no encontrado." }, { status: 404 });
  if (ticket.status === "closed") {
    return NextResponse.json({ error: "El ticket está cerrado." }, { status: 400 });
  }

  const { body } = await req.json().catch(() => ({})) as { body?: string };
  if (!body?.trim() || body.trim().length < 2) {
    return NextResponse.json({ error: "La respuesta no puede estar vacía." }, { status: 400 });
  }

  const reply = await prisma.supportTicketReply.create({
    data: {
      ticketId:  id,
      authorId:  user.id,
      fromAdmin: false,
      body:      body.trim(),
    },
    include: { author: { select: { id: true, name: true } } },
  });

  // Re-open if resolved
  if (ticket.status === "resolved") {
    await prisma.supportTicket.update({
      where: { id },
      data:  { status: "open" },
    });
  }

  return NextResponse.json({ reply }, { status: 201 });
}
