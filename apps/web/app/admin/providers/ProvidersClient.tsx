"use client";

import { useRef, useCallback, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Plus, Edit2, Power, PowerOff, Search, Truck, X, Loader2, Mail, Phone, User } from "lucide-react";
import { useT } from "@/lib/i18n/provider";
import { createProvider, updateProvider, toggleProvider } from "./actions";

type ProviderRow = {
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

type ModalState = { mode: "create" } | { mode: "edit"; provider: ProviderRow } | null;
type Filters = { q: string; inactive: string };

function ProviderModal({
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
  const editing = state.mode === "edit" ? state.provider : undefined;
  const t = useT();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    setError(null);

    startTransition(async () => {
      const result = editing
        ? await updateProvider(editing.id, fd)
        : await createProvider(fd);
      if (!result.ok) setError(result.error);
      else onSuccess();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[#0f1f3d] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">
            {editing ? "Edit Provider" : "New Provider"}
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="space-y-3">
            <div>
              <label className="text-xs text-white/50 mb-1 block">Company Name *</label>
              <input
                name="name"
                defaultValue={editing?.name ?? ""}
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                placeholder="Provider name"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Contact Name</label>
              <input
                name="contactName"
                defaultValue={editing?.contactName ?? ""}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                placeholder="Contact person"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/50 mb-1 block">Email</label>
                <input
                  name="email"
                  type="email"
                  defaultValue={editing?.email ?? ""}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Phone</label>
                <input
                  name="phone"
                  defaultValue={editing?.phone ?? ""}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                  placeholder="+1 234 567 890"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Address</label>
              <input
                name="address"
                defaultValue={editing?.address ?? ""}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                placeholder="Street address"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Notes</label>
              <textarea
                name="notes"
                defaultValue={editing?.notes ?? ""}
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 resize-none"
                placeholder="Internal notes..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm text-white/60 border border-white/10 hover:bg-white/5 transition-colors"
            >
              {t.admin.common.cancel}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {editing ? "Save Changes" : "Create Provider"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ProvidersClient({
  providers: initialProviders,
  filters,
}: {
  providers: ProviderRow[];
  filters: Filters;
}) {
  const router  = useRouter();
  const pathname = usePathname();
  const [modal, setModal] = useState<ModalState>(null);
  const [isPending, startTransition] = useTransition();

  const applyFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams({ ...filters, [key]: value });
      if (!value) params.delete(key);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, filters]
  );

  function refresh() {
    setModal(null);
    startTransition(() => router.refresh());
  }

  return (
    <>
      {modal && (
        <ProviderModal
          state={modal}
          onClose={() => setModal(null)}
          onSuccess={refresh}
        />
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="search"
            value={filters.q}
            onChange={(e) => applyFilter("q", e.target.value)}
            placeholder="Search providers…"
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-white/50 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={!!filters.inactive}
            onChange={(e) => applyFilter("inactive", e.target.checked ? "1" : "")}
            className="w-4 h-4 rounded accent-blue-500"
          />
          Show inactive
        </label>
        <button
          onClick={() => setModal({ mode: "create" })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Provider
        </button>
      </div>

      {initialProviders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-white/30">
          <Truck className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-sm">No providers found</p>
          {filters.q && (
            <button
              onClick={() => applyFilter("q", "")}
              className="mt-2 text-xs text-blue-400 hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {initialProviders.map((p) => (
            <div
              key={p.id}
              className={`bg-white/4 border border-white/8 rounded-xl p-4 flex items-start justify-between gap-4 ${
                !p.active ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4 text-white/60" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{p.name}</p>
                  {p.contactName && (
                    <p className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
                      <User className="w-3 h-3" />
                      {p.contactName}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-1.5">
                    {p.email && (
                      <a
                        href={`mailto:${p.email}`}
                        className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <Mail className="w-3 h-3" />
                        {p.email}
                      </a>
                    )}
                    {p.phone && (
                      <a
                        href={`tel:${p.phone}`}
                        className="text-xs text-white/40 hover:text-white flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        {p.phone}
                      </a>
                    )}
                  </div>
                  {p.notes && (
                    <p className="text-xs text-white/30 mt-1 line-clamp-1">{p.notes}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setModal({ mode: "edit", provider: p })}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => startTransition(() => toggleProvider(p.id, !p.active).then(refresh))}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-colors"
                  title={p.active ? "Deactivate" : "Activate"}
                  disabled={isPending}
                >
                  {p.active
                    ? <PowerOff className="w-3.5 h-3.5" />
                    : <Power    className="w-3.5 h-3.5 text-green-400" />
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
