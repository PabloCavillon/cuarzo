import { redirect } from "next/navigation";
import { requireAuth, apiError } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  Calendar, Clock, CheckCircle2, Users, Package,
  Boxes, TrendingUp, TrendingDown, Wallet, FileText,
  ListTodo, AlertTriangle,
} from "lucide-react";
import Link from "next/link";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function weekStart() {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function todayDateStr() {
  return new Date().toISOString().split("T")[0];
}

function weekStartStr() {
  return weekStart().toISOString().split("T")[0];
}

function formatDateTime(dateStr: string, timeStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${date.toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" })} · ${timeStr} hs`;
}

function fmt(n: number) {
  return n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-emerald-500/15 text-emerald-400",
  cancelled: "bg-red-500/15 text-red-400",
  no_show:   "bg-amber-500/15 text-amber-400",
};
const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  no_show:   "No asistió",
};

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, href, Icon, accent,
}: {
  label: string; value: number | string; sub: string;
  href?: string; Icon: React.ComponentType<{ className?: string }>; accent?: string;
}) {
  const inner = (
    <div className={`bg-white/5 border border-white/8 rounded-2xl p-5 h-full transition-colors ${href ? "hover:bg-white/8 hover:border-white/12" : ""}`}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs text-white/40 font-medium uppercase tracking-wide">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent ?? "bg-white/8"}`}>
          <Icon className="w-4 h-4 text-white/50" />
        </div>
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-xs text-white/30">{sub}</p>
    </div>
  );
  return href ? <Link href={href} className="block">{inner}</Link> : <div>{inner}</div>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminDashboard() {
  let user;
  try {
    user = await requireAuth("staff");
  } catch (e) {
    void apiError(e);
    redirect("/login");
  }

  const tid      = user.tenantId;
  const today    = todayDateStr();
  const wkStart  = weekStartStr();
  const { start: todayStart, end: todayEnd } = todayRange();

  const [
    todayBookings,
    weekBookings,
    activeServices,
    upcomingBookings,
    recentBookings,
    clientCount,
    supplierCount,
    productCount,
    lowStockCount,
    cajaToday,
    recentInvoices,
    todayTasks,
  ] = await Promise.all([
    // Bookings
    prisma.turneraBooking.count({ where: { tenantId: tid, date: today, status: "confirmed" } }),
    prisma.turneraBooking.count({ where: { tenantId: tid, date: { gte: wkStart, lte: today }, status: "confirmed" } }),
    prisma.turneraService.count({ where: { tenantId: tid, active: true } }),
    prisma.turneraBooking.findMany({
      where:   { tenantId: tid, date: { gte: today }, status: "confirmed" },
      orderBy: [{ date: "asc" }, { time: "asc" }],
      take: 5,
      select: { id: true, code: true, serviceNameSnap: true, date: true, time: true, clientName: true, status: true },
    }),
    prisma.turneraBooking.findMany({
      where:   { tenantId: tid },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, code: true, serviceNameSnap: true, date: true, time: true, clientName: true, status: true },
    }),
    // CRM
    prisma.client.count({ where: { tenantId: tid, active: true } }),
    prisma.supplier.count({ where: { tenantId: tid, active: true } }),
    // Catalog
    prisma.catalogProduct.count({ where: { tenantId: tid, active: true } }),
    // Low stock (qty = 0 across all items for this tenant)
    prisma.stockItem.count({ where: { tenantId: tid, qty: { lte: 5 } } }),
    // Caja hoy
    prisma.cajaMovimiento.findMany({
      where:  { tenantId: tid, fecha: { gte: todayStart, lte: todayEnd } },
      select: { tipo: true, monto: true },
    }),
    // Recent fiscal invoices
    prisma.fiscalInvoice.findMany({
      where:   { tenantId: tid },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { id: true, tipoComprobante: true, puntoVenta: true, numero: true, receptorNombre: true, amount: true, fecha: true },
    }),
    // Tasks due today or overdue, not done
    prisma.task.findMany({
      where: {
        tenantId: tid,
        status:   { in: ["pending", "in_progress"] },
        dueDate:  { lte: new Date(new Date().setHours(23, 59, 59, 999)) },
      },
      orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
      take: 5,
      select: { id: true, title: true, priority: true, dueDate: true, status: true, assignedTo: { select: { name: true } } },
    }),
  ]);

  const cajaIngresos = cajaToday.filter(m => m.tipo === "ingreso").reduce((a, m) => a + Number(m.monto), 0);
  const cajaEgresos  = cajaToday.filter(m => m.tipo === "egreso").reduce((a, m) => a + Number(m.monto), 0);
  const cajaSaldo    = cajaIngresos - cajaEgresos;

  return (
    <div className="max-w-5xl mx-auto space-y-7">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-bold text-white">
          Hola, {user.name.split(" ")[0]} 👋
        </h2>
        <p className="text-sm text-white/40 mt-0.5">
          {new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* KPI row 1 — Bookings */}
      <div>
        <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-3">Turnos</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Turnos hoy"       value={todayBookings}          sub="Confirmados"     Icon={Calendar}      href="/admin/bookings" />
          <StatCard label="Esta semana"       value={weekBookings}           sub="Desde el lunes"  Icon={Clock}         href="/admin/bookings" />
          <StatCard label="Servicios activos" value={activeServices}         sub="En turnera"      Icon={CheckCircle2}  href="/admin/bookings/services" />
          <StatCard label="Próximos"          value={upcomingBookings.length} sub="Confirmados"    Icon={Calendar}      href="/admin/bookings" />
        </div>
      </div>

      {/* KPI row 2 — Cross-module */}
      <div>
        <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-3">Resumen general</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Clientes activos"  value={clientCount}   sub="Base CRM"        Icon={Users}   href="/admin/clients" />
          <StatCard label="Proveedores"        value={supplierCount} sub="Activos"         Icon={Users}   href="/admin/clients/suppliers" />
          <StatCard label="Productos"          value={productCount}  sub="En catálogo"     Icon={Package} href="/admin/catalog" />
          <StatCard
            label="Stock bajo"
            value={lowStockCount}
            sub="≤ 5 unidades"
            Icon={Boxes}
            href="/admin/stock"
            accent={lowStockCount > 0 ? "bg-amber-500/15" : "bg-white/8"}
          />
        </div>
      </div>

      {/* KPI row 3 — Caja hoy */}
      <div>
        <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-3">Caja hoy</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-emerald-400/60" />
              <p className="text-xs text-white/40 font-medium uppercase tracking-wide">Ingresos</p>
            </div>
            <p className="text-2xl font-bold text-emerald-400">$ {fmt(cajaIngresos)}</p>
          </div>
          <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-4 h-4 text-red-400/60" />
              <p className="text-xs text-white/40 font-medium uppercase tracking-wide">Egresos</p>
            </div>
            <p className="text-2xl font-bold text-red-400">$ {fmt(cajaEgresos)}</p>
          </div>
          <Link href="/admin/caja" className="group bg-white/5 border border-white/8 rounded-2xl p-5 hover:bg-white/8 hover:border-white/12 transition-colors block">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="w-4 h-4 text-white/40" />
              <p className="text-xs text-white/40 font-medium uppercase tracking-wide">Saldo</p>
            </div>
            <p className={`text-2xl font-bold ${cajaSaldo >= 0 ? "text-emerald-300" : "text-red-300"}`}>
              $ {fmt(cajaSaldo)}
            </p>
          </Link>
        </div>
      </div>

      {/* Bottom panels */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming bookings */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Próximos turnos</h3>
            <Link href="/admin/bookings" className="text-xs text-white/40 hover:text-white transition-colors">
              Ver todos →
            </Link>
          </div>
          {upcomingBookings.length === 0 ? (
            <p className="text-sm text-white/25 py-6 text-center">Sin turnos próximos</p>
          ) : (
            <div className="space-y-1">
              {upcomingBookings.map((b) => (
                <Link
                  key={b.id}
                  href={`/admin/bookings/${b.id}`}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{b.clientName}</p>
                    <p className="text-xs text-white/35 truncate">
                      {b.serviceNameSnap} · {formatDateTime(b.date, b.time)}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-white/40 bg-white/8 px-2 py-1 rounded-full shrink-0">
                    {b.code}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent activity + invoices */}
        <div className="space-y-4">
          {/* Recent bookings */}
          <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Actividad reciente</h3>
            </div>
            {recentBookings.length === 0 ? (
              <p className="text-sm text-white/25 py-4 text-center">Sin reservas aún</p>
            ) : (
              <div className="space-y-1">
                {recentBookings.map((b) => (
                  <Link
                    key={b.id}
                    href={`/admin/bookings/${b.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium text-white truncate">{b.clientName}</p>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${STATUS_STYLES[b.status] ?? "bg-white/10 text-white/40"}`}>
                          {STATUS_LABELS[b.status] ?? b.status}
                        </span>
                      </div>
                      <p className="text-xs text-white/35 truncate">
                        {b.serviceNameSnap} · {formatDateTime(b.date, b.time)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent invoices */}
          {recentInvoices.length > 0 && (
            <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Últimos comprobantes</h3>
                <Link href="/admin/billing" className="text-xs text-white/40 hover:text-white transition-colors">
                  Ver todos →
                </Link>
              </div>
              <div className="space-y-1">
                {recentInvoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between gap-3 p-3 rounded-xl">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-3.5 h-3.5 text-white/25 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-white/70 font-mono">
                          F{inv.tipoComprobante} {String(inv.puntoVenta).padStart(4,"0")}-{String(inv.numero).padStart(8,"0")}
                        </p>
                        {inv.receptorNombre && (
                          <p className="text-xs text-white/30 truncate">{inv.receptorNombre}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-white/60 shrink-0">
                      $ {fmt(Number(inv.amount))}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tasks due today / overdue */}
      {todayTasks.length > 0 && (
        <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-white/40" />
              <h3 className="text-sm font-semibold text-white">Tareas para hoy</h3>
            </div>
            <Link href="/admin/tasks" className="text-xs text-white/40 hover:text-white transition-colors">
              Ver todas →
            </Link>
          </div>
          <div className="space-y-1">
            {todayTasks.map((t) => {
              const overdue = t.dueDate && new Date(t.dueDate) < new Date(new Date().setHours(0,0,0,0));
              return (
                <Link
                  key={t.id}
                  href="/admin/tasks"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  {overdue
                    ? <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    : <ListTodo className="w-3.5 h-3.5 text-white/25 shrink-0" />
                  }
                  <p className={`text-sm flex-1 truncate ${overdue ? "text-red-300" : "text-white/70"}`}>
                    {t.title}
                  </p>
                  {t.assignedTo && (
                    <span className="text-[10px] text-white/30 shrink-0">{t.assignedTo.name}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
