import { NextRequest, NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { FREE_MODULE_INFO, FREE_MODULE_MAX, getLimits } from "@/lib/plan-limits";

export async function POST(req: NextRequest) {
  let user;
  try { user = await requireAuth("admin"); } catch (e) {
    return apiError(e);
  }

  let body: { modules?: unknown };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (!Array.isArray(body.modules)) {
    return NextResponse.json({ error: "modules debe ser un array." }, { status: 400 });
  }

  const modules = (body.modules as unknown[]).map(String);

  const tenant = await prisma.tenant.findUnique({
    where:  { id: user.tenantId },
    select: { plan: true },
  });

  const plan = tenant?.plan ?? "free";

  if (plan === "free") {
    const valid = modules.every((m) => m in FREE_MODULE_INFO);
    if (!valid) {
      return NextResponse.json({ error: "Módulo no disponible en el plan gratuito." }, { status: 400 });
    }
    if (modules.length > FREE_MODULE_MAX) {
      return NextResponse.json(
        { error: `El plan gratuito permite hasta ${FREE_MODULE_MAX} módulos.` },
        { status: 400 }
      );
    }
    if (modules.length < 1) {
      return NextResponse.json({ error: "Seleccioná al menos un módulo." }, { status: 400 });
    }
  } else {
    const allowed = getLimits(plan).modules;
    const valid   = modules.every((m) => allowed.includes(m));
    if (!valid) {
      return NextResponse.json({ error: "Módulo no permitido en tu plan." }, { status: 400 });
    }
  }

  await prisma.$transaction(async (tx) => {
    // Deactivate all current modules for this tenant
    await tx.tenantModule.updateMany({
      where: { tenantId: user.tenantId },
      data:  { active: false },
    });
    // Activate the selected ones
    for (const module of modules) {
      await tx.tenantModule.upsert({
        where:  { tenantId_module: { tenantId: user.tenantId, module: module as never } },
        update: { active: true },
        create: { tenantId: user.tenantId, module: module as never, active: true },
      });
    }
  });

  return NextResponse.json({ ok: true, modules });
}
