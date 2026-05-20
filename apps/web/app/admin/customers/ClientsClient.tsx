"use client";

import { useCallback, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Edit2, Power, PowerOff, Search, Users, Mail, Phone } from "lucide-react";
import { ClientFormModal } from "./ClientFormModal";
import { toggleClient } from "./actions";

type ClientRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
};

type Filters = { q: string; inactive: string };

function Avatar({ name }: { name: string }) {
  return (
    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/70 shrink-0">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export function ClientsClient({
  clients,
  filters: initial,
}: {
  clients: ClientRow[];
  filters: Filters;
}) {
  const router   = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState(initial);
  const [modalOpen, setModalOpen]    = useState(false);
  const [editing, setEditing]        = useState<ClientRow | undefined>(undefined);
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
      await toggleClient(id, !current);
      router.refresh();
      setTogglingId(null);
    });
  }

  function openCreate() {
    setEditing(undefined);
    setModalOpen(true);
  }

  function openEdit(c: ClientRow) {
    setEditing(c);
    setModalOpen(true);
  }

  function handleSuccess() {
    setModalOpen(false);
    setEditing(undefined);
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
                  placeholder="Name, email or phone…"
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

        {/* Clients list */}
        <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
            <h3 className="text-sm font-semibold text-white">
              Clientes
              <span className="ml-2 text-xs font-normal text-white/30">
                {clients.length} registro{clients.length !== 1 ? "s" : ""}
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

          {clients.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="w-8 h-8 text-white/15 mx-auto mb-3" />
              <p className="text-sm text-white/25 mb-4">
                {hasFilters ? "No matching customers" : "No customers yet"}
              </p>
              {!hasFilters && (
                <button
                  onClick={openCreate}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm rounded-xl transition-colors"
                >
                  Agregar primer cliente
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {clients.map((c) => {
                const isToggling = isPending && togglingId === c.id;
                return (
                  <div
                    key={c.id}
                    className={`flex items-center gap-4 px-5 py-3.5 transition-opacity ${
                      !c.active ? "opacity-50" : ""
                    } group`}
                  >
                    <Link href={`/admin/customers/${c.id}`} className="shrink-0">
                      <Avatar name={c.name} />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Link href={`/admin/customers/${c.id}`} className="text-sm font-medium text-white truncate hover:underline underline-offset-2">
                          {c.name}
                        </Link>
                        {!c.active && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-white/30 shrink-0">
                            INACTIVO
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-white/35">
                        {c.email && (
                          <span className="flex items-center gap-1 truncate">
                            <Mail className="w-3 h-3 shrink-0" />
                            {c.email}
                          </span>
                        )}
                        {c.phone && (
                          <span className="flex items-center gap-1 shrink-0">
                            <Phone className="w-3 h-3" />
                            {c.phone}
                          </span>
                        )}
                      </div>
                      {c.notes && (
                        <p className="text-xs text-white/20 italic truncate mt-0.5">{c.notes}</p>
                      )}
                    </div>

                    <p className="hidden sm:block text-xs text-white/25 shrink-0">
                      {new Date(c.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
                    </p>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEdit(c)}
                        title="Edit"
                        className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={isToggling}
                        onClick={() => handleToggle(c.id, c.active)}
                        title={c.active ? "Desactivar" : "Activar"}
                        className={`p-2 rounded-lg transition-colors disabled:opacity-40 ${
                          c.active
                            ? "text-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-500/10"
                            : "text-white/20 hover:text-white/50 hover:bg-white/8"
                        }`}
                      >
                        {c.active ? <Power className="w-3.5 h-3.5" /> : <PowerOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ClientFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        editing={editing}
      />
    </>
  );
}
