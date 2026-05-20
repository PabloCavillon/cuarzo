import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAuth, apiError } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { BookingActions } from "./BookingActions";

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
  cancelled: "bg-red-500/15 text-red-400 border border-red-500/20",
  no_show:   "bg-amber-500/15 text-amber-400 border border-amber-500/20",
};

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  no_show:   "No-show",
};

function formatFullDate(dateStr: string, timeStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${new Date(y, m - 1, d).toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  })} a las ${timeStr} hs`;
}

type Params = { params: Promise<{ id: string }> };

export default async function BookingDetailPage({ params }: Params) {
  let user;
  try {
    user = await requireAuth("staff");
  } catch (e) {
    void apiError(e);
    redirect("/login");
  }

  const { id } = await params;

  const booking = await prisma.turneraBooking.findUnique({
    where: { id },
    select: {
      id: true, code: true, status: true,
      date: true, time: true,
      serviceNameSnap: true, durationMinSnap: true, priceSnap: true,
      clientName: true, clientEmail: true, clientPhone: true, notes: true,
      createdAt: true, tenantId: true,
      service: { select: { id: true, name: true } },
    },
  });

  if (!booking || booking.tenantId !== user.tenantId) notFound();

  const price = Number(booking.priceSnap);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Link
        href="/admin/appointments"
        className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Reservas
      </Link>

      {/* Header card */}
      <div className="bg-white/5 border border-white/8 rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">{booking.clientName}</h2>
            <p className="text-sm text-white/40 mt-0.5">{booking.clientEmail}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                STATUS_STYLES[booking.status] ?? "bg-white/10 text-white/40 border border-white/10"
              }`}
            >
              {STATUS_LABELS[booking.status] ?? booking.status}
            </span>
            <span className="font-mono text-[11px] font-bold text-white/50 bg-white/8 px-2.5 py-1 rounded-full">
              {booking.code}
            </span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
          <Field label="Fecha y hora"  value={formatFullDate(booking.date, booking.time)} />
          <Field label="Servicio"       value={booking.serviceNameSnap} />
          <Field label="Duration"       value={`${booking.durationMinSnap} minutos`} />
          <Field
            label="Precio"
            value={price === 0 ? "Gratis" : `$${price.toLocaleString("es-AR")}`}
          />
          {booking.clientPhone && (
            <Field label="Phone" value={booking.clientPhone} />
          )}
          <Field
            label="Reservado el"
            value={booking.createdAt.toLocaleDateString("es-AR", {
              day: "numeric", month: "long", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
          />
          {booking.notes && (
            <div className="sm:col-span-2">
              <Field label="Notas del cliente" value={booking.notes} />
            </div>
          )}
        </div>
      </div>

      <BookingActions
        id={booking.id}
        status={booking.status as "confirmed" | "cancelled" | "no_show"}
      />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-white/80">{value}</p>
    </div>
  );
}
