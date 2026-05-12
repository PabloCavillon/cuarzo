"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Search, ShoppingCart, Package } from "lucide-react";

type OrderRow = {
  id: string;
  status: string;
  clientName: string;
  clientEmail: string;
  total: string;
  itemCount: number;
  createdAt: string;
};

type Filters = { q: string; status: string };

const STATUS_STYLES: Record<string, string> = {
  draft:      "bg-white/8 text-white/40",
  confirmed:  "bg-blue-500/15 text-blue-300",
  processing: "bg-amber-500/15 text-amber-300",
  shipped:    "bg-purple-500/15 text-purple-300",
  delivered:  "bg-emerald-500/15 text-emerald-300",
  cancelled:  "bg-red-500/15 text-red-400",
  refunded:   "bg-white/8 text-white/30",
};

const STATUS_ES: Record<string, string> = {
  draft:      "Borrador",
  confirmed:  "Confirmado",
  processing: "En proceso",
  shipped:    "Enviado",
  delivered:  "Entregado",
  cancelled:  "Cancelado",
  refunded:   "Reembolsado",
};

function fmt(n: number) {
  return n.toLocaleString("es-AR", { minimumFractionDigits: 2 });
}

export function OrdersClient({
  orders,
  filters: initial,
}: {
  orders: OrderRow[];
  filters: Filters;
}) {
  const router   = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState(initial);

  const applyFilters = useCallback(
    (next: Filters) => {
      const params = new URLSearchParams();
      if (next.q)      params.set("q",      next.q);
      if (next.status) params.set("status", next.status);
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname],
  );

  function update<K extends keyof Filters>(key: K, value: string) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    if (key !== "q") applyFilters(next);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    applyFilters(filters);
  }

  function clearFilters() {
    setFilters({ q: "", status: "" });
    router.push(pathname);
  }

  const hasFilters = !!(filters.q || filters.status);
  const totalRevenue = orders
    .filter((o) => !["cancelled", "refunded"].includes(o.status))
    .reduce((a, o) => a + parseFloat(o.total), 0);

  return (
    <div className="space-y-5">
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total pedidos",  value: orders.length },
          { label: "Entregados",     value: orders.filter((o) => o.status === "delivered").length },
          { label: "Ingresos",       value: `$ ${fmt(totalRevenue)}` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white/5 border border-white/8 rounded-2xl p-4">
            <p className="text-xs text-white/40 mb-1">{label}</p>
            <p className="text-xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-44">
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wide mb-1.5">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
              <input
                type="text"
                value={filters.q}
                onChange={(e) => update("q", e.target.value)}
                placeholder="Cliente o email..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/25"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wide mb-1.5">Estado</label>
            <select
              value={filters.status}
              onChange={(e) => update("status", e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25 cursor-pointer"
            >
              <option value="">Todos</option>
              {Object.entries(STATUS_ES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm rounded-xl transition-colors">
            Buscar
          </button>
          {hasFilters && (
            <button type="button" onClick={clearFilters} className="px-4 py-2 text-white/40 hover:text-white text-sm rounded-xl hover:bg-white/8 transition-colors">
              Limpiar
            </button>
          )}
        </form>
      </div>

      {/* List */}
      <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <h3 className="text-sm font-semibold text-white">
            Pedidos
            <span className="ml-2 text-xs font-normal text-white/30">
              {orders.length} registro{orders.length !== 1 ? "s" : ""}
            </span>
          </h3>
          <Link
            href="/admin/orders/new"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo pedido
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="py-16 text-center">
            <ShoppingCart className="w-8 h-8 text-white/15 mx-auto mb-3" />
            <p className="text-sm text-white/25 mb-4">
              {hasFilters ? "Sin pedidos que coincidan" : "Aún no hay pedidos"}
            </p>
            {!hasFilters && (
              <Link href="/admin/orders/new" className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm rounded-xl transition-colors">
                <Plus className="w-3.5 h-3.5" />
                Crear primer pedido
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {orders.map((o) => (
              <Link
                key={o.id}
                href={`/admin/orders/${o.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/4 transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center shrink-0">
                  <Package className="w-3.5 h-3.5 text-white/40" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-white truncate">{o.clientName}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${STATUS_STYLES[o.status] ?? "bg-white/8 text-white/40"}`}>
                      {STATUS_ES[o.status] ?? o.status}
                    </span>
                  </div>
                  <p className="text-xs text-white/35 truncate">
                    {o.clientEmail} · {o.itemCount} ítem{o.itemCount !== 1 ? "s" : ""} ·{" "}
                    {new Date(o.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <p className="text-sm font-semibold text-white shrink-0">$ {fmt(parseFloat(o.total))}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
