import { redirect } from "next/navigation";
import { requireAuth, apiError } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { NewOrderForm } from "./NewOrderForm";

export default async function NewOrderPage() {
  let user;
  try {
    user = await requireAuth("staff");
  } catch (e) {
    void apiError(e);
    redirect("/login");
  }

  const products = await prisma.catalogProduct.findMany({
    where:   { tenantId: user.tenantId, active: true },
    select:  {
      id:           true,
      sku:          true,
      name:         true,
      basePrice:    true,
      category:     { select: { name: true } },
    },
    orderBy: { name: "asc" },
    take:    500,
  });

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">Nuevo pedido</h2>
        <p className="text-sm text-white/40 mt-0.5">Creá un pedido manualmente</p>
      </div>
      <NewOrderForm
        products={products.map((p) => ({
          id:           p.id,
          sku:          p.sku,
          name:         p.name,
          basePrice:    p.basePrice.toString(),
          categoryName: p.category?.name ?? null,
        }))}
      />
    </div>
  );
}
