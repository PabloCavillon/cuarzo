import { NextRequest, NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  let user;
  try { user = await requireAuth("staff"); } catch (e) { return apiError(e); }

  const status = new URL(req.url).searchParams.get("status") ?? "";

  const tickets = await prisma.supportTicket.findMany({
    where: {
      tenantId: user.tenantId,
      ...(status ? { status: status as never } : {}),
    },
    include: {
      user:    { select: { id: true, name: true } },
      replies: { select: { id: true }, orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ tickets });
}

export async function POST(req: NextRequest) {
  let user;
  try { user = await requireAuth("staff"); } catch (e) { return apiError(e); }

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const subject = String(body.subject ?? "").trim();
  const text    = String(body.body    ?? "").trim();

  if (!subject || subject.length < 3) {
    return NextResponse.json({ error: "El asunto es requerido." }, { status: 400 });
  }
  if (!text || text.length < 10) {
    return NextResponse.json({ error: "Describí el problema (mín. 10 caracteres)." }, { status: 400 });
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      tenantId: user.tenantId,
      userId:   user.id,
      subject,
      body:     text,
    },
    include: {
      user:    { select: { id: true, name: true } },
      replies: true,
    },
  });

  return NextResponse.json({ ticket }, { status: 201 });
}
