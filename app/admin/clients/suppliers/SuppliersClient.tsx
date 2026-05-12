"use client";

import { useRef, useCallback, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Plus, Edit2, Power, PowerOff, Search, Truck, X, Loader2, Mail, Phone, User } from "lucide-react";
import { createSupplier, updateSupplier, toggleSupplier } from "./actions";

type SupplierRow = {
  id: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
};

type ModalState = { mode: "create" } | { mode: "edit"; supplier: SupplierRow } | null;
type Filters = { q: string; inactive: string };

function SupplierModal({
  state,
  onClose,
  onSuccess,
}: {
  state: Exclude<ModalState, null>;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const editing = state.mode === "edit" ? state.supplier : undefined;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    setError(null);

    startTransition(async () => {
      const result = editing
        ? await updateSupplier(editing.id, fd)
        : await createSupplier(fd);
      if (!result.ok) setError(result.error);
      else onSuccess();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0d1b2e] border border-white/12 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <h3 className="text-sm font-semibold text-white">
            {editing ? "Editar proveedor" : "Nuevo proveedor"}
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1 -mr-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">
              Empresa / Nombre <span className="text-red-400/70">*</span>
            </label>
            <input
              name="name"
              defaultValue={editing?.name ?? ""}
              required
              placeholder="ej. Distribuidora Pérez S.A."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Contacto</label>
            <input
              name="contactName"
              defaultValue={editing?.contactName ?? ""}
              placeholder="ej. Juan Pérez"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Email</label>
              <input
                name="email"
                type="email"
                defaultValue={editing?.email ?? ""}
                placeholder="mail@proveedor.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Teléfono</label>
              <input
                name="phone"
                type="tel"
                defaultValue={editing?.phone ?? ""}
                placeholder="+54 11..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Dirección</label>
            <input
              name="address"
              defaultValue={editing?.address ?? ""}
              placeholder="ej. Av. San Martín 500, Córdoba"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Notas</label>
            <textarea
              name="notes"
              defaultValue={editing?.notes ?? ""}
              rows={2}
              placeholder="Condiciones de pago, tiempos de entrega..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/8 text-white/60 hover:text-white text-sm rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/20 text-white text-sm rounded-xl transition-colors disabled:opacity-50"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {editing ? "Guardar cambios" : "Crear proveedor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function SuppliersClient({
  suppliers,
  filters: initial,
}: {
  suppliers: SupplierRow[];
  filters: Filters;
}) {
  const router   = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState(initial);
  const [modal, setModal]            = useState<ModalState>(null);
  const [isPending, startTransition] = useTransition();
  const [togglingId, setTogglingId]  = useState<string | null>(null);

  const applyFilters = useCallback(
    (next: Filters) => {
      const params = new URLSearchParams();
      if (next.q)        params.set("q", next.q);
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
    const empty: Filters = { q: "", inactive: "" };
    setFilters(empty);
    router.push(pathname);
  }

  function handleToggle(id: string, current: boolean) {
    setTogglingId(id);
    startTransition(async () => {
      await toggleSupplier(id, !current);
      router.refresh();
      setTogglingId(null);
    });
  }

  function handleSuccess() {
    setModal(null);
    router.refresh();
  }

  const hasFilters = !!(filters.q || filters.inactive);

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
                  placeholder="Empresa, contacto o email..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/25"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pb-px">
              <label className="flex items-center gap-2 text-sm text-white/50 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!!filters.inactive}
                  onChange={(e) => update("inactive", e.target.checked ? "1" : "")}
                  className="rounded"
                />
                Ver inactivos
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

        {/* Suppliers list */}
        <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
            <h3 className="text-sm font-semibold text-white">
              Proveedores
              <span className="ml-2 text-xs font-normal text-white/30">
                {suppliers.length} registro{suppliers.length !== 1 ? "s" : ""}
              </span>
            </h3>
            <button
              onClick={() => setModal({ mode: "create" })}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Nuevo
            </button>
          </div>

          {suppliers.length === 0 ? (
            <div className="py-16 text-center">
              <Truck className="w-8 h-8 text-white/15 mx-auto mb-3" />
              <p className="text-sm text-white/25 mb-4">
                {hasFilters ? "Sin proveedores que coincidan" : "Aún no hay proveedores"}
              </p>
              {!hasFilters && (
                <button
                  onClick={() => setModal({ mode: "create" })}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm rounded-xl transition-colors"
                >
                  Agregar primer proveedor
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {suppliers.map((s) => {
                const isToggling = isPending && togglingId === s.id;
                return (
                  <div
                    key={s.id}
                    className={`flex items-center gap-4 px-5 py-3.5 transition-opacity ${
                      !s.active ? "opacity-50" : ""
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <Truck className="w-3.5 h-3.5 text-white/50" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium text-white truncate">{s.name}</p>
                        {!s.active && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-white/30 shrink-0">
                            INACTIVO
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-white/35 flex-wrap">
                        {s.contactName && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {s.contactName}
                          </span>
                        )}
                        {s.email && (
                          <span className="flex items-center gap-1 truncate">
                            <Mail className="w-3 h-3 shrink-0" />
                            {s.email}
                          </span>
                        )}
                        {s.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {s.phone}
                          </span>
                        )}
                      </div>
                      {s.notes && (
                        <p className="text-xs text-white/20 italic truncate mt-0.5">{s.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setModal({ mode: "edit", supplier: s })}
                        title="Editar"
                        className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={isToggling}
                        onClick={() => handleToggle(s.id, s.active)}
                        title={s.active ? "Desactivar" : "Activar"}
                        className={`p-2 rounded-lg transition-colors disabled:opacity-40 ${
                          s.active
                            ? "text-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-500/10"
                            : "text-white/20 hover:text-white/50 hover:bg-white/8"
                        }`}
                      >
                        {s.active ? <Power className="w-3.5 h-3.5" /> : <PowerOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {modal && (
        <SupplierModal
          state={modal}
          onClose={() => setModal(null)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
