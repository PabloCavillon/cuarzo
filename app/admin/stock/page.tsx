import { redirect } from "next/navigation";
import Link from "next/link";
import { History, Warehouse } from "lucide-react";
import { requireAuth, apiError } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { StockClient } from "./StockClient";

type SP = Promise<Record<string, string | undefined>>;

export default async function StockPage({ searchParams }: { searchParams: SP }) {
  let user;
  try {
    user = await requireAuth("staff");
  } catch (e) {
    void apiError(e);
    redirect("/login");
  }

  const sp          = await searchParams;
  const tid         = user.tenantId;
  const q           = sp.q?.trim() ?? "";
  const warehouseId = sp.warehouse ?? "";
  const showLow     = !!sp.low;

  const [products, warehouses] = await Promise.all([
    prisma.catalogProduct.findMany({
      where: {
        tenantId: tid,
        active: true,
        ...(q ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { sku:  { contains: q, mode: "insensitive" } },
          ],
        } : {}),
      },
      orderBy: { name: "asc" },
      take: 200,
      select: {
        id: true, name: true, sku: true,
        stockItems: {
          where: warehouseId ? { warehouseId } : {},
          select: { qty: true, warehouseId: true },
        },
      },
    }),
    prisma.stockWarehouse.findMany({
      where: { tenantId: tid, active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  // Build per-product stock summary
  const warehouseMap = new Map(warehouses.map((w) => [w.id, w.name]));

  const productStocks = products
    .map((p) => {
      const byWarehouse = warehouses.map((w) => ({
        id:  w.id,
        name: w.name,
        qty: p.stockItems.find((si) => si.warehouseId === w.id)?.qty ?? 0,
      }));
      const totalQty = byWarehouse.reduce((s, w) => s + w.qty, 0);
      return { id: p.id, name: p.name, sku: p.sku, totalQty, warehouseStocks: byWarehouse };
    })
    .filter((p) => !showLow || p.totalQty <= 5);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Stock</h2>
          <p className="text-sm text-white/40 mt-0.5">Inventario de productos</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/stock/movements"
            className="flex items-center gap-2 px-4 py-2 bg-white/8 hover:bg-white/12 text-white/60 hover:text-white text-sm rounded-xl transition-colors"
          >
            <History className="w-4 h-4" />
            Movimientos
          </Link>
          <Link
            href="/admin/stock/warehouses"
            className="flex items-center gap-2 px-4 py-2 bg-white/8 hover:bg-white/12 text-white/60 hover:text-white text-sm rounded-xl transition-colors"
          >
            <Warehouse className="w-4 h-4" />
            Depósitos
          </Link>
        </div>
      </div>

      <StockClient
        products={productStocks}
        warehouses={warehouses}
        filters={{ q, warehouse: warehouseId, low: showLow ? "1" : "" }}
      />
    </div>
  );
}
