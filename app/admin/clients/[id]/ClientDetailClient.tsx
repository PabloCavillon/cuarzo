"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Edit2, Power, PowerOff, Mail, Phone,
  MapPin, FileText, ShoppingCart, Calendar,
  Loader2, Package,
} from "lucide-react";
import { ClientFormModal } from "../ClientFormModal";
import { toggleClient } from "../actions";

// ─── Types ────────────────────────────────────────────────────────────────────

type ClientData = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
};

type OrderRow = {
  id: string;
  status: string;
  total: string;
  itemCount: number;
  createdAt: string;
};

type BookingRow = {
  id: string;
  code: string;
  serviceNameSnap: string;
  date: string;
  time: string;
  status: string;
  priceSnap: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const ORDER_STATUS_STYLES: Record<string, string> = {
  draft:      "bg-white/8 text-white/40",
  confirmed:  "bg-blue-500/15 text-blue-300",
  processing: "bg-amber-500/15 text-amber-300",
  shipped:    "bg-purple-500/15 text-purple-300",
  delivered:  "bg-emerald-500/15 text-emerald-300",
  cancelled:  "bg-red-500/15 text-red-400",
  refunded:   "bg-white/8 text-white/30",
};

const ORDER_STATUS_ES: Record<string, string> = {
  draft:      "Borrador",
  confirmed:  "Confirmado",
  processing: "En proceso",
  shipped:    "Enviado",
  delivered:  "Entregado",
  cancelled:  "Cancelado",
  refunded:   "Reembolsado",
};

const BOOKING_STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-emerald-500/15 text-emerald-400",
  cancelled: "bg-red-500/15 text-red-400",
  no_show:   "bg-amber-500/15 text-amber-300",
};

const BOOKING_STATUS_ES: Record<string, string> = {
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  no_show:   "No asistió",
};

function fmt(n: number) {
  return n.toLocaleString("es-AR", { minimumFractionDigits: 2 });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });
}

function fmtBookingDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

// ─── Main component ───────────────────────────────────────────────────────────

type Tab = "orders" | "bookings";

