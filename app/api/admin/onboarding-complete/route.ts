import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { FREE_MODULE_INFO, FREE_MODULE_MAX } from "@/lib/utils/plan-limits";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return Response.json({ error: "No autenticado." }, { status: 401 });
  }

  let modules: string[] = [];
  try {
    const body = await req.json();
    if (Array.isArray(body.modules)) modules = body.modules.map(String);
  } catch {
    // no body or no modules key — proceed with empty selection
  }

  const tenant = await prisma.tenant.findUnique({
    where:  { id: session.user.tenantId },
    select: { plan: true },
  });

  if (tenant?.plan === "free") {
    const valid = modules.every((m) => m in FREE_MODULE_INFO);
    if (!valid) {
      return Response.json({ error: "Módulo no válido para el plan gratuito." }, { status: 400 });
    }
    if (modules.length > FREE_MODULE_MAX) {
      return Response.json({ error: `Podés activar hasta ${FREE_MODULE_MAX} módulos en el plan gratuito.` }, { status: 400 });
    }
  }

  await prisma.$transaction(async (tx) => {
    for (const module of modules) {
      await tx.tenantModule.upsert({
        where:  { tenantId_module: { tenantId: session.user.tenantId, module: module as never } },
        update: { active: true },
        create: { tenantId: session.user.tenantId, module: module as never, active: true },
      });
    }
    await tx.tenant.update({
      where: { id: session.user.tenantId },
      data:  { onboarded: true },
    });
  });

  return Response.json({ ok: true });
}
