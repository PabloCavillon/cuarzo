import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export interface ServiceResponse {
  id: string;
  name: string;
  description: string;
  durationMin: number;
  price: number;
  sortOrder: number;
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug") ?? "demo";
  try {
    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) {
      return NextResponse.json({ error: "Servicio no disponible." }, { status: 503 });
    }

    const services = await prisma.turneraService.findMany({
      where: { tenantId: tenant.id, active: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        durationMin: true,
        price: true,
        sortOrder: true,
      },
    });

    // Convert Decimal → number for JSON serialization
    const payload: ServiceResponse[] = services.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description ?? "",
      durationMin: s.durationMin,
      price: Number(s.price),
      sortOrder: s.sortOrder,
    }));

    return NextResponse.json({ services: payload }, {
      headers: {
        // Cache for 5 minutes in the browser; Vercel CDN can cache for up to 60s
        "Cache-Control": "public, max-age=300, s-maxage=60, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    console.error("[GET /api/appointments/services]", err);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
