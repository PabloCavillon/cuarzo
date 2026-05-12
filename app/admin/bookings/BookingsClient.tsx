"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";

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

type BookingRow = {
  id: string;
  code: string;
  serviceNameSnap: string;
  date: string;
  time: string;
  status: string;
  clientName: string;
  clientEmail: string;
  createdAt: string;
};

type ServiceOption = { id: string; name: string };

type Filters = { q: string; status: string; date: string; service: string };

function formatDate(dateStr: string, timeStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${date.toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" })} · ${timeStr} hs`;
}

export function BookingsClient({
  bookings,
  services,
  filters: initial,
}: {
  bookings: BookingRow[];
  services: ServiceOption[];
  filters: Filters;
}) {
  const router   = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState(initial);

  const applyFilters = useCallback(
    (next: Filters) => {
      const params = new URLSearchParams();
      if (next.q)       params.set("q", next.q);
      if (next.status)  params.set("status", next.status);
      if (next.date)    params.set("date", next.date);
      if (next.service) params.set("service", next.service);
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
    const empty: Filters = { q: "", status: "", date: "", service: "" };
    setFilters(empty);
    router.push(pathname);
  }

  const hasFilters = !!(filters.q || filters.status || filters.date || filters.service);

  return (
    <div className="space-y-5">
      {/* Filter bar */}
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
                placeholder="Nombre, email o código..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/25"
              />
            </div>
          </div>

          <div className="min-w-36">
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wide mb-1.5">
              Estado
            </label>
            <select
              value={filters.status}
              onChange={(e) => update("status", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25 appearance-none cursor-pointer"
            >
              <option value="">Todos</option>
              <option value="confirmed">Confirmado</option>
              <option value="cancelled">Cancelado</option>
              <option value="no_show">No asistió</option>
            </select>
          </div>

          <div className="min-w-36">
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wide mb-1.5">
              Fecha
            </label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => update("date", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25"
            />
          </div>

          {services.length > 0 && (
            <div className="min-w-40">
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wide mb-1.5">
                Servicio
              </label>
              <select
                value={filters.service}
                onChange={(e) => update("service", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25 appearance-none cursor-pointer"
              >
                <option value="">Todos</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-2 pb-px">
            <button
              type="submit"
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm rounded-xl transition-colors"
            >
              Buscar
            </button>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 text-white/40 hover:text-white text-sm rounded-xl hover:bg-white/8 transition-colors"
              >
                Limpiar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Results table */}
      <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <h3 className="text-sm font-semibold text-white">
            Reservas
            <span className="ml-2 text-xs font-normal text-white/30">
              {bookings.length} resultado{bookings.length !== 1 ? "s" : ""}
            </span>
          </h3>
        </div>

        {bookings.length === 0 ? (
          <div className="py-16 text-center">
            <SlidersHorizontal className="w-8 h-8 text-white/15 mx-auto mb-3" />
            <p className="text-sm text-white/25">Sin reservas que coincidan con los filtros</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {bookings.map((b) => (
              <Link
                key={b.id}
                href={`/admin/bookings/${b.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/4 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-white truncate">{b.clientName}</p>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                        STATUS_STYLES[b.status] ?? "bg-white/10 text-white/40"
                      }`}
                    >
                      {STATUS_LABELS[b.status] ?? b.status}
                    </span>
                  </div>
                  <p className="text-xs text-white/35 truncate">
                    {b.serviceNameSnap} · {formatDate(b.date, b.time)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono text-[10px] font-bold text-white/40 bg-white/8 px-2 py-1 rounded-full">
                    {b.code}
                  </span>
                  <p className="text-[10px] text-white/20 mt-1">
                    {new Date(b.createdAt).toLocaleDateString("es-AR")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
