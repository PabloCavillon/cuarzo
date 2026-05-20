"use client";

import { useCallback, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { AdjustModal } from "./AdjustModal";

type WarehouseStock = { id: string; name: string; qty: number };

type ProductStock = {
  id: string;
  name: string;
  sku: string;
  totalQty: number;
  warehouseStocks: WarehouseStock[];
};

type WarehouseOption = { id: string; name: string };
type Filters = { q: string; warehouse: string; low: string };

function qtyColor(qty: number) {
  if (qty === 0) return "text-red-400";
  if (qty <= 5)  return "text-amber-400";
  return "text-emerald-400";
}

export function StockClient({
  products,
  warehouses,
  filters: initial,
}: {
  products: ProductStock[];
  warehouses: WarehouseOption[];
  filters: Filters;
}) {
  const router   = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState(initial);
  const [adjustTarget, setAdjustTarget] = useState<ProductStock | null>(null);
  const [, startTransition] = useTransition();

  const applyFilters = useCallback(
    (next: Filters) => {
      const params = new URLSearchParams();
      if (next.q)         params.set("q", next.q);
      if (next.warehouse) params.set("warehouse", next.warehouse);
      if (next.low)       params.set("low", next.low);
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
    const empty: Filters = { q: "", warehouse: "", low: "" };
    setFilters(empty);
    router.push(pathname);
  }

  function handleSuccess() {
    setAdjustTarget(null);
    startTransition(() => router.refresh());
  }

  const hasFilters = !!(filters.q || filters.warehouse || filters.low);

  return (
    <>
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
                  placeholder="Nombre o SKU..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/25"
                />
              </div>
            </div>

            {warehouses.length > 1 && (
              <div className="min-w-40">
                <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wide mb-1.5">
                  Depósito
                </label>
                <select
                  value={filters.warehouse}
                  onChange={(e) => update("warehouse", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25 appearance-none cursor-pointer"
                >
                  <option value="">Todos</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-3 pb-px">
              <label className="flex items-center gap-2 text-sm text-white/50 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!!filters.low}
                  onChange={(e) => update("low", e.target.checked ? "1" : "")}
                  className="rounded"
                />
                Stock bajo (≤ 5)
              </label>
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

        {/* Stock table */}
        <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
            <h3 className="text-sm font-semibold text-white">
              Inventario
              <span className="ml-2 text-xs font-normal text-white/30">
                {products.length} producto{products.length !== 1 ? "s" : ""}
              </span>
            </h3>
          </div>

          {products.length === 0 ? (
            <div className="py-16 text-center">
              <SlidersHorizontal className="w-8 h-8 text-white/15 mx-auto mb-3" />
              <p className="text-sm text-white/25">
                {hasFilters ? "No matching products" : "Sin productos en el catálogo"}
              </p>
            </div>
          ) : (
            <>
              {/* Header row */}
              <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-2 border-b border-white/5">
                <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wide">Producto</p>
                {warehouses.length > 1 && !filters.warehouse && (
                  <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wide text-right">
                    Por depósito
                  </p>
                )}
                <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wide text-right">
                  <ArrowUpDown className="w-3 h-3 inline" /> Total
                </p>
                <p className="text-[10px] text-white/0 select-none">ajust</p>
              </div>

              <div className="divide-y divide-white/5">
                {products.map((p) => (
                  <div key={p.id} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{p.name}</p>
                      <p className="text-xs text-white/35 font-mono">{p.sku}</p>
                    </div>

                    {/* Per-warehouse breakdown (when multiple warehouses and no filter) */}
                    {warehouses.length > 1 && !filters.warehouse && (
                      <div className="hidden sm:flex gap-3 shrink-0">
                        {p.warehouseStocks.map((ws) => (
                          <div key={ws.id} className="text-right">
                            <p className="text-[10px] text-white/30 truncate max-w-20">{ws.name}</p>
                            <p className={`text-xs font-semibold ${qtyColor(ws.qty)}`}>{ws.qty}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className={`text-base font-bold shrink-0 w-12 text-right ${qtyColor(p.totalQty)}`}>
                      {p.totalQty}
                    </p>

                    <button
                      onClick={() => setAdjustTarget(p)}
                      className="shrink-0 px-3 py-1.5 bg-white/8 hover:bg-white/12 text-white/60 hover:text-white text-xs rounded-lg transition-colors"
                    >
                      Ajustar
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <AdjustModal
        open={adjustTarget !== null}
        product={adjustTarget}
        warehouseStocks={adjustTarget?.warehouseStocks ?? []}
        onClose={() => setAdjustTarget(null)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
