"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ExternalLink, Loader2, Users, Package, CheckCircle2, XCircle } from "lucide-react";

type TenantRow = {
  id:        string;
  name:      string;
  slug:      string;
  plan:      string;
  active:    boolean;
  onboarded: boolean;
  createdAt: string;
  users:     number;
  modules:   number;
};

const PLAN_COLOR: Record<string, string> = {
  free:       "bg-white/8 text-white/50",
  starter:    "bg-blue-500/15 text-blue-300",
  pro:        "bg-purple-500/15 text-purple-300",
  enterprise: "bg-amber-500/15 text-amber-300",
};

export function SuperAdminClient({
  tenants,
  currentViewTenantId,
}: {
  tenants:              TenantRow[];
  currentViewTenantId:  string | null;
}) {
  const router                      = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId]    = useState<string | null>(null);

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

  async function clearView() {
    await fetch("/api/super-admin/view-tenant", { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {currentViewTenantId && (
        <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-400" />
            <p className="text-sm text-amber-300 font-medium">
              Estás viendo como otro tenant
            </p>
          </div>
          <button
            onClick={clearView}
            className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors"
          >
            <EyeOff className="w-3.5 h-3.5" />
            Volver a mi cuenta
          </button>
        </div>
      )}

      <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[1fr_80px_60px_60px_80px_120px] gap-4 px-5 py-3 border-b border-white/8">
          {["Tenant", "Plan", "Users", "Mods", "Estado", ""].map((h) => (
            <p key={h} className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">{h}</p>
          ))}
        </div>

        <div className="divide-y divide-white/5">
          {tenants.map((t) => {
            const isViewing = t.id === currentViewTenantId;
            const loading   = isPending && loadingId === t.id;
            return (
              <div
                key={t.id}
                className={`grid grid-cols-[1fr_80px_60px_60px_80px_120px] gap-4 items-center px-5 py-3.5 transition-colors ${
                  isViewing ? "bg-amber-500/5" : "hover:bg-white/3"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white truncate">{t.name}</p>
                    {isViewing && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded-full shrink-0">
                        VIENDO
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-white/30 font-mono mt-0.5">{t.slug}</p>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize w-fit ${PLAN_COLOR[t.plan] ?? PLAN_COLOR.free}`}>
                  {t.plan}
                </span>

                <div className="flex items-center gap-1 text-xs text-white/50">
                  <Users className="w-3 h-3" />
                  {t.users}
                </div>

                <div className="flex items-center gap-1 text-xs text-white/50">
                  <Package className="w-3 h-3" />
                  {t.modules}
                </div>

                <div className="flex items-center gap-1.5">
                  {t.active
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    : <XCircle className="w-3.5 h-3.5 text-red-400" />}
                  <span className={`text-[10px] ${t.active ? "text-emerald-400" : "text-red-400"}`}>
                    {t.active ? (t.onboarded ? "Activo" : "Onboarding") : "Inactivo"}
                  </span>
                </div>

                <div className="flex items-center gap-1 justify-end">
                  <button
                    onClick={() => viewAs(t.id)}
                    disabled={isPending || isViewing}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/8 hover:bg-white/14 text-white/60 hover:text-white text-[11px] transition-colors disabled:opacity-40"
                    title="Ver como este tenant"
                  >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />}
                    Ver
                  </button>
                  <a
                    href={`/tienda/${t.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-colors"
                    title="Ver tienda pública"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
