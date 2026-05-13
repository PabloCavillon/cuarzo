import { NextRequest, NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { sendPushToUser } from "@/lib/webpush";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  let user;
  try { user = await requireAuth("staff"); } catch (e) {
    return apiError(e);
  }

  const { id } = await params;

  const existing = await prisma.task.findFirst({
    where: { id, tenantId: user.tenantId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Tarea no encontrada." }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const data: Record<string, unknown> = {};

  if (body.title !== undefined) {
    const title = String(body.title).trim();
    if (!title) return NextResponse.json({ error: "El título no puede estar vacío." }, { status: 400 });
    data.title = title;
  }
  if (body.description !== undefined) data.description = String(body.description).trim() || null;
  if (body.status !== undefined) {
    if (!["pending","in_progress","done","cancelled"].includes(String(body.status))) {
      return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
    }
    data.status = body.status;
  }
  if (body.priority !== undefined) {
    if (!["low","medium","high","urgent"].includes(String(body.priority))) {
      return NextResponse.json({ error: "Prioridad inválida." }, { status: 400 });
    }
    data.priority = body.priority;
  }
  if (body.dueDate !== undefined) {
    if (body.dueDate === null) {
      data.dueDate = null;
    } else {
      const d = new Date(String(body.dueDate));
      if (isNaN(d.getTime())) return NextResponse.json({ error: "Fecha inválida." }, { status: 400 });
      data.dueDate = d;
    }
  }
  if (body.assignedToId !== undefined) {
    if (body.assignedToId === null) {
      data.assignedToId = null;
    } else {
      const member = await prisma.user.findFirst({
        where: { id: String(body.assignedToId), tenantId: user.tenantId },
      });
      if (!member) return NextResponse.json({ error: "Usuario no válido." }, { status: 400 });
      data.assignedToId = body.assignedToId;
    }
  }

  const task = await prisma.task.update({
    where: { id },
    data,
    include: {
      assignedTo: { select: { id: true, name: true } },
      createdBy:  { select: { id: true, name: true } },
    },
  });

  // Notify new assignee when reassigned
  const newAssignee = data.assignedToId as string | null | undefined;
  if (newAssignee && newAssignee !== existing.assignedToId && newAssignee !== user.id) {
    sendPushToUser(newAssignee, {
      title: "Tarea asignada",
      body:  `${user.name} te asignó: ${task.title}`,
    }).catch(() => {});
  }

  return NextResponse.json({ task });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  let user;
  try { user = await requireAuth("staff"); } catch (e) {
    return apiError(e);
  }

  const { id } = await params;

  const existing = await prisma.task.findFirst({
    where: { id, tenantId: user.tenantId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Tarea no encontrada." }, { status: 404 });
  }

  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
