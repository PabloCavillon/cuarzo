"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Plus, Circle, Loader2, CheckCircle2, Clock,
  AlertTriangle, ChevronDown, Trash2, User, CalendarDays, Flag, Repeat,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type TaskStatus    = "pending" | "in_progress" | "done" | "cancelled";
type TaskPriority  = "low" | "medium" | "high" | "urgent";
type TaskRecurrence = "none" | "daily" | "weekly" | "monthly" | "yearly";

type RecurrenceConfig =
  | null
  | { type: "daily" }
  | { type: "weekly";      weekday: number }
  | { type: "monthly_dom"; day: number }
  | { type: "monthly_dow"; week: number; weekday: number }
  | { type: "yearly";      month: number; day: number };

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  recurrence: TaskRecurrence;
  recurrenceConfig: RecurrenceConfig;
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

const WEEKDAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEK_LABELS    = ["", "First", "Second", "Third", "Fourth", "Last"];
const MONTH_LABELS   = ["", "enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isOverdue(dueDate: string | null, status: TaskStatus) {
  if (!dueDate || status === "done" || status === "cancelled") return false;
  return new Date(dueDate) < new Date(new Date().setHours(0, 0, 0, 0));
}

function fmtDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

function fmtRecurrence(recurrence: TaskRecurrence, config: RecurrenceConfig): string | null {
  if (recurrence === "none" || !recurrence) return null;
  if (recurrence === "daily")  return "Diaria";
  if (recurrence === "yearly") {
    const c = config as { type: "yearly"; month: number; day: number } | null;
    return c ? `Anual · ${c.day} ${MONTH_LABELS[c.month]}` : "Anual";
  }
  if (recurrence === "weekly") {
    const c = config as { type: "weekly"; weekday: number } | null;
    return c ? `Cada ${WEEKDAY_LABELS[c.weekday].toLowerCase()}` : "Semanal";
  }
  if (recurrence === "monthly") {
    const c = config as RecurrenceConfig;
    if (!c) return "Mensual";
    if ((c as { type: string }).type === "monthly_dom") {
      const dom = c as { type: "monthly_dom"; day: number };
      return `Día ${dom.day} de cada mes`;
    }
    if ((c as { type: string }).type === "monthly_dow") {
      const dow = c as { type: "monthly_dow"; week: number; weekday: number };
      return `${WEEK_LABELS[dow.week]} ${WEEKDAY_LABELS[dow.weekday].toLowerCase()} del mes`;
    }
  }
  return null;
}

function StatusIcon({ status, loading }: { status: TaskStatus; loading: boolean }) {
  if (loading) return <Loader2 className="w-4 h-4 animate-spin text-white/40" />;
  if (status === "done")        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
  if (status === "in_progress") return <Clock className="w-4 h-4 text-blue-400" />;
  return <Circle className="w-4 h-4 text-white/25" />;
}

// ─── Recurrence picker ────────────────────────────────────────────────────────

const selectCls = "bg-white/8 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/70 outline-none";

