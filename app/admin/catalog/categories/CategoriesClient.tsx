"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, X, Loader2, FolderOpen } from "lucide-react";
import { createCategory, updateCategory, deleteCategory } from "./actions";

type CategoryRow = {
  id: string;
  name: string;
  parentId: string | null;
  parentName: string | null;
  productCount: number;
  childCount: number;
};

type ModalState =
  | { mode: "create" }
  | { mode: "edit"; category: CategoryRow }
  | null;

function CategoryModal({
  state,
  categories,
  onClose,
  onSuccess,
}: {
  state: Exclude<ModalState, null>;
  categories: CategoryRow[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const editing = state.mode === "edit" ? state.category : undefined;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    setError(null);

    startTransition(async () => {
      const result = editing
        ? await updateCategory(editing.id, fd)
        : await createCategory(fd);

      if (!result.ok) setError(result.error);
      else onSuccess();
    });
  }

  const parentOptions = categories.filter((c) => c.id !== editing?.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0d1b2e] border border-white/12 rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <h3 className="text-sm font-semibold text-white">
            {editing ? "Editar categoría" : "Nueva categoría"}
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
              placeholder="ej. Indumentaria"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25"
            />
          </div>

          {parentOptions.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Categoría padre</label>
              <select
                name="parentId"
                defaultValue={editing?.parentId ?? ""}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/25 appearance-none cursor-pointer"
              >
                <option value="">Sin padre (raíz)</option>
                {parentOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.parentName ? `${c.parentName} › ${c.name}` : c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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

export function CategoriesClient({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [modal, setModal] = useState<ModalState>(null);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function handleSuccess() {
    setModal(null);
    router.refresh();
  }

  function handleDelete(id: string) {
    setDeletingId(id);
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteCategory(id);
      if (!result.ok) setDeleteError(result.error);
      else router.refresh();
      setDeletingId(null);
    });
  }

  return (
    <>
      <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <h3 className="text-sm font-semibold text-white">Categorías</h3>
          <button
            onClick={() => setModal({ mode: "create" })}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Nueva
          </button>
        </div>

        {deleteError && (
          <div className="mx-5 mt-4">
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              {deleteError}
            </p>
          </div>
        )}

        {categories.length === 0 ? (
          <div className="py-16 text-center">
            <FolderOpen className="w-8 h-8 text-white/15 mx-auto mb-3" />
            <p className="text-sm text-white/25 mb-4">Aún no hay categorías</p>
            <button
              onClick={() => setModal({ mode: "create" })}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm rounded-xl transition-colors"
            >
              Crear primera categoría
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {c.parentName && (
                      <span className="text-xs text-white/25">{c.parentName} ›</span>
                    )}
                    <p className="text-sm font-medium text-white">{c.name}</p>
                  </div>
                  <p className="text-xs text-white/30 mt-0.5">
                    {c.productCount} producto{c.productCount !== 1 ? "s" : ""}
                    {c.childCount > 0 && ` · ${c.childCount} subcategoría${c.childCount !== 1 ? "s" : ""}`}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setModal({ mode: "edit", category: c })}
                    title="Editar"
                    className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={isPending && deletingId === c.id}
                    onClick={() => handleDelete(c.id)}
                    title="Eliminar"
                    className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                  >
                    {isPending && deletingId === c.id
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Trash2 className="w-3.5 h-3.5" />
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <CategoryModal
          state={modal}
          categories={categories}
          onClose={() => setModal(null)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
