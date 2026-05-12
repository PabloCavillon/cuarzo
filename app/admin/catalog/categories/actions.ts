"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function createCategory(formData: FormData): Promise<ActionResult> {
  let user;
  try { user = await requireAuth("staff"); } catch { return { ok: false, error: "No autorizado." }; }

  const name     = String(formData.get("name")     ?? "").trim();
  const parentId = String(formData.get("parentId") ?? "").trim() || null;
  if (!name) return { ok: false, error: "El nombre es requerido." };

  try {
    await prisma.catalogCategory.create({
      data: { tenantId: user.tenantId, name, parentId },
    });
    revalidatePath("/admin/catalog/categories");
    revalidatePath("/admin/catalog");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function updateCategory(id: string, formData: FormData): Promise<ActionResult> {
  let user;
  try { user = await requireAuth("staff"); } catch { return { ok: false, error: "No autorizado." }; }

  const cat = await prisma.catalogCategory.findUnique({ where: { id } });
  if (!cat || cat.tenantId !== user.tenantId) return { ok: false, error: "Categoría no encontrada." };

  const name     = String(formData.get("name")     ?? "").trim();
  const parentId = String(formData.get("parentId") ?? "").trim() || null;
  if (!name) return { ok: false, error: "El nombre es requerido." };
  if (parentId === id) return { ok: false, error: "Una categoría no puede ser su propio padre." };

  try {
    await prisma.catalogCategory.update({ where: { id }, data: { name, parentId } });
    revalidatePath("/admin/catalog/categories");
    revalidatePath("/admin/catalog");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  let user;
  try { user = await requireAuth("staff"); } catch { return { ok: false, error: "No autorizado." }; }

  const cat = await prisma.catalogCategory.findUnique({
    where: { id },
    include: {
      _count: { select: { products: true, children: true } },
    },
  });
  if (!cat || cat.tenantId !== user.tenantId) return { ok: false, error: "Categoría no encontrada." };
  if (cat._count.products > 0) return { ok: false, error: `Tiene ${cat._count.products} producto(s) asociado(s).` };
  if (cat._count.children > 0) return { ok: false, error: `Tiene ${cat._count.children} subcategoría(s).` };

  try {
    await prisma.catalogCategory.delete({ where: { id } });
    revalidatePath("/admin/catalog/categories");
    revalidatePath("/admin/catalog");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
