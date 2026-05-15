"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, X, Loader2, Send, MessageSquare, Ticket,
  CheckCircle2, Clock, AlertCircle, Shield,
} from "lucide-react";

type TicketSummary = {
  id: string; subject: string; status: string;
  createdAt: string; userName: string; replyCount: number;
  hasAdminReply: boolean; lastActivity: string;
};

type ReplyRow = {
  id: string; body: string; fromAdmin: boolean; createdAt: string;
  author: { name: string } | null;
};

type TicketDetail = {
  id: string; subject: string; body: string; status: string;
  createdAt: string; userName: string; replyCount: number;
  replies: ReplyRow[];
};

const STATUS_INFO: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  open:        { label: "Abierto",    icon: <AlertCircle className="w-3 h-3" />,    color: "text-blue-400 bg-blue-500/10"       },
  in_progress: { label: "En proceso", icon: <Clock className="w-3 h-3" />,           color: "text-amber-400 bg-amber-500/10"     },
  resolved:    { label: "Resuelto",   icon: <CheckCircle2 className="w-3 h-3" />,   color: "text-emerald-400 bg-emerald-500/10" },
  closed:      { label: "Cerrado",    icon: null,                                    color: "text-white/30 bg-white/5"           },
};

const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/30 transition-colors resize-none";

function NewTicketModal({ onClose, onCreated }: {
  onClose: () => void;
  onCreated: (t: TicketSummary) => void;
}) {
  const [subject, setSubject] = useState("");
  const [body,    setBody]    = useState("");
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError("");
    const res  = await fetch("/api/admin/support/tickets", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body:   JSON.stringify({ subject, body }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Error al crear."); return; }
    onCreated({
      id:            data.ticket.id,
      subject:       data.ticket.subject,
      status:        data.ticket.status,
      createdAt:     data.ticket.createdAt,
      userName:      data.ticket.user.name,
      replyCount:    0,
      hasAdminReply: false,
      lastActivity:  data.ticket.createdAt,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-[#0d1b2e] border border-white/12 rounded-2xl w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-white/8">
          <h3 className="text-sm font-bold text-white">Nuevo ticket</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Asunto</label>
            <input
              value={subject} onChange={(e) => setSubject(e.target.value)}
              placeholder="¿Con qué necesitás ayuda?" required maxLength={120}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Descripción</label>
            <textarea
              value={body} onChange={(e) => setBody(e.target.value)}
              placeholder="Describí el problema o consulta con el mayor detalle posible…"
              required rows={5} className={inputCls}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-white/40 hover:text-white transition-colors">
              Cancelar
            </button>
            <button
              type="submit" disabled={saving || !subject.trim() || !body.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/20 text-white text-sm rounded-xl transition-colors disabled:opacity-40"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Enviar ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TicketDetailModal({ ticketId, onClose }: { ticketId: string; onClose: () => void }) {
  const [ticket,  setTicket]  = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply,   setReply]   = useState("");
  const [sending, setSending] = useState(false);

  useState(() => {
    fetch(`/api/admin/support/tickets/${ticketId}`)
      .then((r) => r.json())
      .then((d) => { setTicket(d.ticket); setLoading(false); });
  });

  async function sendReply() {
    if (!reply.trim() || !ticket) return;
    setSending(true);
    const res  = await fetch(`/api/admin/support/tickets/${ticketId}/reply`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body:   JSON.stringify({ body: reply.trim() }),
    });
    const data = await res.json();
    if (res.ok) {
      setTicket((t) => t ? { ...t, replies: [...t.replies, data.reply] } : t);
      setReply("");
    }
    setSending(false);
  }

  const isClosed = ticket?.status === "closed";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="bg-[#0d1b2e] border border-white/12 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between p-5 border-b border-white/8 shrink-0">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-white/30" />
          ) : (
            <div>
              <p className="text-sm font-semibold text-white">{ticket?.subject}</p>
              <div className="flex items-center gap-2 mt-1">
                {ticket && (() => {
                  const st = STATUS_INFO[ticket.status];
                  return (
                    <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${st?.color}`}>
                      {st?.icon}{st?.label}
                    </span>
                  );
                })()}
              </div>
            </div>
          )}
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors ml-4 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {ticket && (
            <>
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  {ticket.userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
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
                  <div className={`flex-1 ${r.fromAdmin ? "items-end" : ""}`}>
                    <p className={`text-[10px] text-white/30 mb-1 ${r.fromAdmin ? "text-right" : ""}`}>
                      {r.fromAdmin ? "Soporte Cuarzo" : r.author?.name} · {new Date(r.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <div className={`inline-block max-w-full rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      r.fromAdmin ? "bg-amber-500/10 text-amber-100 ml-auto" : "bg-white/5 text-white/80"
                    }`}>
                      {r.body}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {!isClosed && (
          <div className="p-4 border-t border-white/8 shrink-0">
            <div className="flex gap-2">
              <textarea
                value={reply} onChange={(e) => setReply(e.target.value)}
                placeholder="Agregar más información…" rows={2}
                className={inputCls}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) sendReply(); }}
              />
              <button
                onClick={sendReply} disabled={sending || !reply.trim()}
                className="px-3 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl transition-colors disabled:opacity-40"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-white/20 mt-1.5">Ctrl+Enter para enviar</p>
          </div>
        )}
        {isClosed && (
          <div className="px-5 py-3 border-t border-white/8 text-center text-xs text-white/25">
            Este ticket está cerrado.
          </div>
        )}
      </div>
    </div>
  );
}

export function SoporteClient({ initialTickets }: { initialTickets: TicketSummary[] }) {
  const router = useRouter();
  const [tickets,    setTickets]    = useState<TicketSummary[]>(initialTickets);
  const [newOpen,    setNewOpen]    = useState(false);
  const [detailId,   setDetailId]   = useState<string | null>(null);
  const [, startTransition]         = useTransition();

  return (
    <div className="space-y-4">
      {newOpen && (
        <NewTicketModal
          onClose={() => setNewOpen(false)}
          onCreated={(t) => { setTickets((p) => [t, ...p]); startTransition(() => router.refresh()); }}
        />
      )}
      {detailId && (
        <TicketDetailModal ticketId={detailId} onClose={() => { setDetailId(null); router.refresh(); }} />
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-white/30">{tickets.length} ticket{tickets.length !== 1 ? "s" : ""}</p>
        <button
          onClick={() => setNewOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/15 text-white text-sm rounded-xl transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Nuevo ticket
        </button>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Ticket className="w-8 h-8 text-white/15 mx-auto" />
          <p className="text-sm text-white/25">Sin tickets. Si tenés algún problema o consulta, abrí uno.</p>
          <button
            onClick={() => setNewOpen(true)}
            className="mx-auto flex items-center gap-1.5 px-4 py-2 bg-white/8 hover:bg-white/14 text-white/60 hover:text-white text-sm rounded-xl transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Crear ticket
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map((t) => {
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
                      {t.hasAdminReply && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-400/80 shrink-0">
                          <Shield className="w-3 h-3" /> Respuesta de soporte
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-white/30 mt-0.5">
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
  );
}
