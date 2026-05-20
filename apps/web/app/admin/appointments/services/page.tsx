import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAuth, apiError } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { ServicesClient } from "./ServicesClient";

export default async function ServicesPage() {
  let user;
  try {
    user = await requireAuth("staff");
  } catch (e) {
    void apiError(e);
    redirect("/login");
  }

  const services = await prisma.turneraService.findMany({
    where: { tenantId: user.tenantId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true, name: true, description: true,
      durationMin: true, price: true, active: true, sortOrder: true,
      _count: { select: { bookings: true } },
    },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Link
        href="/admin/appointments"
        className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Turnera
      </Link>

      <div>
        <h2 className="text-xl font-bold text-white">Servicios</h2>
        <p className="text-sm text-white/40 mt-0.5">
          {services.length} servicio{services.length !== 1 ? "s" : ""} configurado{services.length !== 1 ? "s" : ""}
        </p>
      </div>

      <ServicesClient
        services={services.map((s) => ({
          id:           s.id,
          name:         s.name,
          description:  s.description,
          durationMin:  s.durationMin,
          price:        s.price.toString(),
          active:       s.active,
          sortOrder:    s.sortOrder,
          bookingCount: s._count.bookings,
        }))}
      />
    </div>
  );
}
