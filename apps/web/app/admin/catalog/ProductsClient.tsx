"use client";

import { useCallback, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Plus, Edit2, Power, PowerOff, Search, Tag } from "lucide-react";
import { ProductFormModal } from "./ProductFormModal";
import { toggleProduct } from "./actions";

type ProductRow = {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  basePrice: string;
  active: boolean;
  categoryId: string | null;
  categoryName: string | null;
  variantCount: number;
};

type CategoryOption = { id: string; name: string; parentName: string | null };
type Filters = { q: string; category: string; inactive: string };

export function ProductsClient({
  products,
  categories,
  filters: initial,
}: {
  products: ProductRow[];
  categories: CategoryOption[];
  filters: Filters;
}) {
  const router   = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState(initial);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState<ProductRow | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const applyFilters = useCallback(
    (next: Filters) => {
      const params = new URLSearchParams();
      if (next.q)        params.set("q", next.q);
      if (next.category) params.set("category", next.category);
      if (next.inactive) params.set("inactive", next.inactive);
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
    const empty: Filters = { q: "", category: "", inactive: "" };
    setFilters(empty);
    router.push(pathname);
  }

  function handleToggle(id: string, current: boolean) {
    setTogglingId(id);
    startTransition(async () => {
      await toggleProduct(id, !current);
      router.refresh();
      setTogglingId(null);
    });
  }

  function openCreate() {
    setEditing(undefined);
    setModalOpen(true);
  }

  function openEdit(p: ProductRow) {
    setEditing(p);
    setModalOpen(true);
  }

  function handleSuccess() {
    setModalOpen(false);
    setEditing(undefined);
    router.refresh();
  }

  const hasFilters = !!(filters.q || filters.category || filters.inactive);

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

            {categories.length > 0 && (
              <div className="min-w-40">
                <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wide mb-1.5">
                  Categoría
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => update("category", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25 appearance-none cursor-pointer"
                >
                  <option value="">Todas</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.parentName ? `${c.parentName} › ${c.name}` : c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-3 pb-px">
              <label className="flex items-center gap-2 text-sm text-white/50 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!!filters.inactive}
                  onChange={(e) => update("inactive", e.target.checked ? "1" : "")}
                  className="rounded"
                />
                Show inactive
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

        {/* Products table */}
        <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
            <h3 className="text-sm font-semibold text-white">
              Productos
              <span className="ml-2 text-xs font-normal text-white/30">
                {products.length} resultado{products.length !== 1 ? "s" : ""}
              </span>
            </h3>
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Nuevo
            </button>
          </div>

          {products.length === 0 ? (
            <div className="py-16 text-center">
              <Tag className="w-8 h-8 text-white/15 mx-auto mb-3" />
              <p className="text-sm text-white/25 mb-4">
                {hasFilters ? "No matching products" : "No products yet"}
              </p>
              {!hasFilters && (
                <button
                  onClick={openCreate}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm rounded-xl transition-colors"
                >
                  Create first product
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {products.map((p) => {
                const price = parseFloat(p.basePrice);
                const isToggling = isPending && togglingId === p.id;

                return (
                  <div
                    key={p.id}
                    className={`flex items-center gap-4 px-5 py-3.5 transition-opacity ${
                      !p.active ? "opacity-50" : ""
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium text-white truncate">{p.name}</p>
                        {!p.active && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-white/30 shrink-0">
                            INACTIVO
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-white/35">
                        <span className="font-mono">{p.sku}</span>
                        {p.categoryName && (
                          <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {p.categoryName}
                          </span>
                        )}
                        {p.variantCount > 0 && (
                          <span>{p.variantCount} variante{p.variantCount !== 1 ? "s" : ""}</span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm font-medium text-white/70 shrink-0">
                      ${price.toLocaleString("es-AR")}
                    </p>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEdit(p)}
                        title="Edit"
                        className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={isToggling}
                        onClick={() => handleToggle(p.id, p.active)}
                        title={p.active ? "Desactivar" : "Activar"}
                        className={`p-2 rounded-lg transition-colors disabled:opacity-40 ${
                          p.active
                            ? "text-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-500/10"
                            : "text-white/20 hover:text-white/50 hover:bg-white/8"
                        }`}
                      >
                        {p.active ? (
                          <Power className="w-3.5 h-3.5" />
                        ) : (
                          <PowerOff className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ProductFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        editing={editing}
        categories={categories}
      />
    </>
  );
}
