import { redirect } from "next/navigation";
import { requireAuth, apiError } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CajaClient } from "./CajaClient";

type SP = Promise<Record<string, string | undefined>>;

export default async function CajaPage({ searchParams }: { searchParams: SP }) {
  let user;
  try {
    user = await requireAuth("staff");
  } catch (e) {
    void apiError(e);
    redirect("/login");
  }

  const sp    = await searchParams;
  const tid   = user.tenantId;
  const tipo  = sp.tipo?.trim() ?? "";
  const desde = sp.desde?.trim() ?? "";
  const hasta = sp.hasta?.trim() ?? "";

  const where = {
    tenantId: tid,
    ...(tipo ? { tipo: tipo as "ingreso" | "egreso" } : {}),
    ...(desde || hasta
      ? {
          fecha: {
            ...(desde ? { gte: new Date(desde) } : {}),
            ...(hasta ? { lte: new Date(`${hasta}T23:59:59`) } : {}),
          },
        }
      : {}),
  };

  const movimientos = await prisma.cajaMovimiento.findMany({
    where,
    orderBy: { fecha: "desc" },
    take: 500,
  });

  const allForTotals = await prisma.cajaMovimiento.findMany({
    where,
    select: { tipo: true, monto: true },
  });

  const totals = allForTotals.reduce(
    (acc, m) => {
      const v = Number(m.monto);
      if (m.tipo === "ingreso") acc.ingresos += v;
      else acc.egresos += v;
      return acc;
    },
    { ingresos: 0, egresos: 0 },
  );

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">Caja Digital</h2>
        <p className="text-sm text-white/40 mt-0.5">Registro de ingresos y egresos</p>
      </div>

      <CajaClient
        movimientos={movimientos.map((m) => ({
          id:          m.id,
          tipo:        m.tipo as "ingreso" | "egreso",
          monto:       m.monto.toString(),
          descripcion: m.descripcion,
          categoria:   m.categoria,
          metodoPago:  m.metodoPago,
          notes:       m.notes,
          fecha:       m.fecha.toISOString(),
        }))}
        filters={{ tipo, desde, hasta }}
        totals={totals}
      />
    </div>
  );
}