export function ClientDetailClient({
  client: initial,
  orders,
  bookings,
  orderRevenue,
}: {
  client:       ClientData;
  orders:       OrderRow[];
  bookings:     BookingRow[];
  orderRevenue: number;
}) {
  const router = useRouter();
  const [client, setClient]           = useState(initial);
  const [tab, setTab]                 = useState<Tab>("orders");
  const [editOpen, setEditOpen]       = useState(false);
  const [isPending, startTransition]  = useTransition();

  function handleToggle() {
    startTransition(async () => {
      await toggleClient(client.id, !client.active);
      setClient((c) => ({ ...c, active: !c.active }));
      router.refresh();
    });
  }

  function handleEditSuccess() {
    setEditOpen(false);
    router.refresh();
  }

  return (
    <>
      <ClientFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSuccess={handleEditSuccess}
        editing={client}
      />

      {/* Back + header */}
      <div className="flex items-start gap-4">
        <Link
          href="/admin/clients"
          className="mt-1 p-2 rounded-xl text-white/30 hover:text-white hover:bg-white/8 transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-xl font-bold text-white/70 shrink-0">
              {client.name.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white">{client.name}</h2>
                {!client.active && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/8 text-white/30">
                    INACTIVO
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                {client.email && (
                  <span className="flex items-center gap-1.5 text-xs text-white/40">
                    <Mail className="w-3 h-3" />{client.email}
                  </span>
                )}
                {client.phone && (
                  <span className="flex items-center gap-1.5 text-xs text-white/40">
                    <Phone className="w-3 h-3" />{client.phone}
                  </span>
                )}
              </div>
              <p className="text-xs text-white/25 mt-1">Cliente desde {fmtDate(client.createdAt)}</p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setEditOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/8 hover:bg-white/14 text-white/60 hover:text-white text-xs rounded-lg transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Editar
              </button>
              <button
                onClick={handleToggle}
                disabled={isPending}
                className={`p-2 rounded-lg transition-colors disabled:opacity-40 ${
                  client.active
                    ? "text-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-500/10"
                    : "text-white/30 hover:text-white/60 hover:bg-white/8"
                }`}
                title={client.active ? "Desactivar" : "Activar"}
              >
                {isPending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : client.active
                    ? <Power className="w-4 h-4" />
                    : <PowerOff className="w-4 h-4" />
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="w-3.5 h-3.5 text-white/30" />
            <p className="text-xs text-white/40">Pedidos</p>
          </div>
          <p className="text-2xl font-bold text-white">{orders.length}</p>
        </div>
        <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-3.5 h-3.5 text-white/30" />
            <p className="text-xs text-white/40">Total gastado</p>
          </div>
          <p className="text-2xl font-bold text-white">$ {fmt(orderRevenue)}</p>
        </div>
        <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-3.5 h-3.5 text-white/30" />
            <p className="text-xs text-white/40">Turnos</p>
          </div>
          <p className="text-2xl font-bold text-white">{bookings.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/5 border border-white/8 rounded-2xl w-fit">
        {([
          { key: "orders",   label: `Pedidos (${orders.length})` },
          { key: "bookings", label: `Turnos (${bookings.length})` },
        ] as { key: Tab; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              tab === key
                ? "bg-white/15 text-white"
                : "text-white/40 hover:text-white hover:bg-white/8"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "orders" && (
        <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
          {orders.length === 0 ? (
            <div className="py-14 text-center">
              <ShoppingCart className="w-7 h-7 text-white/15 mx-auto mb-2" />
              <p className="text-xs text-white/25">
                {client.email ? "Sin pedidos registrados" : "Este cliente no tiene email — los pedidos se vinculan por email"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {orders.map((o) => (
                <Link
                  key={o.id}
                  href={`/admin/orders/${o.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/4 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center shrink-0">
                    <Package className="w-3.5 h-3.5 text-white/40" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-xs font-mono text-white/50">{o.id.slice(0, 8).toUpperCase()}</p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${ORDER_STATUS_STYLES[o.status] ?? "bg-white/8 text-white/40"}`}>
                        {ORDER_STATUS_ES[o.status] ?? o.status}
                      </span>
                    </div>
                    <p className="text-xs text-white/35">
                      {o.itemCount} ítem{o.itemCount !== 1 ? "s" : ""} · {fmtDate(o.createdAt)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-white shrink-0">$ {fmt(parseFloat(o.total))}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "bookings" && (
        <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
          {bookings.length === 0 ? (
            <div className="py-14 text-center">
              <Calendar className="w-7 h-7 text-white/15 mx-auto mb-2" />
              <p className="text-xs text-white/25">
                {client.email ? "Sin turnos registrados" : "Este cliente no tiene email — los turnos se vinculan por email"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {bookings.map((b) => (
                <Link
                  key={b.id}
                  href={`/admin/bookings/${b.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/4 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-white/40" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm text-white truncate">{b.serviceNameSnap}</p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${BOOKING_STATUS_STYLES[b.status] ?? "bg-white/8 text-white/40"}`}>
                        {BOOKING_STATUS_ES[b.status] ?? b.status}
                      </span>
                    </div>
                    <p className="text-xs text-white/35">
                      {fmtBookingDate(b.date)} · {b.time} hs
                      <span className="ml-2 font-mono text-white/25">{b.code}</span>
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-white/60 shrink-0">$ {fmt(parseFloat(b.priceSnap))}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Contact info card */}
      {(client.address || client.notes) && (
        <div className="bg-white/5 border border-white/8 rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Información adicional</h3>
          {client.address && (
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-white/30 mt-0.5 shrink-0" />
              <p className="text-sm text-white/60">{client.address}</p>
            </div>
          )}
          {client.notes && (
            <div className="flex items-start gap-2">
              <FileText className="w-3.5 h-3.5 text-white/30 mt-0.5 shrink-0" />
              <p className="text-sm text-white/60 leading-relaxed">{client.notes}</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
