"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Power, PowerOff, Loader2, X, Warehouse } from "lucide-react";
import { createWarehouse, updateWarehouse, toggleWarehouse } from "./actions";

type WarehouseRow = {
  id: string;
  name: string;
  address: string | null;
  active: boolean;
  itemCount: number;
};

type ModalState = { mode: "create" } | { mode: "edit"; warehouse: WarehouseRow } | null;

function WarehouseModal({
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
  const editing = state.mode === "edit" ? state.warehouse : undefined;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    setError(null);

    startTransition(async () => {
      const result = editing
        ? await updateWarehouse(editing.id, fd)
        : await createWarehouse(fd);
      if (!result.ok) setError(result.error);
      else onSuccess();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0d1b2e] border border-white/12 rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <h3 className="text-sm font-semibold text-white">
            {editing ? "Edit warehouse" : "New warehouse"}
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
              Nombre <span className="text-red-400/70">*</span>
            </label>
            <input
              name="name"
              defaultValue={editing?.name ?? ""}
              required
              placeholder="e.g. Main Warehouse"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Dirección</label>
            <input
              name="address"
              defaultValue={editing?.address ?? ""}
              placeholder="ej. Av. Corrientes 1234, CABA"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25"
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
              {editing ? "Guardar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function WarehousesClient({ warehouses }: { warehouses: WarehouseRow[] }) {
  const router = useRouter();
  const [modal, setModal] = useState<ModalState>(null);
  const [isPending, startTransition] = useTransition();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  function handleSuccess() {
    setModal(null);
    router.refresh();
  }

  function handleToggle(id: string, current: boolean) {
    setTogglingId(id);
    startTransition(async () => {
      await toggleWarehouse(id, !current);
      router.refresh();
      setTogglingId(null);
    });
  }

  return (
    <>
      <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <h3 className="text-sm font-semibold text-white">Depósitos</h3>
          <button
            onClick={() => setModal({ mode: "create" })}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo
          </button>
        </div>

        {warehouses.length === 0 ? (
          <div className="py-16 text-center">
            <Warehouse className="w-8 h-8 text-white/15 mx-auto mb-3" />
            <p className="text-sm text-white/25 mb-4">Sin depósitos creados</p>
            <button
              onClick={() => setModal({ mode: "create" })}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm rounded-xl transition-colors"
            >
              Crear primer depósito
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {warehouses.map((w) => {
              const isToggling = isPending && togglingId === w.id;
              return (
                <div
                  key={w.id}
                  className={`flex items-center gap-4 px-5 py-4 transition-opacity ${!w.active ? "opacity-50" : ""}`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-white">{w.name}</p>
                      {!w.active && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-white/30">
                          INACTIVO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/30">
                      {w.address ?? "No address"}
                      {" · "}
                      {w.itemCount} producto{w.itemCount !== 1 ? "s" : ""} con stock
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setModal({ mode: "edit", warehouse: w })}
                      title="Edit"
                      className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={isToggling}
                      onClick={() => handleToggle(w.id, w.active)}
                      title={w.active ? "Desactivar" : "Activar"}
                      className={`p-2 rounded-lg transition-colors disabled:opacity-40 ${
                        w.active
                          ? "text-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-500/10"
                          : "text-white/20 hover:text-white/50 hover:bg-white/8"
                      }`}
                    >
                      {w.active ? <Power className="w-3.5 h-3.5" /> : <PowerOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modal && (
        <WarehouseModal
          state={modal}
          onClose={() => setModal(null)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
