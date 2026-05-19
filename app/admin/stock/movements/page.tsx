import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAuth, apiError } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

const REASON_LABELS: Record<string, string> = {
  sale:            "Venta",
  purchase:        "Compra",
  return_customer: "Dev. cliente",
  return_supplier: "Dev. proveedor",
  adjustment:      "Ajuste manual",
  damage:          "Daño / merma",
  initial:         "Stock inicial",
};

export default async function MovementsPage() {
  let user;
  try {
    user = await requireAuth("staff");
  } catch (e) {
    void apiError(e);
    redirect("/login");
  }

  const tid = user.tenantId;

  const [movements, products] = await Promise.all([
    prisma.stockMovement.findMany({
      where: { tenantId: tid },
      orderBy: { createdAt: "desc" },
      take: 150,
      include: { warehouse: { select: { name: true } } },
    }),
    prisma.catalogProduct.findMany({
      where: { tenantId: tid },
      select: { id: true, name: true, sku: true },
    }),
  ]);

  const productMap = new Map(products.map((p) => [p.id, p]));

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <Link
        href="/admin/stock"
        className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Stock
      </Link>

      <div>
        <h2 className="text-xl font-bold text-white">Movimientos</h2>
        <p className="text-sm text-white/40 mt-0.5">Últimos {movements.length} movimientos del ledger</p>
      </div>

      <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
        {movements.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-white/25">Sin movimientos registrados aún</p>
          </div>
        ) : (
          <>
            <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-white/8">
              {["Producto", "Depósito", "Motivo", "Delta", "Fecha"].map((h) => (
                <p key={h} className="text-[10px] font-semibold text-white/30 uppercase tracking-wide last:text-right">
                  {h}
                </p>
              ))}
            </div>

            <div className="divide-y divide-white/5">
              {movements.map((m) => {
                const product = productMap.get(m.productId);
                const isPositive = m.delta > 0;

                return (
                  <div
                    key={m.id}
                    className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto_auto_auto] gap-x-4 gap-y-0.5 px-5 py-3.5 items-center"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {product?.name ?? <span className="text-white/30 italic">Producto eliminado</span>}
                      </p>
                      {product && (
                        <p className="text-xs text-white/30 font-mono">{product.sku}</p>
                      )}
                      {m.notes && (
                        <p className="text-xs text-white/25 italic truncate mt-0.5">{m.notes}</p>
                      )}
                    </div>

                    <p className="text-xs text-white/50 sm:hidden text-right">
                      {m.warehouse.name}
                    </p>

                    <p className="hidden sm:block text-xs text-white/50 truncate max-w-28">
                      {m.warehouse.name}
                    </p>

                    <p className="hidden sm:block text-xs text-white/40">
                      {REASON_LABELS[m.reason] ?? m.reason}
                    </p>

                    <p
                      className={`hidden sm:block text-sm font-bold text-right ${
                        isPositive ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {isPositive ? "+" : ""}{m.delta}
                    </p>

                    <p className="hidden sm:block text-xs text-white/30 text-right whitespace-nowrap">
                      {m.createdAt.toLocaleDateString("es-AR", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
