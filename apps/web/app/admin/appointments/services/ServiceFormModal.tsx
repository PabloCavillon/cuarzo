"use client";

import { useRef, useState, useTransition } from "react";
import { X, Loader2 } from "lucide-react";
import { createService, updateService } from "./actions";

type ServiceData = {
  id: string;
  name: string;
  description: string | null;
  durationMin: number;
  price: string;
  sortOrder: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editing?: ServiceData;
};

export function ServiceFormModal({ open, onClose, onSuccess, editing }: Props) {
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
        ? await updateService(editing.id, fd)
        : await createService(fd);

      if (!result.ok) {
        setError(result.error);
      } else {
        onSuccess();
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-[#0d1b2e] border border-white/12 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <h3 className="text-sm font-semibold text-white">
            {editing ? "Edit service" : "New service"}
          </h3>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors p-1 -mr-1"
          >
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
              placeholder="ej. Corte de cabello"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Descripción</label>
            <textarea
              name="description"
              defaultValue={editing?.description ?? ""}
              rows={2}
              placeholder="Optional description…"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">
                Duración (min) <span className="text-red-400/70">*</span>
              </label>
              <input
                name="durationMin"
                type="number"
                min={5}
                step={5}
                defaultValue={editing?.durationMin ?? 30}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/25"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Precio ($)</label>
              <input
                name="price"
                type="number"
                min={0}
                step={0.01}
                defaultValue={editing ? Number(editing.price) : 0}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/25"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">
              Orden de visualización
            </label>
            <input
              name="sortOrder"
              type="number"
              min={0}
              step={1}
              defaultValue={editing?.sortOrder ?? 0}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/25"
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
              {editing ? "Save changes" : "Create service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
