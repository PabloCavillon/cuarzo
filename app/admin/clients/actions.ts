"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";

type ActionResult = { ok: true } | { ok: false; error: string };

function parseClientForm(fd: FormData) {
  return {
    name:    String(fd.get("name")    ?? "").trim(),
    email:   String(fd.get("email")   ?? "").trim() || null,
    phone:   String(fd.get("phone")   ?? "").trim() || null,
    address: String(fd.get("address") ?? "").trim() || null,
    notes:   String(fd.get("notes")   ?? "").trim() || null,
  };
}

export async function createClient(formData: FormData): Promise<ActionResult> {
  let user;
  try { user = await requireAuth("staff"); } catch { return { ok: false, error: "No autorizado." }; }

  const data = parseClientForm(formData);
  if (!data.name) return { ok: false, error: "El nombre es requerido." };

  try {
    await prisma.client.create({ data: { tenantId: user.tenantId, ...data } });
    revalidatePath("/admin/clients");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function updateClient(id: string, formData: FormData): Promise<ActionResult> {
  let user;
  try { user = await requireAuth("staff"); } catch { return { ok: false, error: "No autorizado." }; }

  const client = await prisma.client.findUnique({ where: { id } });
  if (!client || client.tenantId !== user.tenantId) return { ok: false, error: "Cliente no encontrado." };

  const data = parseClientForm(formData);
  if (!data.name) return { ok: false, error: "El nombre es requerido." };

  try {
    await prisma.client.update({ where: { id }, data });
    revalidatePath("/admin/clients");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function toggleClient(id: string, active: boolean): Promise<ActionResult> {
  let user;
  try { user = await requireAuth("staff"); } catch { return { ok: false, error: "No autorizado." }; }

  const client = await prisma.client.findUnique({ where: { id } });
  if (!client || client.tenantId !== user.tenantId) return { ok: false, error: "Cliente no encontrado." };

  try {
    await prisma.client.update({ where: { id }, data: { active } });
    revalidatePath("/admin/clients");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
