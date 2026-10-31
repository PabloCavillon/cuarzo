"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { checkServiceLimit, hasModule } from "@/lib/utils/plan-limits";

type ActionResult = { ok: true } | { ok: false; error: string };

function parseServiceForm(fd: FormData) {
  return {
    name:        String(fd.get("name") ?? "").trim(),
    description: String(fd.get("description") ?? "").trim() || null,
    durationMin: parseInt(String(fd.get("durationMin") ?? "0"), 10),
    price:       parseFloat(String(fd.get("price") ?? "0")),
    sortOrder:   parseInt(String(fd.get("sortOrder") ?? "0"), 10),
  };
}

export async function createService(formData: FormData): Promise<ActionResult> {
  let user;
  try { user = await requireAuth("staff"); } catch { return { ok: false, error: "Unauthorized." }; }

  const { name, description, durationMin, price, sortOrder } = parseServiceForm(formData);
  if (!name)           return { ok: false, error: "Name is required." };
  if (durationMin < 5) return { ok: false, error: "La duración mínima es 5 minutos." };
  if (isNaN(price) || price < 0) return { ok: false, error: "El precio no es válido." };

  if (!(await hasModule(user.tenantId, "turnera"))) return { ok: false, error: "Módulo no disponible en tu plan." };
  const tenant = await prisma.tenant.findUnique({ where: { id: user.tenantId }, select: { plan: true } });
  if (!(await checkServiceLimit(user.tenantId, tenant?.plan ?? "free"))) {
    return { ok: false, error: "Alcanzaste el límite de servicios de tu plan." };
  }

  try {
    await prisma.turneraService.create({
      data: { tenantId: user.tenantId, name, description, durationMin, price, sortOrder },
    });
    revalidatePath("/admin/appointments/services");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function updateService(id: string, formData: FormData): Promise<ActionResult> {
  let user;
  try { user = await requireAuth("staff"); } catch { return { ok: false, error: "Unauthorized." }; }

  const service = await prisma.turneraService.findUnique({ where: { id } });
  if (!service || service.tenantId !== user.tenantId) return { ok: false, error: "Service not found." };

  const { name, description, durationMin, price, sortOrder } = parseServiceForm(formData);
  if (!name)           return { ok: false, error: "Name is required." };
  if (durationMin < 5) return { ok: false, error: "La duración mínima es 5 minutos." };
  if (isNaN(price) || price < 0) return { ok: false, error: "El precio no es válido." };

  try {
    await prisma.turneraService.update({
      where: { id },
      data: { name, description, durationMin, price, sortOrder },
    });
    revalidatePath("/admin/appointments/services");
    revalidatePath("/admin/appointments");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function toggleService(id: string, active: boolean): Promise<ActionResult> {
  let user;
  try { user = await requireAuth("staff"); } catch { return { ok: false, error: "Unauthorized." }; }

  const service = await prisma.turneraService.findUnique({ where: { id } });
  if (!service || service.tenantId !== user.tenantId) return { ok: false, error: "Service not found." };

  try {
    await prisma.turneraService.update({ where: { id }, data: { active } });
    revalidatePath("/admin/appointments/services");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
