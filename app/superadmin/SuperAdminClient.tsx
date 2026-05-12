"use client";

import { useState } from "react";

type Tenant = {
  id: string; name: string; slug: string; plan: string;
  active: boolean; onboarded: boolean; createdAt: string;
  userCount: number; bookings: number; orders: number;
  subStatus: string | null; subPlan: string | null;
};

type Stats = { tenantCount: number; userCount: number; bookingCount: number };

const PLAN_COLORS: Record<string, string> = {
  free:       "bg-white/10 text-white/50",
  starter:    "bg-blue-400/15 text-blue-300",
  pro:        "bg-purple-400/15 text-purple-300",
  enterprise: "bg-amber-400/15 text-amber-300",
};

const SUB_COLORS: Record<string, string> = {
  authorized: "text-emerald-400",
  pending:    "text-amber-400",
  cancelled:  "text-red-400",
  expired:    "text-red-400",
  paused:     "text-white/40",
};

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
      <p className="text-xs text-white/40 font-medium uppercase tracking-wide mb-2">{label}</p>
      <p className="text-3xl font-bold text-white">{value.toLocaleString("es-AR")}</p>
    </div>
  );
}

export function SuperAdminClient({ tenants, stats }: { tenants: Tenant[]; stats: Stats }) {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");

  const filtered = tenants.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase())
      || t.slug.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === "all" || t.plan === planFilter;
    return matchSearch && matchPlan;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Panel de Operadores</h1>
        <p className="text-sm text-white/40 mt-1">{stats.tenantCount} tenants registrados</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Tenants" value={stats.tenantCount} />
        <StatCard label="Usuarios" value={stats.userCount} />
        <StatCard label="Turnos" value={stats.bookingCount} />
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text" placeholder="Buscar por nombre o slug…"
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20 transition flex-1 min-w-48"
        />
        <select
          value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
        >
          <option value="all">Todos los planes</option>
          <option value="free">Free</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/8">
              {["Negocio", "Plan", "Suscripción", "Usuarios", "Turnos", "Pedidos", "Onboarded", "Registro"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs text-white/40 font-medium uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-white/25 text-xs">
                  Sin resultados
                </td>
              </tr>
            )}
            {filtered.map((t) => (
              <tr key={t.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-white text-sm">{t.name}</p>
                  <p className="text-xs text-white/30">{t.slug}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${PLAN_COLORS[t.plan] ?? "bg-white/10 text-white/50"}`}>
                    {t.plan}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {t.subStatus ? (
                    <div>
                      <span className={`text-xs font-semibold ${SUB_COLORS[t.subStatus] ?? "text-white/40"}`}>
                        {t.subStatus}
                      </span>
                      {t.subPlan && (
                        <p className="text-[10px] text-white/25">{t.subPlan}</p>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-white/20">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-white/60 text-center">{t.userCount}</td>
                <td className="px-4 py-3 text-white/60 text-center">{t.bookings}</td>
                <td className="px-4 py-3 text-white/60 text-center">{t.orders}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs ${t.onboarded ? "text-emerald-400" : "text-white/20"}`}>
                    {t.onboarded ? "✓" : "—"}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/30 text-xs">
                  {new Date(t.createdAt).toLocaleDateString("es-AR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
