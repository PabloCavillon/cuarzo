"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function createCategory(formData: FormData): Promise<ActionResult> {
  let user;
  try { user = await requireAuth("staff"); } catch { return { ok: false, error: "Unauthorized." }; }

  const name     = String(formData.get("name")     ?? "").trim();
  const parentId = String(formData.get("parentId") ?? "").trim() || null;
  if (!name) return { ok: false, error: "Name is required." };

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
  try { user = await requireAuth("staff"); } catch { return { ok: false, error: "Unauthorized." }; }

  const cat = await prisma.catalogCategory.findUnique({ where: { id } });
  if (!cat || cat.tenantId !== user.tenantId) return { ok: false, error: "Category not found." };

  const name     = String(formData.get("name")     ?? "").trim();
  const parentId = String(formData.get("parentId") ?? "").trim() || null;
  if (!name) return { ok: false, error: "Name is required." };
  if (parentId === id) return { ok: false, error: "A category cannot be its own parent." };

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
  try { user = await requireAuth("staff"); } catch { return { ok: false, error: "Unauthorized." }; }

  const cat = await prisma.catalogCategory.findUnique({
    where: { id },
    include: {
      _count: { select: { products: true, children: true } },
    },
  });
  if (!cat || cat.tenantId !== user.tenantId) return { ok: false, error: "Category not found." };
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
