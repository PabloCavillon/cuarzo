"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";

type ActionResult = { ok: true } | { ok: false; error: string };

async function getOwnedBooking(id: string, tenantId: string) {
  const booking = await prisma.turneraBooking.findUnique({ where: { id } });
  if (!booking || booking.tenantId !== tenantId) {
    throw Object.assign(new Error("Reserva no encontrada."), { status: 404 });
  }
  return booking;
}

export async function confirmBooking(id: string): Promise<ActionResult> {
  let user;
  try { user = await requireAuth("staff"); } catch { return { ok: false, error: "No autorizado." }; }
  try {
    await getOwnedBooking(id, user.tenantId);
    await prisma.turneraBooking.update({ where: { id }, data: { status: "confirmed" } });
    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${id}`);
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function cancelBooking(id: string): Promise<ActionResult> {
  let user;
  try { user = await requireAuth("staff"); } catch { return { ok: false, error: "No autorizado." }; }
  try {
    await getOwnedBooking(id, user.tenantId);
    await prisma.turneraBooking.update({ where: { id }, data: { status: "cancelled" } });
    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${id}`);
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function markNoShow(id: string): Promise<ActionResult> {
  let user;
  try { user = await requireAuth("staff"); } catch { return { ok: false, error: "No autorizado." }; }
  try {
    await getOwnedBooking(id, user.tenantId);
    await prisma.turneraBooking.update({ where: { id }, data: { status: "no_show" } });
    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${id}`);
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
