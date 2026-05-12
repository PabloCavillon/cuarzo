"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";

type ActionResult = { ok: true } | { ok: false; error: string };

function parseProductForm(fd: FormData) {
  return {
    name:        String(fd.get("name")        ?? "").trim(),
    sku:         String(fd.get("sku")         ?? "").trim().toUpperCase(),
    description: String(fd.get("description") ?? "").trim() || null,
    basePrice:   parseFloat(String(fd.get("basePrice") ?? "0")),
    categoryId:  String(fd.get("categoryId")  ?? "").trim() || null,
  };
}

export async function createProduct(formData: FormData): Promise<ActionResult> {
  let user;
  try { user = await requireAuth("staff"); } catch { return { ok: false, error: "No autorizado." }; }

  const { name, sku, description, basePrice, categoryId } = parseProductForm(formData);
  if (!name)                         return { ok: false, error: "El nombre es requerido." };
  if (!sku)                          return { ok: false, error: "El SKU es requerido." };
  if (isNaN(basePrice) || basePrice < 0) return { ok: false, error: "El precio no es válido." };

  try {
    await prisma.catalogProduct.create({
      data: { tenantId: user.tenantId, name, sku, description, basePrice, categoryId },
    });
    revalidatePath("/admin/catalog");
    return { ok: true };
  } catch (e) {
    const err = e as { code?: string; message?: string };
    if (err.code === "P2002") return { ok: false, error: "El SKU ya existe para este tenant." };
    return { ok: false, error: err.message ?? "Error al crear el producto." };
  }
}

export async function updateProduct(id: string, formData: FormData): Promise<ActionResult> {
  let user;
  try { user = await requireAuth("staff"); } catch { return { ok: false, error: "No autorizado." }; }

  const product = await prisma.catalogProduct.findUnique({ where: { id } });
  if (!product || product.tenantId !== user.tenantId) return { ok: false, error: "Producto no encontrado." };

  const { name, sku, description, basePrice, categoryId } = parseProductForm(formData);
  if (!name)                         return { ok: false, error: "El nombre es requerido." };
  if (!sku)                          return { ok: false, error: "El SKU es requerido." };
  if (isNaN(basePrice) || basePrice < 0) return { ok: false, error: "El precio no es válido." };

  try {
    await prisma.catalogProduct.update({
      where: { id },
      data: { name, sku, description, basePrice, categoryId },
    });
    revalidatePath("/admin/catalog");
    return { ok: true };
  } catch (e) {
    const err = e as { code?: string; message?: string };
    if (err.code === "P2002") return { ok: false, error: "El SKU ya existe para este tenant." };
    return { ok: false, error: err.message ?? "Error al actualizar el producto." };
  }
}

export async function toggleProduct(id: string, active: boolean): Promise<ActionResult> {
  let user;
  try { user = await requireAuth("staff"); } catch { return { ok: false, error: "No autorizado." }; }

  const product = await prisma.catalogProduct.findUnique({ where: { id } });
  if (!product || product.tenantId !== user.tenantId) return { ok: false, error: "Producto no encontrado." };

  try {
    await prisma.catalogProduct.update({ where: { id }, data: { active } });
    revalidatePath("/admin/catalog");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
