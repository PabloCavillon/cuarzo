import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { findBookableTenant } from "@/lib/utils/plan-limits";

// Only times and durations: this endpoint is public, client data must not leave it.
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug") ?? "demo";
  const date = req.nextUrl.searchParams.get("date") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Fecha inválida." }, { status: 400 });
  }

  try {
    const tenant = await findBookableTenant(slug);
    if (!tenant) return NextResponse.json({ error: "Servicio no disponible." }, { status: 503 });

    const bookings = await prisma.turneraBooking.findMany({
      where:  { tenantId: tenant.id, date, status: { not: "cancelled" } },
      select: { time: true, durationMinSnap: true },
    });
    return NextResponse.json(
      { taken: bookings.map((b) => ({ time: b.time, duration: b.durationMinSnap })) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("[GET /api/appointments/availability]", err);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