function RecurrencePicker({
  recurrence,
  config,
  onChange,
}: {
  recurrence: TaskRecurrence;
  config: RecurrenceConfig;
  onChange: (r: TaskRecurrence, c: RecurrenceConfig) => void;
}) {
  function handleFreq(val: string) {
    const r = val as TaskRecurrence;
    if (r === "none")    { onChange(r, null); return; }
    if (r === "daily")   { onChange(r, { type: "daily" }); return; }
    if (r === "weekly")  { onChange(r, { type: "weekly", weekday: 1 }); return; }  // default: Monday
    if (r === "monthly") { onChange(r, { type: "monthly_dom", day: 1 }); return; }
    if (r === "yearly")  { onChange(r, { type: "yearly", month: 1, day: 1 }); return; }
  }

  return (
    <div className="space-y-2">
      {/* Frequency selector */}
      <select
        value={recurrence}
        onChange={(e) => handleFreq(e.target.value)}
        className={selectCls + " w-full"}
      >
        <option value="none">Sin periodicidad</option>
        <option value="daily">Diaria</option>
        <option value="weekly">Semanal</option>
        <option value="monthly">Mensual</option>
        <option value="yearly">Anual</option>
      </select>

      {/* Weekly sub-options */}
      {recurrence === "weekly" && (
        <div className="flex items-center gap-2 pl-1">
          <span className="text-[10px] text-white/35">Cada</span>
          <select
            value={(config as { weekday?: number })?.weekday ?? 1}
            onChange={(e) => onChange("weekly", { type: "weekly", weekday: +e.target.value })}
            className={selectCls}
          >
            {WEEKDAY_LABELS.map((l, i) => <option key={i} value={i}>{l}</option>)}
          </select>
        </div>
      )}

      {/* Monthly sub-options */}
      {recurrence === "monthly" && (() => {
        const c = config as { type?: string; day?: number; week?: number; weekday?: number } | null;
        const subtype = c?.type ?? "monthly_dom";
        return (
          <div className="space-y-2 pl-1">
            <div className="flex gap-2">
              <button
                onClick={() => onChange("monthly", { type: "monthly_dom", day: c?.day ?? 1 })}
                className={`text-[10px] px-2.5 py-1 rounded-lg border transition-colors ${
                  subtype === "monthly_dom"
                    ? "bg-white/15 border-white/25 text-white"
                    : "bg-transparent border-white/10 text-white/40 hover:text-white/70"
                }`}
              >
                Día del mes
              </button>
              <button
                onClick={() => onChange("monthly", { type: "monthly_dow", week: 1, weekday: c?.weekday ?? 1 })}
                className={`text-[10px] px-2.5 py-1 rounded-lg border transition-colors ${
                  subtype === "monthly_dow"
                    ? "bg-white/15 border-white/25 text-white"
                    : "bg-transparent border-white/10 text-white/40 hover:text-white/70"
                }`}
              >
                Día de la semana
              </button>
            </div>

            {subtype === "monthly_dom" && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/35">Día</span>
                <input
                  type="number" min={1} max={31}
                  value={c?.day ?? 1}
                  onChange={(e) => onChange("monthly", { type: "monthly_dom", day: Math.min(31, Math.max(1, +e.target.value)) })}
                  className={selectCls + " w-16 text-center"}
                />
                <span className="text-[10px] text-white/35">de cada mes</span>
              </div>
            )}

            {subtype === "monthly_dow" && (
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={c?.week ?? 1}
                  onChange={(e) => onChange("monthly", { type: "monthly_dow", week: +e.target.value, weekday: c?.weekday ?? 1 })}
                  className={selectCls}
                >
                  {WEEK_LABELS.slice(1).map((l, i) => <option key={i+1} value={i+1}>{l}</option>)}
                </select>
                <select
                  value={c?.weekday ?? 1}
                  onChange={(e) => onChange("monthly", { type: "monthly_dow", week: c?.week ?? 1, weekday: +e.target.value })}
                  className={selectCls}
                >
                  {WEEKDAY_LABELS.map((l, i) => <option key={i} value={i}>{l}</option>)}
                </select>
                <span className="text-[10px] text-white/35">del mes</span>
              </div>
            )}
          </div>
        );
      })()}

      {/* Yearly sub-options */}
      {recurrence === "yearly" && (() => {
        const c = config as { month?: number; day?: number } | null;
        return (
          <div className="flex items-center gap-2 pl-1 flex-wrap">
            <span className="text-[10px] text-white/35">El día</span>
            <input
              type="number" min={1} max={31}
              value={c?.day ?? 1}
              onChange={(e) => onChange("yearly", { type: "yearly", month: c?.month ?? 1, day: Math.min(31, Math.max(1, +e.target.value)) })}
              className={selectCls + " w-14 text-center"}
            />
            <span className="text-[10px] text-white/35">de</span>
            <select
              value={c?.month ?? 1}
              onChange={(e) => onChange("yearly", { type: "yearly", month: +e.target.value, day: c?.day ?? 1 })}
              className={selectCls}
            >
              {MONTH_LABELS.slice(1).map((l, i) => <option key={i+1} value={i+1}>{l}</option>)}
            </select>
          </div>
        );
      })()}
    </div>
  );
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
  const [recurrence, setRecurrence] = useState<TaskRecurrence>("none");
  const [recurrenceConfig, setRecurrenceConfig] = useState<RecurrenceConfig>(null);
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
          title:            title.trim(),
          description:      desc.trim() || null,
          priority,
          dueDate:          dueDate || null,
          assignedToId:     assignee || null,
          recurrence,
          recurrenceConfig: recurrence !== "none" ? recurrenceConfig : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error al crear."); return; }
      onCreated(data.task);
      setTitle(""); setDesc(""); setPriority("medium"); setDueDate(""); setAssignee("");
      setRecurrence("none"); setRecurrenceConfig(null);
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
        placeholder="Task title *"
        className="w-full bg-transparent text-white text-sm placeholder:text-white/30 outline-none border-b border-white/10 pb-2 focus:border-white/30 transition-colors"
      />
      <textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Description (optional)"
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

      {/* Recurrence */}
      <div className="border-t border-white/8 pt-3">
        <p className="text-[10px] text-white/30 mb-2 flex items-center gap-1">
          <Repeat className="w-3 h-3" /> Periodicidad
        </p>
        <RecurrencePicker
          recurrence={recurrence}
          config={recurrenceConfig}
          onChange={(r, c) => { setRecurrence(r); setRecurrenceConfig(c); }}
        />
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
  const [recurrence, setRecurrence] = useState<TaskRecurrence>(task.recurrence ?? "none");
  const [recurrenceConfig, setRecurrenceConfig] = useState<RecurrenceConfig>(task.recurrenceConfig ?? null);
  const [savingRecurrence, setSavingRecurrence] = useState(false);

  const overdue = isOverdue(task.dueDate, task.status);
  const recLabel = fmtRecurrence(task.recurrence, task.recurrenceConfig);

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

  async function saveRecurrence() {
    setSavingRecurrence(true);
    try {
      const res = await fetch(`/api/admin/tasks/${task.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recurrence,
          recurrenceConfig: recurrence !== "none" ? recurrenceConfig : null,
        }),
      });
      const data = await res.json();
      if (res.ok) onUpdate(data.task);
    } finally {
      setSavingRecurrence(false);
    }
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
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${PRIORITY_COLOR[task.priority]}`}>
              <Flag className="w-2.5 h-2.5 inline mr-0.5" />
              {PRIORITY_LABEL[task.priority]}
            </span>

            {task.dueDate && (
              <span className={`flex items-center gap-1 text-[10px] ${overdue ? "text-red-400" : "text-white/35"}`}>
                <CalendarDays className="w-3 h-3" />
                {overdue ? "Vencida · " : ""}{fmtDate(task.dueDate)}
              </span>
            )}

            {recLabel && (
              <span className="flex items-center gap-1 text-[10px] text-purple-400/80">
                <Repeat className="w-3 h-3" />
                {recLabel}
              </span>
            )}

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

          <div className="flex flex-wrap gap-3">
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

          {/* Recurrence editor */}
          <div className="border-t border-white/6 pt-3">
            <p className="text-[10px] text-white/30 mb-2 flex items-center gap-1">
              <Repeat className="w-3 h-3" /> Periodicidad
            </p>
            <RecurrencePicker
              recurrence={recurrence}
              config={recurrenceConfig}
              onChange={(r, c) => { setRecurrence(r); setRecurrenceConfig(c); }}
            />
            {(recurrence !== (task.recurrence ?? "none")) && (
              <button
                onClick={saveRecurrence}
                disabled={savingRecurrence}
                className="mt-2 text-[10px] px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-lg transition-colors disabled:opacity-40 flex items-center gap-1"
              >
                {savingRecurrence && <Loader2 className="w-3 h-3 animate-spin" />}
                Guardar periodicidad
              </button>
            )}
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

      <NewTaskForm members={teamMembers} onCreated={handleCreated} />

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
               filter === "mine"    ? "No tasks assigned to you." :
               "No tasks yet. Create the first one!"}
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
