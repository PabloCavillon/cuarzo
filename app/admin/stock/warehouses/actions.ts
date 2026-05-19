"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

type ActionResult = { ok: true } | { ok: false; error: string };

function parseWarehouseForm(fd: FormData) {
  return {
    name:    String(fd.get("name")    ?? "").trim(),
    address: String(fd.get("address") ?? "").trim() || null,
  };
}

export async function createWarehouse(formData: FormData): Promise<ActionResult> {
  let user;
  try { user = await requireAuth("staff"); } catch { return { ok: false, error: "No autorizado." }; }

  const { name, address } = parseWarehouseForm(formData);
  if (!name) return { ok: false, error: "El nombre es requerido." };

  try {
    await prisma.stockWarehouse.create({ data: { tenantId: user.tenantId, name, address } });
    revalidatePath("/admin/stock/warehouses");
    revalidatePath("/admin/stock");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function updateWarehouse(id: string, formData: FormData): Promise<ActionResult> {
  let user;
  try { user = await requireAuth("staff"); } catch { return { ok: false, error: "No autorizado." }; }

  const wh = await prisma.stockWarehouse.findUnique({ where: { id } });
  if (!wh || wh.tenantId !== user.tenantId) return { ok: false, error: "Depósito no encontrado." };

  const { name, address } = parseWarehouseForm(formData);
  if (!name) return { ok: false, error: "El nombre es requerido." };

  try {
    await prisma.stockWarehouse.update({ where: { id }, data: { name, address } });
    revalidatePath("/admin/stock/warehouses");
    revalidatePath("/admin/stock");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function toggleWarehouse(id: string, active: boolean): Promise<ActionResult> {
  let user;
  try { user = await requireAuth("staff"); } catch { return { ok: false, error: "No autorizado." }; }

  const wh = await prisma.stockWarehouse.findUnique({ where: { id } });
  if (!wh || wh.tenantId !== user.tenantId) return { ok: false, error: "Depósito no encontrado." };

  try {
    await prisma.stockWarehouse.update({ where: { id }, data: { active } });
    revalidatePath("/admin/stock/warehouses");
    revalidatePath("/admin/stock");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
