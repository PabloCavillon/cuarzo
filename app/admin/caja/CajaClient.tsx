"use client";

import { useRef, useState, useTransition, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Plus, Edit2, Trash2, TrendingUp, TrendingDown,
  X, Loader2, Wallet, Filter,
} from "lucide-react";
import { createMovimiento, updateMovimiento, deleteMovimiento } from "./actions";

type MovRow = {
  id: string;
  tipo: "ingreso" | "egreso";
  monto: string;
  descripcion: string;
  categoria: string | null;
  metodoPago: string;
  notes: string | null;
  fecha: string;
};

type ModalState = { mode: "create" } | { mode: "edit"; mov: MovRow } | null;
type Filters = { tipo: string; desde: string; hasta: string };

const CATEGORIAS_INGRESO = ["Venta", "Cobro", "Depósito", "Otro"];
const CATEGORIAS_EGRESO  = ["Compra", "Gasto fijo", "Gasto variable", "Retiro", "Proveedor", "Impuesto", "Otro"];
const METODOS_PAGO       = ["efectivo", "transferencia", "tarjeta", "mercadopago", "cheque"];

function fmt(n: number) {
  return n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function MovModal({
  state,
  onClose,
  onSuccess,
}: {
  state: Exclude<ModalState, null>;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const formRef   = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError]    = useState<string | null>(null);
  const [tipo, setTipo]      = useState<"ingreso" | "egreso">(
    state.mode === "edit" ? state.mov.tipo : "ingreso"
  );
  const editing = state.mode === "edit" ? state.mov : undefined;

  function toInputDate(iso: string) {
    return iso.slice(0, 10);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    setError(null);

    startTransition(async () => {
      const result = editing
        ? await updateMovimiento(editing.id, fd)
        : await createMovimiento(fd);
      if (!result.ok) setError(result.error);
      else onSuccess();
    });
  }

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25";
  const categorias = tipo === "ingreso" ? CATEGORIAS_INGRESO : CATEGORIAS_EGRESO;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0d1b2e] border border-white/12 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <h3 className="text-sm font-semibold text-white">
            {editing ? "Editar movimiento" : "Nuevo movimiento"}
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

          {/* Tipo toggle */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Tipo</label>
            <div className="grid grid-cols-2 gap-2">
              {(["ingreso", "egreso"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm border transition-colors ${
                    tipo === t
                      ? t === "ingreso"
                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                        : "bg-red-500/15 border-red-500/30 text-red-300"
                      : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                  }`}
                >
                  {t === "ingreso"
                    ? <TrendingUp className="w-3.5 h-3.5" />
                    : <TrendingDown className="w-3.5 h-3.5" />}
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <input type="hidden" name="tipo" value={tipo} />
          </div>

          {/* Monto */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">
              Monto <span className="text-red-400/70">*</span>
            </label>
            <input
              name="monto"
              type="number"
              min="0.01"
              step="0.01"
              defaultValue={editing ? Number(editing.monto).toFixed(2) : ""}
              required
              placeholder="0.00"
              className={inputCls}
            />
          </div>

          {/* Descripcion */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">
              Descripción <span className="text-red-400/70">*</span>
            </label>
            <input
              name="descripcion"
              defaultValue={editing?.descripcion ?? ""}
              required
              placeholder="ej. Venta al cliente García"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Categoría */}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Categoría</label>
              <select name="categoria" defaultValue={editing?.categoria ?? ""} className={inputCls + " cursor-pointer"}>
                <option value="">Sin categoría</option>
                {categorias.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            {/* Método de pago */}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Método</label>
              <select name="metodoPago" defaultValue={editing?.metodoPago ?? "efectivo"} className={inputCls + " cursor-pointer"}>
                {METODOS_PAGO.map((m) => (
                  <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Fecha</label>
            <input
              name="fecha"
              type="date"
              defaultValue={editing ? toInputDate(editing.fecha) : new Date().toISOString().slice(0, 10)}
              className={inputCls}
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Notas</label>
            <textarea
              name="notes"
              defaultValue={editing?.notes ?? ""}
              rows={2}
              placeholder="Observaciones..."
              className={inputCls + " resize-none"}
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
              {editing ? "Guardar" : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CajaClient({
  movimientos,
  filters: initial,
  totals,
}: {
  movimientos: MovRow[];
  filters: Filters;
  totals: { ingresos: number; egresos: number };
}) {
  const router   = useRouter();
  const pathname = usePathname();
  const [filters, setFilters]        = useState(initial);
  const [modal, setModal]            = useState<ModalState>(null);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId]  = useState<string | null>(null);

  const applyFilters = useCallback(
    (next: Filters) => {
      const params = new URLSearchParams();
      if (next.tipo)  params.set("tipo",  next.tipo);
      if (next.desde) params.set("desde", next.desde);
      if (next.hasta) params.set("hasta", next.hasta);
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname],
  );

  function update<K extends keyof Filters>(key: K, value: string) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    applyFilters(next);
  }

  function clearFilters() {
    setFilters({ tipo: "", desde: "", hasta: "" });
    router.push(pathname);
  }

  function handleDelete(id: string) {
    if (!confirm("¿Eliminar este movimiento?")) return;
    setDeletingId(id);
    startTransition(async () => {
      await deleteMovimiento(id);
      router.refresh();
      setDeletingId(null);
    });
  }

  function handleSuccess() {
    setModal(null);
    router.refresh();
  }

  const saldo   = totals.ingresos - totals.egresos;
  const hasFilters = !!(filters.tipo || filters.desde || filters.hasta);

  const inputCls = "bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25";

  return (
    <>
      <div className="space-y-5">
        {/* Balance cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
            <p className="text-xs text-white/40 mb-1">Ingresos</p>
            <p className="text-xl font-bold text-emerald-400">$ {fmt(totals.ingresos)}</p>
          </div>
          <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
            <p className="text-xs text-white/40 mb-1">Egresos</p>
            <p className="text-xl font-bold text-red-400">$ {fmt(totals.egresos)}</p>
          </div>
          <div className={`border rounded-2xl p-4 ${
            saldo >= 0
              ? "bg-emerald-500/8 border-emerald-500/20"
              : "bg-red-500/8 border-red-500/20"
          }`}>
            <p className="text-xs text-white/40 mb-1">Saldo</p>
            <p className={`text-xl font-bold ${saldo >= 0 ? "text-emerald-300" : "text-red-300"}`}>
              $ {fmt(saldo)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wide mb-1.5">
                Tipo
              </label>
              <select
                value={filters.tipo}
                onChange={(e) => update("tipo", e.target.value)}
                className={inputCls + " cursor-pointer min-w-32"}
              >
                <option value="">Todos</option>
                <option value="ingreso">Ingresos</option>
                <option value="egreso">Egresos</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wide mb-1.5">
                Desde
              </label>
              <input
                type="date"
                value={filters.desde}
                onChange={(e) => update("desde", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wide mb-1.5">
                Hasta
              </label>
              <input
                type="date"
                value={filters.hasta}
                onChange={(e) => update("hasta", e.target.value)}
                className={inputCls}
              />
            </div>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-white/40 hover:text-white text-sm rounded-xl hover:bg-white/8 transition-colors"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Movements list */}
        <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
            <h3 className="text-sm font-semibold text-white">
              Movimientos
              <span className="ml-2 text-xs font-normal text-white/30">
                {movimientos.length} registro{movimientos.length !== 1 ? "s" : ""}
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

          {movimientos.length === 0 ? (
            <div className="py-16 text-center">
              <Wallet className="w-8 h-8 text-white/15 mx-auto mb-3" />
              <p className="text-sm text-white/25 mb-4">
                {hasFilters ? "Sin movimientos para el período" : "Aún no hay movimientos"}
              </p>
              {!hasFilters && (
                <button
                  onClick={() => setModal({ mode: "create" })}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm rounded-xl transition-colors"
                >
                  Registrar primer movimiento
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {movimientos.map((m) => {
                const isDeleting = isPending && deletingId === m.id;
                const monto = parseFloat(m.monto);
                const fechaDate = new Date(m.fecha);
                return (
                  <div
                    key={m.id}
                    className={`flex items-center gap-4 px-5 py-3.5 transition-opacity ${isDeleting ? "opacity-40" : ""}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      m.tipo === "ingreso"
                        ? "bg-emerald-500/15"
                        : "bg-red-500/15"
                    }`}>
                      {m.tipo === "ingreso"
                        ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        : <TrendingDown className="w-3.5 h-3.5 text-red-400" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{m.descripcion}</p>
                      <div className="flex items-center gap-2 text-xs text-white/35 flex-wrap mt-0.5">
                        {m.categoria && <span>{m.categoria}</span>}
                        <span className="capitalize">{m.metodoPago}</span>
                        <span className="text-white/20">·</span>
                        <span>
                          {fechaDate.toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                    </div>

                    <p className={`text-sm font-semibold shrink-0 ${
                      m.tipo === "ingreso" ? "text-emerald-400" : "text-red-400"
                    }`}>
                      {m.tipo === "ingreso" ? "+" : "−"} $ {fmt(monto)}
                    </p>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setModal({ mode: "edit", mov: m })}
                        title="Editar"
                        className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={isDeleting}
                        onClick={() => handleDelete(m.id)}
                        title="Eliminar"
                        className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
        <MovModal
          state={modal}
          onClose={() => setModal(null)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
