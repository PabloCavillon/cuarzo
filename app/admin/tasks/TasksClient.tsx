"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Plus, Circle, Loader2, CheckCircle2, Clock,
  AlertTriangle, ChevronDown, Trash2, User, CalendarDays, Flag,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type TaskStatus   = "pending" | "in_progress" | "done" | "cancelled";
type TaskPriority = "low" | "medium" | "high" | "urgent";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  assignedTo: { id: string; name: string } | null;
  createdBy: { id: string; name: string };
  createdAt: string;
};

type Member = { id: string; name: string };

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: "Baja", medium: "Media", high: "Alta", urgent: "Urgente",
};

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  low:    "text-gray-400 bg-white/5",
  medium: "text-blue-400 bg-blue-500/10",
  high:   "text-amber-400 bg-amber-500/10",
  urgent: "text-red-400 bg-red-500/10",
};

const STATUS_NEXT: Record<TaskStatus, TaskStatus> = {
  pending:     "in_progress",
  in_progress: "done",
  done:        "pending",
  cancelled:   "pending",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isOverdue(dueDate: string | null, status: TaskStatus) {
  if (!dueDate || status === "done" || status === "cancelled") return false;
  return new Date(dueDate) < new Date(new Date().setHours(0, 0, 0, 0));
}

function fmtDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

function StatusIcon({ status, loading }: { status: TaskStatus; loading: boolean }) {
  if (loading) return <Loader2 className="w-4 h-4 animate-spin text-white/40" />;
  if (status === "done")        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
  if (status === "in_progress") return <Clock className="w-4 h-4 text-blue-400" />;
  return <Circle className="w-4 h-4 text-white/25" />;
}

// ─── New task form ────────────────────────────────────────────────────────────

function NewTaskForm({
  members,
  onCreated,
}: {
  members: Member[];
  onCreated: (task: Task) => void;
}) {
  const [open, setOpen]         = useState(false);
  const [title, setTitle]       = useState("");
  const [desc, setDesc]         = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate]   = useState("");
  const [assignee, setAssignee] = useState("");
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/tasks", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:       title.trim(),
          description: desc.trim() || null,
          priority,
          dueDate:     dueDate || null,
          assignedToId: assignee || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error al crear."); return; }
      onCreated(data.task);
      setTitle(""); setDesc(""); setPriority("medium"); setDueDate(""); setAssignee("");
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl border border-dashed border-white/12 text-white/35 hover:text-white/70 hover:border-white/25 transition-colors text-sm"
      >
        <Plus className="w-4 h-4" />
        Nueva tarea…
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/5 border border-white/12 rounded-xl p-4 space-y-3"
    >
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título de la tarea *"
        className="w-full bg-transparent text-white text-sm placeholder:text-white/30 outline-none border-b border-white/10 pb-2 focus:border-white/30 transition-colors"
      />
      <textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Descripción (opcional)"
        rows={2}
        className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm text-white/70 placeholder:text-white/25 outline-none resize-none border border-white/8 focus:border-white/20 transition-colors"
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority)}
          className="bg-white/8 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/70 outline-none"
        >
          <option value="low">Baja</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
          <option value="urgent">Urgente</option>
        </select>

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="bg-white/8 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/70 outline-none col-span-1"
        />

        <select
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          className="bg-white/8 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/70 outline-none col-span-2 sm:col-span-2"
        >
          <option value="">Sin asignar</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs px-3 py-1.5 text-white/40 hover:text-white transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="text-xs px-4 py-1.5 bg-white text-navy-900 font-semibold rounded-lg hover:bg-navy-100 disabled:opacity-40 transition-colors"
        >
          {saving ? "Guardando…" : "Crear tarea"}
        </button>
      </div>
    </form>
  );
}

// ─── Task row ─────────────────────────────────────────────────────────────────

