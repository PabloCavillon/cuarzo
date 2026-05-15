"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Eye, ExternalLink, Loader2, Users, Package,
  CheckCircle2, XCircle, Shield, Ticket, MessageSquare,
  AlertCircle, Clock, ChevronDown, ChevronRight, RefreshCw,
  LogOut, Send, X, EyeOff,
} from "lucide-react";
import { CuarzoIsotype } from "@/app/components/CuarzoLogo";

// ─── Types ────────────────────────────────────────────────────────────────────

type TenantRow = {
  id: string; name: string; slug: string; plan: string;
  active: boolean; onboarded: boolean; createdAt: string;
  users: number; modules: number;
};

type TicketRow = {
  id: string; subject: string; status: string; createdAt: string;
  tenantName: string; tenantId: string; userName: string; replyCount: number;
};

type UserRow = {
  id: string; name: string; email: string; role: string; active: boolean;
};

type ReplyRow = {
  id: string; body: string; fromAdmin: boolean; createdAt: string;
  author: { name: string } | null;
};

type TicketDetail = {
  id: string; subject: string; body: string; status: string;
  createdAt: string; tenantName: string; userName: string;
  replyCount: number; replies: ReplyRow[];
};

// ─── Constants ────────────────────────────────────────────────────────────────

const PLAN_COLOR: Record<string, string> = {
  free:       "bg-white/8 text-white/50",
  starter:    "bg-blue-500/15 text-blue-300",
  pro:        "bg-purple-500/15 text-purple-300",
  enterprise: "bg-amber-500/15 text-amber-300",
};

const STATUS_INFO: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  open:        { label: "Abierto",    icon: <AlertCircle className="w-3 h-3" />,  color: "text-blue-400 bg-blue-500/10"       },
  in_progress: { label: "En proceso", icon: <Clock className="w-3 h-3" />,         color: "text-amber-400 bg-amber-500/10"     },
  resolved:    { label: "Resuelto",   icon: <CheckCircle2 className="w-3 h-3" />, color: "text-emerald-400 bg-emerald-500/10" },
  closed:      { label: "Cerrado",    icon: null,                                  color: "text-white/30 bg-white/5"           },
};

const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/30 transition-colors resize-none";

// ─── TempPasswordModal ────────────────────────────────────────────────────────

