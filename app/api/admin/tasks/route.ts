import { NextRequest, NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { sendPushToUser } from "@/lib/webpush";

export async function GET(req: NextRequest) {
  let user;
  try { user = await requireAuth("staff"); } catch (e) {
    return apiError(e);
  }

  const { searchParams } = new URL(req.url);
  const status   = searchParams.get("status") ?? "";
  const priority = searchParams.get("priority") ?? "";
  const assignee = searchParams.get("assignee") ?? "";
  const due      = searchParams.get("due") ?? ""; // "today" | "week" | ""

  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const week  = new Date(today); week.setDate(today.getDate() + 7);

  const tasks = await prisma.task.findMany({
    where: {
      tenantId: user.tenantId,
      ...(status   ? { status:   status   as never } : { status: { not: "cancelled" as never } }),
      ...(priority ? { priority: priority as never } : {}),
      ...(assignee === "me"  ? { assignedToId: user.id } : {}),
      ...(assignee === "none" ? { assignedToId: null }   : {}),
      ...(due === "today" ? { dueDate: { gte: today, lt: new Date(today.getTime() + 86400000) } } : {}),
      ...(due === "week"  ? { dueDate: { gte: today, lt: week } } : {}),
      ...(due === "overdue" ? { dueDate: { lt: today }, status: { notIn: ["done", "cancelled"] as never[] } } : {}),
    },
    select: {
      id: true, title: true, description: true, status: true, priority: true,
      dueDate: true, recurrence: true, recurrenceConfig: true,
      assignedTo: { select: { id: true, name: true } },
      createdBy:  { select: { id: true, name: true } },
      createdAt: true,
    },
    orderBy: [
      { dueDate:  "asc"  },
      { priority: "desc" },
      { createdAt: "desc" },
    ],
    take: 200,
  });

  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest) {
  let user;
  try { user = await requireAuth("staff"); } catch (e) {
    return apiError(e);
  }

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const title        = String(body.title        ?? "").trim();
  const description  = String(body.description  ?? "").trim() || null;
  const priority     = String(body.priority     ?? "medium");
  const recurrence   = String(body.recurrence   ?? "none");
  const assignedToId = body.assignedToId ? String(body.assignedToId) : null;
  const dueDate      = body.dueDate ? new Date(String(body.dueDate)) : null;
  const recurrenceConfig = body.recurrenceConfig ?? null;

  if (!title || title.length < 2) {
    return NextResponse.json({ error: "El título es requerido." }, { status: 400 });
  }
  if (!["low","medium","high","urgent"].includes(priority)) {
    return NextResponse.json({ error: "Prioridad inválida." }, { status: 400 });
  }
  if (!["none","daily","weekly","monthly","yearly"].includes(recurrence)) {
    return NextResponse.json({ error: "Periodicidad inválida." }, { status: 400 });
  }
  if (dueDate && isNaN(dueDate.getTime())) {
    return NextResponse.json({ error: "Fecha inválida." }, { status: 400 });
  }

  // Validate assignee belongs to the same tenant
  if (assignedToId) {
    const member = await prisma.user.findFirst({
      where: { id: assignedToId, tenantId: user.tenantId },
    });
    if (!member) {
      return NextResponse.json({ error: "Usuario no válido." }, { status: 400 });
    }
  }

  const task = await prisma.task.create({
    data: {
      tenantId:        user.tenantId,
      createdById:     user.id,
      title,
      description,
      priority:        priority as never,
      recurrence:      recurrence as never,
      recurrenceConfig: recurrenceConfig as never,
      assignedToId,
      dueDate,
    },
    include: {
      assignedTo: { select: { id: true, name: true } },
      createdBy:  { select: { id: true, name: true } },
    },
  });

  // Notify assignee if different from creator
  if (assignedToId && assignedToId !== user.id) {
    sendPushToUser(assignedToId, {
      title: "Nueva tarea asignada",
      body:  `${user.name} te asignó: ${title}`,
    }).catch(() => {});
  }

  return NextResponse.json({ task }, { status: 201 });
}
