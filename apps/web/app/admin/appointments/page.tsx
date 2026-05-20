import { redirect } from "next/navigation";
import Link from "next/link";
import { Settings } from "lucide-react";
import { requireAuth, apiError } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { BookingsClient } from "./BookingsClient";

type SP = Promise<Record<string, string | undefined>>;

export default async function TurneraPage({ searchParams }: { searchParams: SP }) {
  let user;
  try {
    user = await requireAuth("staff");
  } catch (e) {
    void apiError(e);
    redirect("/login");
  }

  const sp     = await searchParams;
  const tid    = user.tenantId;
  const q      = sp.q?.trim() ?? "";
  const status = sp.status ?? "";
  const date   = sp.date ?? "";
  const svcId  = sp.service ?? "";

  const validStatus = (["confirmed", "cancelled", "no_show"] as const).find((s) => s === status);

  const [bookings, services] = await Promise.all([
    prisma.turneraBooking.findMany({
      where: {
        tenantId: tid,
        ...(validStatus  ? { status: validStatus } : {}),
        ...(date         ? { date }                : {}),
        ...(svcId        ? { serviceId: svcId }    : {}),
        ...(q ? {
          OR: [
            { clientName:  { contains: q, mode: "insensitive" } },
            { clientEmail: { contains: q, mode: "insensitive" } },
            { code:        { contains: q, mode: "insensitive" } },
          ],
        } : {}),
      },
      orderBy: [{ date: "desc" }, { time: "desc" }],
      take: 50,
      select: {
        id: true, code: true, serviceNameSnap: true,
        date: true, time: true, status: true,
        clientName: true, clientEmail: true, createdAt: true,
      },
    }),
    prisma.turneraService.findMany({
      where: { tenantId: tid },
      select: { id: true, name: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Turnera</h2>
          <p className="text-sm text-white/40 mt-0.5">Gestión de reservas</p>
        </div>
        <Link
          href="/admin/appointments/services"
          className="flex items-center gap-2 px-4 py-2 bg-white/8 hover:bg-white/12 text-white/60 hover:text-white text-sm rounded-xl transition-colors"
        >
          <Settings className="w-4 h-4" />
          Servicios
        </Link>
      </div>

      <BookingsClient
        bookings={bookings.map((b) => ({
          ...b,
          status:    b.status as string,
          createdAt: b.createdAt.toISOString(),
        }))}
        services={services}
        filters={{ q, status, date, service: svcId }}
      />
    </div>
  );
}
