import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { checkServiceLimit } from "@/lib/plan-limits";

export async function POST(req: NextRequest) {
  let user;
  try { user = await requireAuth("staff"); } catch {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const contentType = req.headers.get("content-type") ?? "";
  let name: string, durationMin: number, price: number;

  if (contentType.includes("application/json")) {
    let body: Record<string, unknown>;
    try { body = await req.json(); } catch {
      return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
    }
    name        = String(body.name        ?? "").trim();
    durationMin = parseInt(String(body.durationMin ?? "30"), 10);
    price       = parseFloat(String(body.price ?? "0"));
  } else {
    let fd: FormData;
    try { fd = await req.formData(); } catch {
      return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
    }
    name        = String(fd.get("name")        ?? "").trim();
    durationMin = parseInt(String(fd.get("durationMin") ?? "30"), 10);
    price       = parseFloat(String(fd.get("price") ?? "0"));
  }

  if (!name || name.length < 2) {
    return NextResponse.json({ error: "El nombre del servicio es requerido." }, { status: 400 });
  }
  if (isNaN(durationMin) || durationMin < 5) {
    return NextResponse.json({ error: "La duración mínima es 5 minutos." }, { status: 400 });
  }
  if (isNaN(price) || price < 0) {
    return NextResponse.json({ error: "El precio no es válido." }, { status: 400 });
  }

  const tenant = await prisma.tenant.findUnique({
    where:  { id: user.tenantId },
    select: { plan: true },
  });
  const canAdd = await checkServiceLimit(user.tenantId, tenant?.plan ?? "free");
  if (!canAdd) {
    return NextResponse.json(
      { error: "Alcanzaste el límite de servicios de tu plan. Actualizá para agregar más." },
      { status: 402 },
    );
  }

  try {
    const service = await prisma.turneraService.create({
      data: { tenantId: user.tenantId, name, durationMin, price },
      select: { id: true, name: true, durationMin: true, price: true },
    });
    return NextResponse.json({ ok: true, service }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
