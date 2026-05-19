import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAuth, apiError } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { WarehousesClient } from "./WarehousesClient";

export default async function WarehousesPage() {
  let user;
  try {
    user = await requireAuth("staff");
  } catch (e) {
    void apiError(e);
    redirect("/login");
  }

  const warehouses = await prisma.stockWarehouse.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { name: "asc" },
    include: { _count: { select: { stockItems: true } } },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Link
        href="/admin/stock"
        className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Stock
      </Link>

      <div>
        <h2 className="text-xl font-bold text-white">Depósitos</h2>
        <p className="text-sm text-white/40 mt-0.5">
          {warehouses.length} depósito{warehouses.length !== 1 ? "s" : ""} configurado{warehouses.length !== 1 ? "s" : ""}
        </p>
      </div>

      <WarehousesClient
        warehouses={warehouses.map((w) => ({
          id:        w.id,
          name:      w.name,
          address:   w.address,
          active:    w.active,
          itemCount: w._count.stockItems,
        }))}
      />
    </div>
  );
}