function TaskRow({
  task,
  members,
  onUpdate,
  onDelete,
}: {
  task: Task;
  members: Member[];
  onUpdate: (updated: Task) => void;
  onDelete: (id: string) => void;
}) {
  const [toggling, setToggling] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const overdue = isOverdue(task.dueDate, task.status);

  async function toggleStatus() {
    setToggling(true);
    try {
      const res = await fetch(`/api/admin/tasks/${task.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: STATUS_NEXT[task.status] }),
      });
      const data = await res.json();
      if (res.ok) onUpdate(data.task);
    } finally {
      setToggling(false);
    }
  }

  async function handleAssign(assignedToId: string | null) {
    const res = await fetch(`/api/admin/tasks/${task.id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedToId }),
    });
    const data = await res.json();
    if (res.ok) onUpdate(data.task);
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar "${task.title}"?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/tasks/${task.id}`, { method: "DELETE" });
      if (res.ok) onDelete(task.id);
    } finally {
      setDeleting(false);
    }
  }

  const done = task.status === "done";

  return (
    <div className={`group bg-white/4 hover:bg-white/6 border rounded-xl transition-all ${
      overdue ? "border-red-500/20" : "border-white/8"
    }`}>
      <div className="flex items-start gap-3 p-3.5">
        {/* Status toggle */}
        <button
          onClick={toggleStatus}
          disabled={toggling}
          className="mt-0.5 shrink-0 hover:scale-110 transition-transform"
        >
          <StatusIcon status={task.status} loading={toggling} />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium leading-snug ${done ? "line-through text-white/30" : "text-white"}`}>
            {task.title}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            {/* Priority */}
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${PRIORITY_COLOR[task.priority]}`}>
              <Flag className="w-2.5 h-2.5 inline mr-0.5" />
              {PRIORITY_LABEL[task.priority]}
            </span>

            {/* Due date */}
            {task.dueDate && (
              <span className={`flex items-center gap-1 text-[10px] ${overdue ? "text-red-400" : "text-white/35"}`}>
                <CalendarDays className="w-3 h-3" />
                {overdue ? "Vencida · " : ""}{fmtDate(task.dueDate)}
              </span>
            )}

            {/* Assignee */}
            <span className="flex items-center gap-1 text-[10px] text-white/30">
              <User className="w-3 h-3" />
              {task.assignedTo?.name ?? "Sin asignar"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-colors"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/6 pt-3">
          {task.description && (
            <p className="text-xs text-white/45 leading-relaxed">{task.description}</p>
          )}

          <div className="flex flex-wrap gap-2">
            <div>
              <p className="text-[10px] text-white/30 mb-1">Asignado a</p>
              <select
                defaultValue={task.assignedTo?.id ?? ""}
                onChange={(e) => handleAssign(e.target.value || null)}
                className="bg-white/8 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/70 outline-none"
              >
                <option value="">Sin asignar</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-[10px] text-white/30 mb-1">Estado</p>
              <select
                defaultValue={task.status}
                onChange={async (e) => {
                  const res = await fetch(`/api/admin/tasks/${task.id}`, {
                    method:  "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: e.target.value }),
                  });
                  const data = await res.json();
                  if (res.ok) onUpdate(data.task);
                }}
                className="bg-white/8 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/70 outline-none"
              >
                <option value="pending">Pendiente</option>
                <option value="in_progress">En progreso</option>
                <option value="done">Hecho</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>

          <p className="text-[10px] text-white/20">
            Creada por {task.createdBy.name} · {fmtDate(task.createdAt)}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main client ──────────────────────────────────────────────────────────────

type Filter = "all" | "today" | "overdue" | "mine";

export function TasksClient({
  initialTasks,
  teamMembers,
  currentUserId,
}: {
  initialTasks: Task[];
  teamMembers: Member[];
  currentUserId: string;
}) {
  const [tasks, setTasks]   = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<Filter>("all");

  const today = useMemo(() => {
    const d = new Date(); d.setHours(0,0,0,0); return d;
  }, []);

  const filtered = useMemo(() => {
    switch (filter) {
      case "today":
        return tasks.filter((t) => {
          if (!t.dueDate) return false;
          const d = new Date(t.dueDate); d.setHours(0,0,0,0);
          return d.getTime() === today.getTime();
        });
      case "overdue":
        return tasks.filter((t) => isOverdue(t.dueDate, t.status));
      case "mine":
        return tasks.filter((t) => t.assignedTo?.id === currentUserId);
      default:
        return tasks;
    }
  }, [tasks, filter, today, currentUserId]);

  // Group by status for "all" view; flat list for filtered views
  const groups = useMemo(() => {
    if (filter !== "all") return null;
    const order: TaskStatus[] = ["in_progress", "pending", "done"];
    return order.map((s) => ({
      status: s,
      label:  s === "in_progress" ? "En progreso" : s === "pending" ? "Pendientes" : "Completadas",
      tasks:  filtered.filter((t) => t.status === s),
    })).filter((g) => g.tasks.length > 0);
  }, [filtered, filter]);

  const handleCreated = useCallback((task: Task) => {
    setTasks((prev) => [task, ...prev]);
  }, []);

  const handleUpdate = useCallback((updated: Task) => {
    setTasks((prev) => prev.map((t) => t.id === updated.id ? updated : t));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const overdueCount = tasks.filter((t) => isOverdue(t.dueDate, t.status)).length;
  const pendingCount = tasks.filter((t) => t.status === "pending" || t.status === "in_progress").length;

  const FILTERS: { key: Filter; label: string; count?: number }[] = [
    { key: "all",     label: "Todas",    count: pendingCount },
    { key: "today",   label: "Hoy" },
    { key: "overdue", label: "Vencidas", count: overdueCount },
    { key: "mine",    label: "Mis tareas" },
  ];

  return (
    <div className="space-y-5">
      {/* Filter tabs */}
      <div className="flex gap-1 flex-wrap">
        {FILTERS.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === key
                ? "bg-white text-navy-900"
                : "bg-white/8 text-white/50 hover:bg-white/12 hover:text-white"
            }`}
          >
            {label}
            {count != null && count > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                filter === key
                  ? "bg-navy-100 text-navy-700"
                  : key === "overdue" ? "bg-red-500/20 text-red-400" : "bg-white/12 text-white/60"
              }`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* New task */}
      <NewTaskForm members={teamMembers} onCreated={handleCreated} />

      {/* Task list */}
      {groups ? (
        <div className="space-y-6">
          {groups.map((g) => (
            <div key={g.status}>
              <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-2">
                {g.label} · {g.tasks.length}
              </p>
              <div className="space-y-2">
                {g.tasks.map((t) => (
                  <TaskRow key={t.id} task={t} members={teamMembers} onUpdate={handleUpdate} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-white/25 text-center py-12">
              {filter === "overdue" ? "No hay tareas vencidas." :
               filter === "today"   ? "No hay tareas para hoy." :
               filter === "mine"    ? "No tenés tareas asignadas." :
               "No hay tareas. ¡Creá la primera!"}
            </p>
          ) : (
            filtered.map((t) => (
              <TaskRow key={t.id} task={t} members={teamMembers} onUpdate={handleUpdate} onDelete={handleDelete} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
