import { redirect } from "next/navigation";
import { requireAuth, apiError } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { TasksClient } from "./TasksClient";

export default async function TasksPage() {
  let user;
  try {
    user = await requireAuth("staff");
  } catch (e) {
    void apiError(e);
    redirect("/login");
  }

  const tid = user.tenantId;

  const [tasks, teamMembers] = await Promise.all([
    prisma.task.findMany({
      where:   { tenantId: tid, status: { not: "cancelled" } },
      include: {
        assignedTo: { select: { id: true, name: true } },
        createdBy:  { select: { id: true, name: true } },
      },
      orderBy: [{ dueDate: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
      take: 300,
    }),
    prisma.user.findMany({
      where:   { tenantId: tid, active: true },
      select:  { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">Tareas</h2>
        <p className="text-sm text-white/40 mt-0.5">Gestión de tareas del equipo</p>
      </div>

      <TasksClient
        initialTasks={tasks.map((t) => ({
          id:               t.id,
          title:            t.title,
          description:      t.description,
          status:           t.status,
          priority:         t.priority,
          dueDate:          t.dueDate?.toISOString() ?? null,
          recurrence:       (t.recurrence ?? "none") as never,
          recurrenceConfig: (t.recurrenceConfig ?? null) as never,
          assignedTo:       t.assignedTo ? { id: t.assignedTo.id, name: t.assignedTo.name } : null,
          createdBy:        { id: t.createdBy.id, name: t.createdBy.name },
          createdAt:        t.createdAt.toISOString(),
        }))}
        teamMembers={teamMembers}
        currentUserId={user.id}
      />
    </div>
  );
}
