import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { toCSV, csvResponse } from "@/lib/export-csv";

const MODULES = ["clients", "suppliers", "products", "orders", "bookings", "caja"] as const;
type ExportModule = typeof MODULES[number];

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return Response.json({ error: "No autenticado." }, { status: 401 });
  }

  const tid = session.user.tenantId;
  const mod = req.nextUrl.searchParams.get("module") as ExportModule | null;

  if (!mod || !MODULES.includes(mod)) {
    return Response.json(
      { error: `Módulo inválido. Válidos: ${MODULES.join(", ")}` },
      { status: 400 }
    );
  }

  let rows: Record<string, unknown>[] = [];
  let filename = `${mod}-${new Date().toISOString().slice(0, 10)}.csv`;

  switch (mod) {
    case "clients":
      rows = (await prisma.client.findMany({
        where:   { tenantId: tid },
        orderBy: { createdAt: "desc" },
        select:  { name: true, email: true, phone: true, address: true, notes: true, active: true, createdAt: true },
      })).map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
      break;

    case "suppliers":
      rows = (await prisma.supplier.findMany({
        where:   { tenantId: tid },
        orderBy: { createdAt: "desc" },
        select:  { name: true, contactName: true, email: true, phone: true, address: true, active: true, createdAt: true },
      })).map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
      break;

    case "products":
      rows = (await prisma.catalogProduct.findMany({
        where:   { tenantId: tid },
        orderBy: { createdAt: "desc" },
        include: { category: { select: { name: true } } },
      })).map((p) => ({
        sku:         p.sku,
        name:        p.name,
        category:    p.category?.name ?? "",
        price:       p.basePrice.toString(),
        active:      p.active,
        description: p.description ?? "",
        createdAt:   p.createdAt.toISOString(),
      }));
      break;

    case "orders":
      rows = (await prisma.order.findMany({
        where:   { tenantId: tid },
        orderBy: { createdAt: "desc" },
        include: { client: { select: { name: true, email: true } } },
      })).map((o) => ({
        status:    o.status,
        client:    o.client.name,
        email:     o.client.email,
        subtotal:  o.subtotal.toString(),
        discount:  o.discount.toString(),
        total:     o.total.toString(),
        notes:     o.notes ?? "",
        createdAt: o.createdAt.toISOString(),
      }));
      break;

    case "bookings":
      rows = (await prisma.turneraBooking.findMany({
        where:   { tenantId: tid },
        orderBy: { createdAt: "desc" },
        select: {
          code: true, status: true,
          serviceNameSnap: true, date: true, time: true,
          clientName: true, clientEmail: true, clientPhone: true,
          priceSnap: true, createdAt: true,
        },
      })).map((b) => ({
        code:     b.code,
        status:   b.status,
        service:  b.serviceNameSnap,
        date:     b.date,
        time:     b.time,
        client:   b.clientName,
        email:    b.clientEmail,
        phone:    b.clientPhone ?? "",
        price:    b.priceSnap.toString(),
        createdAt: b.createdAt.toISOString(),
      }));
      break;

    case "caja":
      rows = (await prisma.cajaMovimiento.findMany({
        where:   { tenantId: tid },
        orderBy: { fecha: "desc" },
        select:  { tipo: true, monto: true, descripcion: true, categoria: true, metodoPago: true, fecha: true },
      })).map((m) => ({
        tipo:       m.tipo,
        monto:      m.monto.toString(),
        descripcion: m.descripcion,
        categoria:  m.categoria ?? "",
        metodoPago: m.metodoPago,
        fecha:      m.fecha.toISOString().slice(0, 10),
      }));
      filename = `caja-${new Date().toISOString().slice(0, 10)}.csv`;
      break;
  }

  return csvResponse(toCSV(rows), filename);
}
