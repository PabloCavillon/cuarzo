"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function createMovimiento(fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireAuth("staff");
    const tid  = user.tenantId;

    const tipo        = fd.get("tipo") as "ingreso" | "egreso";
    const monto       = parseFloat(fd.get("monto") as string);
    const descripcion = (fd.get("descripcion") as string)?.trim();
    const categoria   = (fd.get("categoria") as string)?.trim() || null;
    const metodoPago  = (fd.get("metodoPago") as string)?.trim() || "efectivo";
    const notes       = (fd.get("notes") as string)?.trim() || null;
    const fechaStr    = (fd.get("fecha") as string)?.trim();

    if (!tipo || !["ingreso", "egreso"].includes(tipo)) return { ok: false, error: "Tipo inválido" };
    if (!monto || monto <= 0)  return { ok: false, error: "Monto debe ser mayor a 0" };
    if (!descripcion)          return { ok: false, error: "Descripción requerida" };

    const fecha = fechaStr ? new Date(fechaStr) : new Date();

    await prisma.cajaMovimiento.create({
      data: { tenantId: tid, tipo, monto, descripcion, categoria, metodoPago, notes, fecha },
    });

    revalidatePath("/admin/caja");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error inesperado" };
  }
}

export async function updateMovimiento(id: string, fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireAuth("staff");
    const tid  = user.tenantId;

    const mov = await prisma.cajaMovimiento.findUnique({ where: { id } });
    if (!mov || mov.tenantId !== tid) return { ok: false, error: "Movimiento no encontrado" };

    const tipo        = fd.get("tipo") as "ingreso" | "egreso";
    const monto       = parseFloat(fd.get("monto") as string);
    const descripcion = (fd.get("descripcion") as string)?.trim();
    const categoria   = (fd.get("categoria") as string)?.trim() || null;
    const metodoPago  = (fd.get("metodoPago") as string)?.trim() || "efectivo";
    const notes       = (fd.get("notes") as string)?.trim() || null;
    const fechaStr    = (fd.get("fecha") as string)?.trim();

    if (!tipo || !["ingreso", "egreso"].includes(tipo)) return { ok: false, error: "Tipo inválido" };
    if (!monto || monto <= 0)  return { ok: false, error: "Monto debe ser mayor a 0" };
    if (!descripcion)          return { ok: false, error: "Descripción requerida" };

    const fecha = fechaStr ? new Date(fechaStr) : mov.fecha;

    await prisma.cajaMovimiento.update({
      where: { id },
      data:  { tipo, monto, descripcion, categoria, metodoPago, notes, fecha },
    });

    revalidatePath("/admin/caja");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error inesperado" };
  }
}

export async function deleteMovimiento(id: string): Promise<ActionResult> {
  try {
    const user = await requireAuth("staff");
    const tid  = user.tenantId;

    const mov = await prisma.cajaMovimiento.findUnique({ where: { id } });
    if (!mov || mov.tenantId !== tid) return { ok: false, error: "Movimiento no encontrado" };

    await prisma.cajaMovimiento.delete({ where: { id } });

    revalidatePath("/admin/caja");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error inesperado" };
  }
}