function TempPasswordModal({ password, onClose }: { password: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="bg-[#0d1b2e] border border-white/12 rounded-2xl w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Password Temporal</h3>
          </div>
          <p className="text-xs text-white/50">
            Compartí esta contraseña con el usuario. Solo se muestra una vez.
          </p>
          <div className="bg-white/8 rounded-xl px-4 py-3 font-mono text-sm text-white text-center tracking-widest select-all break-all">
            {password}
          </div>
          <div className="flex gap-2">
            <button onClick={copy} className="flex-1 py-2 text-sm bg-white/10 hover:bg-white/15 text-white rounded-xl transition-colors">
              {copied ? "¡Copiado!" : "Copiar"}
            </button>
            <button onClick={onClose} className="flex-1 py-2 text-sm bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl transition-colors">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TenantCard ───────────────────────────────────────────────────────────────

function TenantCard({
  tenant, isViewing, isPending, loadingId, onViewAs,
}: {
  tenant:    TenantRow;
  isViewing: boolean;
  isPending: boolean;
  loadingId: string | null;
  onViewAs:  (id: string) => void;
}) {
  const [expanded,     setExpanded]     = useState(false);
  const [users,        setUsers]        = useState<UserRow[] | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [resettingId,  setResettingId]  = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  async function toggleExpand() {
    if (!expanded && !users) {
      setLoadingUsers(true);
      const res  = await fetch(`/api/super-admin/tenants/${tenant.id}/users`);
      const data = await res.json();
      setUsers(data.users ?? []);
      setLoadingUsers(false);
    }
    setExpanded((v) => !v);
  }

  async function resetPassword(userId: string) {
    setResettingId(userId);
    const res  = await fetch(`/api/super-admin/tenants/${tenant.id}/reset-password`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ userId }),
    });
    const data = await res.json();
    setResettingId(null);
    if (res.ok) setTempPassword(data.tempPassword);
  }

  const loading = isPending && loadingId === tenant.id;

  return (
    <>
      {tempPassword && (
        <TempPasswordModal password={tempPassword} onClose={() => setTempPassword(null)} />
      )}
      <div className={`border rounded-xl overflow-hidden ${
        isViewing ? "border-amber-500/30 bg-amber-500/5" : "border-white/8 bg-white/4"
      }`}>
        {/* Row */}
        <div className="px-4 py-3.5">
          {/* Mobile layout */}
          <div className="sm:hidden">
            <button onClick={toggleExpand} className="w-full text-left">
              <div className="flex items-center gap-2">
                {expanded ? <ChevronDown className="w-3.5 h-3.5 text-white/30 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-white/30 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-white">{tenant.name}</p>
                    {isViewing && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded-full">VIENDO</span>}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${PLAN_COLOR[tenant.plan] ?? PLAN_COLOR.free}`}>{tenant.plan}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`flex items-center gap-1 text-[10px] ${tenant.active ? "text-emerald-400" : "text-red-400"}`}>
                      {tenant.active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {tenant.active ? (tenant.onboarded ? "Activo" : "Onboarding") : "Inactivo"}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-white/40"><Users className="w-3 h-3" />{tenant.users}</span>
                  </div>
                </div>
              </div>
            </button>
            <div className="flex gap-1.5 mt-2.5 pl-5">
              <button
                onClick={() => onViewAs(tenant.id)}
                disabled={isPending || isViewing}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/8 hover:bg-white/14 text-white/60 hover:text-white text-[11px] transition-colors disabled:opacity-40"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />} Ver
              </button>
              <a href={`/tienda/${tenant.slug}`} target="_blank" rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Desktop layout */}
          <div className="hidden sm:grid grid-cols-[1fr_80px_60px_60px_90px_130px] gap-4 items-center">
            <button onClick={toggleExpand} className="flex items-center gap-2 text-left min-w-0">
              {expanded ? <ChevronDown className="w-3.5 h-3.5 text-white/30 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-white/30 shrink-0" />}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white truncate">{tenant.name}</p>
                  {isViewing && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded-full shrink-0">VIENDO</span>}
                </div>
                <p className="text-[10px] text-white/30 font-mono">{tenant.slug}</p>
              </div>
            </button>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize w-fit ${PLAN_COLOR[tenant.plan] ?? PLAN_COLOR.free}`}>{tenant.plan}</span>
            <div className="flex items-center gap-1 text-xs text-white/50"><Users className="w-3 h-3" />{tenant.users}</div>
            <div className="flex items-center gap-1 text-xs text-white/50"><Package className="w-3 h-3" />{tenant.modules}</div>
            <div className="flex items-center gap-1.5">
              {tenant.active ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-red-400" />}
              <span className={`text-[10px] ${tenant.active ? "text-emerald-400" : "text-red-400"}`}>
                {tenant.active ? (tenant.onboarded ? "Activo" : "Onboarding") : "Inactivo"}
              </span>
            </div>
            <div className="flex items-center gap-1 justify-end">
              <button
                onClick={() => onViewAs(tenant.id)}
                disabled={isPending || isViewing}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/8 hover:bg-white/14 text-white/60 hover:text-white text-[11px] transition-colors disabled:opacity-40"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />} Ver
              </button>
              <a href={`/tienda/${tenant.slug}`} target="_blank" rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-colors">
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Expanded users */}
        {expanded && (
          <div className="border-t border-white/8 bg-black/20 px-4 py-4">
            {loadingUsers ? (
              <div className="flex items-center gap-2 text-xs text-white/30">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cargando usuarios…
              </div>
            ) : !users || users.length === 0 ? (
              <p className="text-xs text-white/25">Sin usuarios</p>
            ) : (
              <div className="space-y-2.5">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{u.name}</p>
                      <p className="text-[10px] text-white/30 truncate">{u.email} · {u.role}</p>
                    </div>
                    <button
                      onClick={() => resetPassword(u.id)}
                      disabled={resettingId === u.id}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] bg-white/6 hover:bg-white/12 text-white/50 hover:text-white rounded-lg transition-colors disabled:opacity-40 shrink-0"
                    >
                      {resettingId === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                      <span className="hidden xs:inline">Reset</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ─── TicketDetailModal ────────────────────────────────────────────────────────

function TicketDetailModal({ ticketId, onClose, onStatusChange }: {
  ticketId:       string;
  onClose:        () => void;
  onStatusChange: (id: string, status: string) => void;
}) {
  const [ticket,         setTicket]         = useState<TicketDetail | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [reply,          setReply]          = useState("");
  const [sending,        setSending]        = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useState(() => {
    fetch(`/api/super-admin/tickets/${ticketId}`)
      .then((r) => r.json())
      .then((d) => { setTicket(d.ticket); setLoading(false); });
  });

  async function sendReply() {
    if (!reply.trim() || !ticket) return;
    setSending(true);
    const res  = await fetch(`/api/super-admin/tickets/${ticketId}/reply`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ body: reply.trim() }),
    });
    const data = await res.json();
    if (res.ok) {
      setTicket((t) => t ? { ...t, status: "in_progress", replies: [...t.replies, data.reply] } : t);
      setReply("");
      onStatusChange(ticketId, "in_progress");
    }
    setSending(false);
  }

  async function changeStatus(newStatus: string) {
    if (!ticket || ticket.status === newStatus) return;
    setChangingStatus(true);
    const res = await fetch(`/api/super-admin/tickets/${ticketId}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setTicket((t) => t ? { ...t, status: newStatus } : t);
      onStatusChange(ticketId, newStatus);
    }
    setChangingStatus(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-2 sm:p-4" onClick={onClose}>
      <div className="bg-[#0d1b2e] border border-white/12 rounded-2xl w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between p-4 sm:p-5 border-b border-white/8 shrink-0">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-white/30" />
          ) : (
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-sm font-semibold text-white">{ticket?.subject}</p>
              <p className="text-[11px] text-white/35 mt-0.5">{ticket?.tenantName} · {ticket?.userName}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {ticket && (() => {
                  const st = STATUS_INFO[ticket.status];
                  return (
                    <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${st?.color}`}>
                      {st?.icon}{st?.label}
                    </span>
                  );
                })()}
                <div className="flex gap-1 flex-wrap">
                  {(["open", "in_progress", "resolved", "closed"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => changeStatus(s)}
                      disabled={changingStatus || ticket?.status === s}
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                        ticket?.status === s ? STATUS_INFO[s].color : "bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/60"
                      } disabled:opacity-50`}
                    >
                      {STATUS_INFO[s]?.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors shrink-0 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {ticket && (
            <>
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  {ticket.userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-white/30 mb-1">
                    {ticket.userName} · {new Date(ticket.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <div className="bg-white/5 rounded-xl px-4 py-3 text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                    {ticket.body}
                  </div>
                </div>
              </div>

              {ticket.replies.map((r) => (
                <div key={r.id} className={`flex gap-3 ${r.fromAdmin ? "flex-row-reverse" : ""}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    r.fromAdmin ? "bg-amber-500/20 text-amber-400" : "bg-white/10 text-white"
                  }`}>
                    {r.fromAdmin ? <Shield className="w-3.5 h-3.5" /> : (r.author?.name.charAt(0).toUpperCase() ?? "?")}
                  </div>
                  <div className={`flex-1 min-w-0 ${r.fromAdmin ? "flex flex-col items-end" : ""}`}>
                    <p className={`text-[10px] text-white/30 mb-1 ${r.fromAdmin ? "text-right" : ""}`}>
                      {r.fromAdmin ? "Soporte Cuarzo" : r.author?.name} · {new Date(r.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <div className={`inline-block max-w-full rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap wrap-break-word ${
                      r.fromAdmin ? "bg-amber-500/10 text-amber-100" : "bg-white/5 text-white/80"
                    }`}>
                      {r.body}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Reply */}
        {ticket?.status !== "closed" && (
          <div className="p-4 border-t border-white/8 shrink-0">
            <div className="flex gap-2">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Responder como soporte Cuarzo…"
                rows={2}
                className={inputCls}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) sendReply(); }}
              />
              <button
                onClick={sendReply}
                disabled={sending || !reply.trim()}
                className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-xl transition-colors disabled:opacity-40 shrink-0"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-white/20 mt-1.5 hidden sm:block">Ctrl+Enter para enviar</p>
          </div>
        )}
        {ticket?.status === "closed" && (
          <div className="px-5 py-3 border-t border-white/8 text-center text-xs text-white/25">
            Este ticket está cerrado.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main SuperPanel ──────────────────────────────────────────────────────────

export function SuperPanel({
  user,
  tenants,
  tickets: initialTickets,
  currentViewTenantId,
}: {
  user:                { email: string; name: string };
  tenants:             TenantRow[];
  tickets:             TicketRow[];
  currentViewTenantId: string | null;
}) {
  const router                       = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingId,    setLoadingId]    = useState<string | null>(null);
  const [tab,          setTab]          = useState<"clientes" | "soporte">("clientes");
  const [tickets,      setTickets]      = useState(initialTickets);
  const [detailId,     setDetailId]     = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  function viewAs(tenantId: string) {
    setLoadingId(tenantId);
    startTransition(async () => {
      await fetch("/api/super-admin/view-tenant", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ tenantId }),
      });
      router.push("/admin");
    });
  }

  async function logout() {
    await fetch("/api/super-admin/auth", { method: "DELETE" });
    router.push("/super-admin/login");
  }

  function handleStatusChange(id: string, status: string) {
    setTickets((prev) => prev.map((t) => t.id === id ? { ...t, status } : t));
  }

  const filteredTickets = statusFilter === "all" ? tickets : tickets.filter((t) => t.status === statusFilter);
  const openCount = tickets.filter((t) => t.status === "open").length;

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      {detailId && (
        <TicketDetailModal
          ticketId={detailId}
          onClose={() => setDetailId(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <header className="bg-[#0a1628] border-b border-white/8 px-4 sm:px-6 py-3 sm:py-4 shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CuarzoIsotype height={20} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white tracking-widest">PANEL GLOBAL</h1>
                <Shield className="w-3 h-3 text-amber-400" />
              </div>
              <p className="text-[10px] text-white/30 hidden sm:block">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentViewTenantId && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px]">
                <EyeOff className="w-3 h-3" />
                <span className="hidden sm:inline">Viendo tenant externo</span>
              </div>
            )}
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-colors"
              title="Salir del panel"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ─── Tabs ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#0a1628] border-b border-white/8 px-4 sm:px-6 shrink-0">
        <div className="max-w-6xl mx-auto flex gap-1">
          {([
            { key: "clientes" as const, label: "Clientes", badge: tenants.length, badgeColor: "bg-white/8 text-white/40" },
            { key: "soporte"  as const, label: "Soporte",  badge: openCount > 0 ? openCount : null, badgeColor: "bg-blue-500/20 text-blue-400" },
          ]).map(({ key, label, badge, badgeColor }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
                tab === key ? "border-white text-white" : "border-transparent text-white/40 hover:text-white/60"
              }`}
            >
              {label}
              {badge !== null && badge !== undefined && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${badgeColor}`}>{badge}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Content ────────────────────────────────────────────────────────── */}
      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 overflow-auto">
        <div className="max-w-6xl mx-auto">

          {/* Clientes Tab */}
          {tab === "clientes" && (
            <div className="space-y-2">
              <div className="hidden sm:grid grid-cols-[1fr_80px_60px_60px_90px_130px] gap-4 px-7 py-2">
                {["Tenant", "Plan", "Users", "Mods", "Estado", ""].map((h) => (
                  <p key={h} className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">{h}</p>
                ))}
              </div>
              {tenants.length === 0 ? (
                <p className="text-sm text-white/25 text-center py-12">Sin tenants registrados.</p>
              ) : tenants.map((t) => (
                <TenantCard
                  key={t.id}
                  tenant={t}
                  isViewing={t.id === currentViewTenantId}
                  isPending={isPending}
                  loadingId={loadingId}
                  onViewAs={viewAs}
                />
              ))}
            </div>
          )}

          {/* Soporte Tab */}
          {tab === "soporte" && (
            <div className="space-y-4">
              <div className="flex gap-1.5 flex-wrap">
                {[
                  { key: "all",         label: "Todos" },
                  { key: "open",        label: "Abiertos" },
                  { key: "in_progress", label: "En proceso" },
                  { key: "resolved",    label: "Resueltos" },
                  { key: "closed",      label: "Cerrados" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setStatusFilter(key)}
                    className={`px-3 py-1.5 text-xs rounded-xl transition-colors ${
                      statusFilter === key
                        ? "bg-white/15 text-white font-semibold"
                        : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {filteredTickets.length === 0 ? (
                <div className="text-center py-16 space-y-2">
                  <Ticket className="w-8 h-8 text-white/15 mx-auto" />
                  <p className="text-sm text-white/25">Sin tickets para este filtro.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTickets.map((t) => {
                    const st = STATUS_INFO[t.status];
                    return (
                      <button
                        key={t.id}
                        onClick={() => setDetailId(t.id)}
                        className="w-full text-left bg-white/4 hover:bg-white/7 border border-white/8 rounded-xl px-4 py-3.5 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <Ticket className="w-4 h-4 text-white/25 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-medium text-white">{t.subject}</p>
                              <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${st?.color}`}>
                                {st?.icon}{st?.label}
                              </span>
                            </div>
                            <p className="text-[11px] text-white/40 mt-0.5">{t.tenantName} · {t.userName}</p>
                            <p className="text-[10px] text-white/25 mt-0.5">
                              {new Date(t.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
                              {t.replyCount > 0 && ` · ${t.replyCount} mensaje${t.replyCount !== 1 ? "s" : ""}`}
                            </p>
                          </div>
                          <MessageSquare className="w-3.5 h-3.5 text-white/20 shrink-0 mt-0.5" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
