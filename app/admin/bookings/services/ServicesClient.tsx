"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Power, PowerOff, Clock, DollarSign } from "lucide-react";
import { ServiceFormModal } from "./ServiceFormModal";
import { toggleService } from "./actions";

type ServiceRow = {
  id: string;
  name: string;
  description: string | null;
  durationMin: number;
  price: string;
  active: boolean;
  sortOrder: number;
  bookingCount: number;
};

export function ServicesClient({ services }: { services: ServiceRow[] }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceRow | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  function handleToggle(id: string, current: boolean) {
    setTogglingId(id);
    startTransition(async () => {
      await toggleService(id, !current);
      router.refresh();
      setTogglingId(null);
    });
  }

  function openCreate() {
    setEditing(undefined);
    setModalOpen(true);
  }

  function openEdit(svc: ServiceRow) {
    setEditing(svc);
    setModalOpen(true);
  }

  function handleSuccess() {
    setModalOpen(false);
    setEditing(undefined);
    router.refresh();
  }

  return (
    <>
      <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <h3 className="text-sm font-semibold text-white">Servicios</h3>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo
          </button>
        </div>

        {services.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-white/25 mb-4">Aún no hay servicios creados</p>
            <button
              onClick={openCreate}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm rounded-xl transition-colors"
            >
              Crear primer servicio
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {services.map((svc) => {
              const price = parseFloat(svc.price);
              const isToggling = isPending && togglingId === svc.id;

              return (
                <div
                  key={svc.id}
                  className={`flex items-center gap-4 px-5 py-4 transition-opacity ${
                    !svc.active ? "opacity-50" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-white">{svc.name}</p>
                      {!svc.active && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-white/30">
                          INACTIVO
                        </span>
                      )}
                    </div>
                    {svc.description && (
                      <p className="text-xs text-white/35 truncate mb-1.5">{svc.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-white/30">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {svc.durationMin} min
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {price === 0 ? "Gratis" : `$${price.toLocaleString("es-AR")}`}
                      </span>
                      <span>
                        {svc.bookingCount} reserva{svc.bookingCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(svc)}
                      title="Editar"
                      className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={isToggling}
                      onClick={() => handleToggle(svc.id, svc.active)}
                      title={svc.active ? "Desactivar" : "Activar"}
                      className={`p-2 rounded-lg transition-colors disabled:opacity-40 ${
                        svc.active
                          ? "text-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-500/10"
                          : "text-white/20 hover:text-white/50 hover:bg-white/8"
                      }`}
                    >
                      {svc.active ? (
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

      <ServiceFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        editing={editing}
      />
    </>
  );
}
