import { redirect } from "next/navigation";
import Link from "next/link";
import { FolderTree } from "lucide-react";
import { requireAuth, apiError } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ProductsClient } from "./ProductsClient";

type SP = Promise<Record<string, string | undefined>>;

export default async function CatalogPage({ searchParams }: { searchParams: SP }) {
  let user;
  try {
    user = await requireAuth("staff");
  } catch (e) {
    void apiError(e);
    redirect("/login");
  }

  const sp         = await searchParams;
  const tid        = user.tenantId;
  const q          = sp.q?.trim() ?? "";
  const categoryId = sp.category ?? "";
  const showAll    = !!sp.inactive;

  const [products, categories] = await Promise.all([
    prisma.catalogProduct.findMany({
      where: {
        tenantId: tid,
        ...(showAll ? {} : { active: true }),
        ...(categoryId ? { categoryId } : {}),
        ...(q ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { sku:  { contains: q, mode: "insensitive" } },
          ],
        } : {}),
      },
      orderBy: { name: "asc" },
      take: 100,
      include: {
        category: { select: { id: true, name: true, parentId: true } },
        _count:   { select: { variants: true } },
      },
    }),
    prisma.catalogCategory.findMany({
      where: { tenantId: tid },
      orderBy: { name: "asc" },
      include: { parent: { select: { name: true } } },
    }),
  ]);

  const categoryOptions = categories.map((c) => ({
    id:         c.id,
    name:       c.name,
    parentName: c.parent?.name ?? null,
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Catalog</h2>
          <p className="text-sm text-white/40 mt-0.5">Gestión de productos</p>
        </div>
        <Link
          href="/admin/catalog/categories"
          className="flex items-center gap-2 px-4 py-2 bg-white/8 hover:bg-white/12 text-white/60 hover:text-white text-sm rounded-xl transition-colors"
        >
          <FolderTree className="w-4 h-4" />
          Categorías
        </Link>
      </div>

      <ProductsClient
        products={products.map((p) => ({
          id:           p.id,
          name:         p.name,
          sku:          p.sku,
          description:  p.description,
          basePrice:    p.basePrice.toString(),
          active:       p.active,
          categoryId:   p.categoryId,
          categoryName: p.category?.name ?? null,
          variantCount: p._count.variants,
        }))}
        categories={categoryOptions}
        filters={{ q, category: categoryId, inactive: showAll ? "1" : "" }}
      />
    </div>
  );
}
