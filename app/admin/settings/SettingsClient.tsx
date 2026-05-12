"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Building2, Package, Users2, Crown, ShieldCheck, User,
  Plus, X, Loader2, Mail, Clock,
} from "lucide-react";
import {
  inviteMember, cancelInvitation, removeMember, updateMemberRole,
} from "./team/actions";

// ─── Types ────────────────────────────────────────────────────────────────────

type TenantInfo   = { id: string; name: string; slug: string; plan: string };
type ModuleRow    = { module: string; active: boolean; enabledAt: string };
type UserRow      = { id: string; name: string; email: string; role: string; createdAt: string };
type InviteRow    = { id: string; email: string; role: string; expiresAt: string; createdAt: string };

// ─── Constants ────────────────────────────────────────────────────────────────

const MODULE_LABELS: Record<string, string> = {
  turnera:  "Bookings",
  catalog:  "Catalog",
  stock:    "Stock",
  orders:   "Pedidos",
  payments: "Payments",
  fiscal:   "Billing ARCA",
  caja:     "Caja Digital",
};

const PLAN_BADGE: Record<string, string> = {
  free:       "bg-white/8 text-white/50",
  starter:    "bg-blue-500/15 text-blue-300",
  pro:        "bg-purple-500/15 text-purple-300",
  enterprise: "bg-amber-500/15 text-amber-300",
};

const ROLE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  owner: Crown,
  admin: ShieldCheck,
  staff: User,
};

const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  staff: "Staff",
};

// ─── Invite form modal ────────────────────────────────────────────────────────

function InviteModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done,  setDone]  = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    setError(null);
    startTransition(async () => {
      const res = await inviteMember(fd);
      if (!res.ok) { setError(res.error); return; }
      setDone(true);
      router.refresh();
    });
  }

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-[#0d1b2e] border border-white/12 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">Invitar miembro</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {done ? (
          <div className="py-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-3">
              <Mail className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-white mb-1">Invitación enviada</p>
            <p className="text-xs text-white/40">El email tiene un enlace válido por 7 días.</p>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-white/8 hover:bg-white/14 text-white text-sm rounded-xl transition-colors">
              Cerrar
            </button>
          </div>
        ) : (
          <>
            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mb-4">
                {error}
              </p>
            )}
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="colaborador@empresa.com"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Rol</label>
                <select name="role" className={inputCls + " cursor-pointer"}>
                  <option value="staff">Staff — acceso estándar</option>
                  <option value="admin">Admin — puede invitar y gestionar</option>
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/8 text-white/60 hover:text-white text-sm rounded-xl transition-colors">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/20 text-white text-sm rounded-xl transition-colors disabled:opacity-50"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Enviar
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SettingsClient({
  tenant,
  modules,
  users,
  invitations,
  currentUserId,
  currentUserRole,
}: {
  tenant:          TenantInfo;
  modules:         ModuleRow[];
  users:           UserRow[];
  invitations:     InviteRow[];
  currentUserId:   string;
  currentUserRole: string;
}) {
  const router = useRouter();
  const [inviteOpen, setInviteOpen]   = useState(false);
  const [isPending, startTransition]  = useTransition();
  const [actionId,  setActionId]      = useState<string | null>(null);

  const canManage = ["owner", "admin"].includes(currentUserRole);

  function handleCancel(id: string) {
    setActionId(id);
    startTransition(async () => {
      await cancelInvitation(id);
      setActionId(null);
      router.refresh();
    });
  }

  function handleRemove(id: string) {
    setActionId(id);
    startTransition(async () => {
      await removeMember(id);
      setActionId(null);
      router.refresh();
    });
  }

  function handleRoleChange(id: string, role: string) {
    setActionId(id);
    startTransition(async () => {
      await updateMemberRole(id, role);
      setActionId(null);
      router.refresh();
    });
  }

  return (
    <>
      {inviteOpen && <InviteModal onClose={() => setInviteOpen(false)} />}

      <div className="space-y-5">
        {/* Tenant info */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-white/40" />
            <h3 className="text-sm font-semibold text-white">Cuenta</h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1">Nombre</p>
              <p className="text-sm text-white">{tenant.name}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1">Slug</p>
              <p className="text-sm text-white/60 font-mono">{tenant.slug}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1">Plan</p>
              <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${PLAN_BADGE[tenant.plan] ?? PLAN_BADGE.free}`}>
                {tenant.plan}
              </span>
            </div>
          </div>
        </div>

        {/* Modules */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-white/40" />
            <h3 className="text-sm font-semibold text-white">Módulos activos</h3>
          </div>
          {modules.length === 0 ? (
            <p className="text-sm text-white/25">Sin módulos habilitados</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {modules.map((m) => (
                <div
                  key={m.module}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                    m.active
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                      : "bg-white/5 border-white/10 text-white/30"
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${m.active ? "bg-emerald-400" : "bg-white/20"}`} />
                  {MODULE_LABELS[m.module] ?? m.module}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team */}
        <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
            <div className="flex items-center gap-2">
              <Users2 className="w-4 h-4 text-white/40" />
              <h3 className="text-sm font-semibold text-white">
                Equipo
                <span className="ml-2 text-xs font-normal text-white/30">
                  {users.length} usuario{users.length !== 1 ? "s" : ""}
                </span>
              </h3>
            </div>
            {canManage && (
              <button
                onClick={() => setInviteOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Invitar
              </button>
            )}
          </div>

          <div className="divide-y divide-white/5">
            {users.map((u) => {
              const RoleIcon = ROLE_ICON[u.role] ?? User;
              const isSelf   = u.id === currentUserId;
              const isOwner  = u.role === "owner";
              const loading  = isPending && actionId === u.id;

              return (
                <div key={u.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white">{u.name}</p>
                      {isSelf && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-white/40">
                          TÚ
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/35">{u.email}</p>
                  </div>

                  {canManage && !isSelf && !isOwner ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={u.role}
                        disabled={loading}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white/60 focus:outline-none focus:border-white/25 cursor-pointer disabled:opacity-40"
                      >
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                      </select>
                      <button
                        disabled={loading}
                        onClick={() => handleRemove(u.id)}
                        className="p-1.5 rounded-lg text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                        title="Eliminar miembro"
                      >
                        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-white/40 shrink-0">
                      <RoleIcon className="w-3.5 h-3.5" />
                      {ROLE_LABEL[u.role] ?? u.role}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pending invitations */}
          {invitations.length > 0 && (
            <>
              <div className="px-5 py-2.5 bg-white/3 border-t border-white/8">
                <p className="text-[10px] font-semibold text-white/25 uppercase tracking-wider">
                  Invitaciones pendientes ({invitations.length})
                </p>
              </div>
              {invitations.map((inv) => {
                const loading = isPending && actionId === inv.id;
                const expired = new Date(inv.expiresAt) < new Date();
                return (
                  <div key={inv.id} className="flex items-center gap-4 px-5 py-3 border-t border-white/5 opacity-70">
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 border-dashed flex items-center justify-center shrink-0">
                      <Clock className="w-3.5 h-3.5 text-white/25" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white/60">{inv.email}</p>
                      <p className="text-xs text-white/25">
                        {ROLE_LABEL[inv.role] ?? inv.role}
                        {" · "}
                        {expired
                          ? <span className="text-red-400/70">Expirada</span>
                          : `vence ${new Date(inv.expiresAt).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}`
                        }
                      </p>
                    </div>
                    {canManage && (
                      <button
                        disabled={loading}
                        onClick={() => handleCancel(inv.id)}
                        className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                        title="Cancelar invitación"
                      >
                        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </>
  );
}
