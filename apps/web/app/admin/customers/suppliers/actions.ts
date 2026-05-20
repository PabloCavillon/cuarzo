"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

type ActionResult = { ok: true } | { ok: false; error: string };

function parseSupplierForm(fd: FormData) {
  return {
    name:        String(fd.get("name")        ?? "").trim(),
    contactName: String(fd.get("contactName") ?? "").trim() || null,
    email:       String(fd.get("email")       ?? "").trim() || null,
    phone:       String(fd.get("phone")       ?? "").trim() || null,
    address:     String(fd.get("address")     ?? "").trim() || null,
    notes:       String(fd.get("notes")       ?? "").trim() || null,
  };
}

export async function createSupplier(formData: FormData): Promise<ActionResult> {
  let user;
  try { user = await requireAuth("staff"); } catch { return { ok: false, error: "Unauthorized." }; }

  const data = parseSupplierForm(formData);
  if (!data.name) return { ok: false, error: "Name is required." };

  try {
    await prisma.supplier.create({ data: { tenantId: user.tenantId, ...data } });
    revalidatePath("/admin/customers/suppliers");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function updateSupplier(id: string, formData: FormData): Promise<ActionResult> {
  let user;
  try { user = await requireAuth("staff"); } catch { return { ok: false, error: "Unauthorized." }; }

  const supplier = await prisma.supplier.findUnique({ where: { id } });
  if (!supplier || supplier.tenantId !== user.tenantId) return { ok: false, error: "Provider not found." };

  const data = parseSupplierForm(formData);
  if (!data.name) return { ok: false, error: "Name is required." };

  try {
    await prisma.supplier.update({ where: { id }, data });
    revalidatePath("/admin/customers/suppliers");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function toggleSupplier(id: string, active: boolean): Promise<ActionResult> {
  let user;
  try { user = await requireAuth("staff"); } catch { return { ok: false, error: "Unauthorized." }; }

  const supplier = await prisma.supplier.findUnique({ where: { id } });
  if (!supplier || supplier.tenantId !== user.tenantId) return { ok: false, error: "Provider not found." };

  try {
    await prisma.supplier.update({ where: { id }, data: { active } });
    revalidatePath("/admin/customers/suppliers");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
