import { redirect } from "next/navigation";
import { requireAuth, apiError } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ReportsClient } from "./ReportsClient";

type SP = Promise<Record<string, string | undefined>>;

// ─── Aggregation helpers ──────────────────────────────────────────────────────

type BarPoint = { label: string; ingresos: number; egresos: number };

function groupDaily(
  movs: { tipo: string; monto: { toString(): string }; fecha: Date }[],
  since: Date,
): BarPoint[] {
  const map: Record<string, { ingresos: number; egresos: number }> = {};
  const today = new Date();
  for (const d = new Date(since); d <= today; d.setDate(d.getDate() + 1)) {
    map[d.toISOString().split("T")[0]] = { ingresos: 0, egresos: 0 };
  }
  for (const m of movs) {
    const key = new Date(m.fecha).toISOString().split("T")[0];
    if (!map[key]) continue;
    const v = Number(m.monto.toString());
    if (m.tipo === "ingreso") map[key].ingresos += v;
    else                      map[key].egresos  += v;
  }
  return Object.entries(map).map(([iso, v]) => {
    const d = new Date(iso + "T12:00:00");
    return {
      label: d.toLocaleDateString("es-AR", { day: "numeric", month: "short" }),
      ...v,
    };
  });
}

function groupWeekly(
  movs: { tipo: string; monto: { toString(): string }; fecha: Date }[],
): BarPoint[] {
  const map: Record<string, { ingresos: number; egresos: number; label: string }> = {};
  for (const m of movs) {
    const d     = new Date(m.fecha);
    const day   = d.getDay();
    const diff  = day === 0 ? -6 : 1 - day;
    const mon   = new Date(d);
    mon.setDate(d.getDate() + diff);
    mon.setHours(0, 0, 0, 0);
    const key   = mon.toISOString().split("T")[0];
    if (!map[key]) {
      map[key] = {
        ingresos: 0,
        egresos:  0,
        label:    mon.toLocaleDateString("es-AR", { day: "numeric", month: "short" }),
      };
    }
    const v = Number(m.monto.toString());
    if (m.tipo === "ingreso") map[key].ingresos += v;
    else                      map[key].egresos  += v;
  }
  return Object.values(map).sort((a, b) => a.label.localeCompare(b.label));
}

function groupMonthly(
  movs: { tipo: string; monto: { toString(): string }; fecha: Date }[],
): BarPoint[] {
  const map: Record<string, { ingresos: number; egresos: number }> = {};
  for (const m of movs) {
    const d   = new Date(m.fecha);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!map[key]) map[key] = { ingresos: 0, egresos: 0 };
    const v = Number(m.monto.toString());
    if (m.tipo === "ingreso") map[key].ingresos += v;
    else                      map[key].egresos  += v;
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, v]) => {
      const [year, month] = key.split("-").map(Number);
      return {
        label: new Date(year, month - 1, 1).toLocaleDateString("es-AR", { month: "short", year: "2-digit" }),
        ...v,
      };
    });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ReportsPage({ searchParams }: { searchParams: SP }) {
  let user;
  try {
    user = await requireAuth("staff");
  } catch (e) {
    void apiError(e);
    redirect("/login");
  }

  const sp     = await searchParams;
  const period = (sp.period ?? "30d") as "30d" | "90d" | "ytd";
  const tid    = user.tenantId;

  const now   = new Date();
  let since: Date;
  if (period === "ytd") {
    since = new Date(now.getFullYear(), 0, 1);
  } else if (period === "90d") {
    since = new Date(now);
    since.setDate(now.getDate() - 90);
  } else {
    since = new Date(now);
    since.setDate(now.getDate() - 30);
  }

  // Previous period for comparison
  const periodMs  = now.getTime() - since.getTime();
  const prevSince = new Date(since.getTime() - periodMs);
  const prevUntil = since;

  const [
    cajaMovs,
    orders,
    orderItems,
    prevOrders,
    newClients,
    prevClients,
    invoices,
  ] = await Promise.all([
    prisma.cajaMovimiento.findMany({
      where:   { tenantId: tid, fecha: { gte: since } },
      select:  { tipo: true, monto: true, fecha: true },
      orderBy: { fecha: "asc" },
    }),
    prisma.order.findMany({
      where:   { tenantId: tid, createdAt: { gte: since } },
      select:  { status: true, total: true },
    }),
    prisma.orderItem.findMany({
      where: {
        order: {
          tenantId:  tid,
          createdAt: { gte: since },
          status:    { notIn: ["cancelled", "refunded"] },
        },
      },
      select: { skuSnap: true, nameSnap: true, qty: true, unitPrice: true },
    }),
    prisma.order.findMany({
      where:  { tenantId: tid, createdAt: { gte: prevSince, lt: prevUntil } },
      select: { total: true },
    }),
    prisma.orderClient.count({ where: { tenantId: tid, createdAt: { gte: since } } }),
    prisma.orderClient.count({ where: { tenantId: tid, createdAt: { gte: prevSince, lt: prevUntil } } }),
    prisma.fiscalInvoice.findMany({
      where:  { tenantId: tid, createdAt: { gte: since } },
      select: { amount: true, tipoComprobante: true },
    }),
  ]);

  // ── Aggregations ────────────────────────────────────────────────────────────

  const bars: BarPoint[] =
    period === "ytd" ? groupMonthly(cajaMovs) :
    period === "90d" ? groupWeekly(cajaMovs)  :
                       groupDaily(cajaMovs, since);

  const cajaIngresos = cajaMovs.filter(m => m.tipo === "ingreso").reduce((a, m) => a + Number(m.monto), 0);
  const cajaEgresos  = cajaMovs.filter(m => m.tipo === "egreso") .reduce((a, m) => a + Number(m.monto), 0);

  const activeOrders  = orders.filter(o => !["cancelled", "refunded"].includes(o.status));
  const orderRevenue  = activeOrders.reduce((a, o) => a + Number(o.total.toString()), 0);
  const prevRevenue   = prevOrders.reduce((a, o) => a + Number(o.total.toString()), 0);
  const avgTicket     = activeOrders.length > 0 ? orderRevenue / activeOrders.length : 0;

  const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  // Top products by revenue
  const productMap: Record<string, { name: string; revenue: number; qty: number }> = {};
  for (const it of orderItems) {
    const rev = it.qty * Number(it.unitPrice.toString());
    if (!productMap[it.skuSnap]) productMap[it.skuSnap] = { name: it.nameSnap, revenue: 0, qty: 0 };
    productMap[it.skuSnap].revenue += rev;
    productMap[it.skuSnap].qty     += it.qty;
  }
  const topProducts = Object.entries(productMap)
    .map(([sku, v]) => ({ sku, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const invoiceTotal = invoices.reduce((a, i) => a + Number(i.amount.toString()), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">Reportes</h2>
        <p className="text-sm text-white/40 mt-0.5">Análisis de rendimiento del negocio</p>
      </div>

      <ReportsClient
        period={period}
        bars={bars}
        kpis={{
          orderRevenue,
          prevRevenue,
          orderCount:    activeOrders.length,
          avgTicket,
          newClients,
          prevClients,
          cajaIngresos,
          cajaEgresos,
          invoiceTotal,
        }}
        statusCounts={statusCounts}
        topProducts={topProducts}
        totalOrders={orders.length}
      />
    </div>
  );
}
