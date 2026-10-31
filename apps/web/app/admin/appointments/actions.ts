"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { isTaken } from "@/lib/utils/slots";

type ActionResult = { ok: true } | { ok: false; error: string };

async function setBookingStatus(id: string, status: "confirmed" | "cancelled" | "no_show"): Promise<ActionResult> {
  let user;
  try { user = await requireAuth("staff"); } catch { return { ok: false, error: "Unauthorized." }; }
  try {
    const booking = await prisma.turneraBooking.findUnique({ where: { id } });
    if (!booking || booking.tenantId !== user.tenantId) return { ok: false, error: "Reserva no encontrada." };

    // Someone else may have taken the slot after the cancellation.
    if (booking.status === "cancelled" && status !== "cancelled") {
      const others = await prisma.turneraBooking.findMany({
        where:  { tenantId: booking.tenantId, date: booking.date, status: { not: "cancelled" }, id: { not: id } },
        select: { time: true, durationMinSnap: true },
      });
      const busy = others.map((b) => ({ time: b.time, duration: b.durationMinSnap }));
      if (isTaken(booking.time, booking.durationMinSnap, busy)) return { ok: false, error: "Ese horario ya está ocupado." };
    }

    await prisma.turneraBooking.update({ where: { id }, data: { status } });
    revalidatePath("/admin/appointments");
    revalidatePath(`/admin/appointments/${id}`);
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function confirmBooking(id: string): Promise<ActionResult> {
  return setBookingStatus(id, "confirmed");
}

export async function cancelBooking(id: string): Promise<ActionResult> {
  return setBookingStatus(id, "cancelled");
}

export async function markNoShow(id: string): Promise<ActionResult> {
  return setBookingStatus(id, "no_show");
}
