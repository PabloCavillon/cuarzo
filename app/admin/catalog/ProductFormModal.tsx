"use client";

import { useRef, useState, useTransition } from "react";
import { X, Loader2 } from "lucide-react";
import { createProduct, updateProduct } from "./actions";

type CategoryOption = { id: string; name: string; parentName: string | null };

type ProductData = {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  basePrice: string;
  categoryId: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editing?: ProductData;
  categories: CategoryOption[];
};

export function ProductFormModal({ open, onClose, onSuccess, editing, categories }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    setError(null);

    startTransition(async () => {
      const result = editing
        ? await updateProduct(editing.id, fd)
        : await createProduct(fd);

      if (!result.ok) {
        setError(result.error);
      } else {
        onSuccess();
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#0d1b2e] border border-white/12 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <h3 className="text-sm font-semibold text-white">
            {editing ? "Editar producto" : "Nuevo producto"}
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

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-white/50 mb-1.5">
                Nombre <span className="text-red-400/70">*</span>
              </label>
              <input
                name="name"
                defaultValue={editing?.name ?? ""}
                required
                placeholder="ej. Remera básica"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">
                SKU <span className="text-red-400/70">*</span>
              </label>
              <input
                name="sku"
                defaultValue={editing?.sku ?? ""}
                required
                placeholder="ej. REM-001"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">
                Precio base ($) <span className="text-red-400/70">*</span>
              </label>
              <input
                name="basePrice"
                type="number"
                min={0}
                step={0.01}
                defaultValue={editing ? Number(editing.basePrice) : 0}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/25"
              />
            </div>
          </div>

          {categories.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Categoría</label>
              <select
                name="categoryId"
                defaultValue={editing?.categoryId ?? ""}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/25 appearance-none cursor-pointer"
              >
                <option value="">Sin categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.parentName ? `${c.parentName} › ${c.name}` : c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Descripción</label>
            <textarea
              name="description"
              defaultValue={editing?.description ?? ""}
              rows={2}
              placeholder="Descripción opcional..."
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
              {editing ? "Guardar cambios" : "Crear producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
