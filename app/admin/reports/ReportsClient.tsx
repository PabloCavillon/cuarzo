"use client";

import { usePathname, useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type BarPoint = { label: string; ingresos: number; egresos: number };

type KPIs = {
  orderRevenue: number;
  prevRevenue:  number;
  orderCount:   number;
  avgTicket:    number;
  newClients:   number;
  prevClients:  number;
  cajaIngresos: number;
  cajaEgresos:  number;
  invoiceTotal: number;
};

type TopProduct = { sku: string; name: string; revenue: number; qty: number };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function pct(a: number, b: number): { value: string; dir: "up" | "down" | "flat" } {
  if (b === 0) return { value: "—", dir: "flat" };
  const diff = ((a - b) / b) * 100;
  return {
    value: `${diff > 0 ? "+" : ""}${diff.toFixed(1)}%`,
    dir:   diff > 0 ? "up" : diff < 0 ? "down" : "flat",
  };
}

const STATUS_ES: Record<string, string> = {
  draft:      "Borrador",
  confirmed:  "Confirmado",
  processing: "En proceso",
  shipped:    "Enviado",
  delivered:  "Entregado",
  cancelled:  "Cancelado",
  refunded:   "Reembolsado",
};

const STATUS_COLOR: Record<string, string> = {
  draft:      "bg-white/20",
  confirmed:  "bg-blue-400",
  processing: "bg-amber-400",
  shipped:    "bg-purple-400",
  delivered:  "bg-emerald-400",
  cancelled:  "bg-red-400",
  refunded:   "bg-white/30",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Delta({ a, b }: { a: number; b: number }) {
  const { value, dir } = pct(a, b);
  const cls =
    dir === "up"   ? "text-emerald-400" :
    dir === "down" ? "text-red-400"     :
                     "text-white/30";
  return <span className={`text-xs font-medium ${cls}`}>{value} vs período ant.</span>;
}

function BarChart({ bars }: { bars: BarPoint[] }) {
  if (bars.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center">
        <p className="text-xs text-white/25">Sin movimientos en el período</p>
      </div>
    );
  }

  const maxVal = Math.max(...bars.map(b => Math.max(b.ingresos, b.egresos)), 1);

  // Only show every Nth label to avoid crowding
  const step = bars.length > 20 ? Math.ceil(bars.length / 10) : 1;

  return (
    <div className="space-y-2">
      {/* Legend */}
      <div className="flex items-center gap-4 justify-end">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400/70" />
          <span className="text-[10px] text-white/40">Ingresos</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-red-400/50" />
          <span className="text-[10px] text-white/40">Egresos</span>
        </div>
      </div>

      {/* Chart area */}
      <div className="flex items-end gap-0.5 h-40 w-full">
        {bars.map((b, i) => {
          const hI = Math.max(2, (b.ingresos / maxVal) * 100);
          const hE = Math.max(b.egresos > 0 ? 2 : 0, (b.egresos / maxVal) * 100);
          return (
            <div
              key={i}
              className="flex-1 flex items-end gap-px group relative"
              title={`${b.label}\nIngresos: $${fmt(b.ingresos)}\nEgresos: $${fmt(b.egresos)}`}
            >
              <div
                style={{ height: `${hI}%` }}
                className="flex-1 bg-emerald-400/50 group-hover:bg-emerald-400/80 rounded-t transition-colors"
              />
              <div
                style={{ height: `${hE}%` }}
                className="flex-1 bg-red-400/35 group-hover:bg-red-400/60 rounded-t transition-colors"
              />
            </div>
          );
        })}
      </div>

      {/* X-axis labels */}
      <div className="flex items-start gap-0.5 w-full overflow-hidden">
        {bars.map((b, i) => (
          <div key={i} className="flex-1 text-center">
            {i % step === 0 && (
              <span className="text-[9px] text-white/25 leading-none block truncate">{b.label}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const PERIODS = [
  { key: "30d",  label: "30 días"   },
  { key: "90d",  label: "90 días"   },
  { key: "ytd",  label: "Este año"  },
] as const;

export function ReportsClient({
  period,
  bars,
  kpis,
  statusCounts,
  topProducts,
  totalOrders,
}: {
  period:       "30d" | "90d" | "ytd";
  bars:         BarPoint[];
  kpis:         KPIs;
  statusCounts: Record<string, number>;
  topProducts:  TopProduct[];
  totalOrders:  number;
}) {
  const router   = useRouter();
  const pathname = usePathname();

  function setPeriod(p: string) {
    router.push(`${pathname}?period=${p}`);
  }

  const maxProductRevenue = Math.max(...topProducts.map(p => p.revenue), 1);

  return (
    <div className="space-y-5">
      {/* Period selector */}
      <div className="flex gap-1.5 p-1 bg-white/5 border border-white/8 rounded-2xl w-fit">
        {PERIODS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              period === key
                ? "bg-white/15 text-white"
                : "text-white/40 hover:text-white hover:bg-white/8"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue from orders */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
          <p className="text-xs text-white/40 font-medium uppercase tracking-wide mb-3">Facturación (pedidos)</p>
          <p className="text-2xl font-bold text-white mb-1">$ {fmt(kpis.orderRevenue)}</p>
          <Delta a={kpis.orderRevenue} b={kpis.prevRevenue} />
        </div>

        {/* Orders count */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
          <p className="text-xs text-white/40 font-medium uppercase tracking-wide mb-3">Pedidos activos</p>
          <p className="text-2xl font-bold text-white mb-1">{kpis.orderCount}</p>
          <span className="text-xs text-white/30">
            Ticket prom. $ {fmt(kpis.avgTicket)}
          </span>
        </div>

        {/* Caja balance */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
          <p className="text-xs text-white/40 font-medium uppercase tracking-wide mb-3">Saldo caja</p>
          <p className={`text-2xl font-bold mb-1 ${kpis.cajaIngresos - kpis.cajaEgresos >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            $ {fmt(kpis.cajaIngresos - kpis.cajaEgresos)}
          </p>
          <span className="text-xs text-white/30">
            {fmt(kpis.cajaIngresos)} − {fmt(kpis.cajaEgresos)}
          </span>
        </div>

        {/* New clients */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
          <p className="text-xs text-white/40 font-medium uppercase tracking-wide mb-3">Clientes nuevos</p>
          <p className="text-2xl font-bold text-white mb-1">{kpis.newClients}</p>
          <Delta a={kpis.newClients} b={kpis.prevClients} />
        </div>
      </div>

      {/* Bar chart */}
      <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-white">Caja — ingresos vs egresos</h3>
          <div className="text-right">
            <p className="text-xs text-emerald-400 font-semibold">↑ $ {fmt(kpis.cajaIngresos)}</p>
            <p className="text-xs text-red-400">↓ $ {fmt(kpis.cajaEgresos)}</p>
          </div>
        </div>
        <BarChart bars={bars} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Orders by status */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-5">
            Pedidos por estado
            <span className="ml-2 text-xs font-normal text-white/30">{totalOrders} total</span>
          </h3>
          {totalOrders === 0 ? (
            <p className="text-xs text-white/25 py-6 text-center">Sin pedidos en el período</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(statusCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([status, count]) => {
                  const w = (count / totalOrders) * 100;
                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-white/60">{STATUS_ES[status] ?? status}</span>
                        <span className="text-xs font-semibold text-white/80">
                          {count} <span className="text-white/30 font-normal">({w.toFixed(0)}%)</span>
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${w}%` }}
                          className={`h-full rounded-full ${STATUS_COLOR[status] ?? "bg-white/20"}`}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Top products */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-5">Top productos por ingresos</h3>
          {topProducts.length === 0 ? (
            <p className="text-xs text-white/25 py-6 text-center">Sin ventas en el período</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => {
                const w = (p.revenue / maxProductRevenue) * 100;
                return (
                  <div key={p.sku}>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-white/25 w-4 text-right shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-xs text-white/70 truncate">{p.name}</span>
                        </div>
                        <p className="text-[10px] text-white/30 ml-5.5">{p.qty} uds.</p>
                      </div>
                      <span className="text-xs font-semibold text-white shrink-0">
                        $ {fmt(p.revenue)}
                      </span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden ml-5.5">
                      <div
                        style={{ width: `${w}%` }}
                        className="h-full rounded-full bg-white/30"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Billing summary */}
      {kpis.invoiceTotal > 0 && (
        <div className="bg-white/5 border border-white/8 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/40 font-medium uppercase tracking-wide mb-1">
              Facturación ARCA en el período
            </p>
            <p className="text-2xl font-bold text-white">$ {fmt(kpis.invoiceTotal)}</p>
          </div>
          <a
            href="/admin/billing"
            className="text-xs text-white/40 hover:text-white transition-colors"
          >
            Ver comprobantes →
          </a>
        </div>
      )}
    </div>
  );
}
