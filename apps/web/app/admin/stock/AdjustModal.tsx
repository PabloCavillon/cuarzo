"use client";

import { useRef, useState, useTransition } from "react";
import { X, Loader2 } from "lucide-react";
import { adjustStock } from "./actions";

const REASONS = [
  { value: "adjustment",       label: "Ajuste manual" },
  { value: "purchase",         label: "Compra / ingreso" },
  { value: "sale",             label: "Venta manual" },
  { value: "return_customer",  label: "Customer return" },
  { value: "return_supplier",  label: "Supplier return" },
  { value: "damage",           label: "Damage / shrinkage" },
  { value: "initial",          label: "Stock inicial" },
];

type WarehouseStock = { id: string; name: string; qty: number };

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product: { id: string; name: string; sku: string } | null;
  warehouseStocks: WarehouseStock[];
};

export function AdjustModal({ open, onClose, onSuccess, product, warehouseStocks }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>(
    warehouseStocks[0]?.id ?? "",
  );

  if (!open || !product) return null;

  const currentQty =
    warehouseStocks.find((w) => w.id === selectedWarehouseId)?.qty ?? 0;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    setError(null);

    startTransition(async () => {
      const result = await adjustStock(fd);
      if (!result.ok) setError(result.error);
      else onSuccess();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#0d1b2e] border border-white/12 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div>
            <h3 className="text-sm font-semibold text-white">Ajustar stock</h3>
            <p className="text-xs text-white/40 mt-0.5">{product.name} · {product.sku}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1 -mr-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-4">
          <input type="hidden" name="productId" value={product.id} />

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">
              Depósito <span className="text-red-400/70">*</span>
            </label>
            <select
              name="warehouseId"
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/25 appearance-none cursor-pointer"
            >
              {warehouseStocks.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Stock actual</label>
              <div className="bg-white/3 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white/50">
                {currentQty} unid.
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">
                Nuevo stock <span className="text-red-400/70">*</span>
              </label>
              <input
                name="newQty"
                type="number"
                min={0}
                step={1}
                defaultValue={currentQty}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/25"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Motivo</label>
            <select
              name="reason"
              defaultValue="adjustment"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/25 appearance-none cursor-pointer"
            >
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Notas</label>
            <input
              name="notes"
              type="text"
              placeholder="Optional note…"
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
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
