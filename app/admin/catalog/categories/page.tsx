import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAuth, apiError } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CategoriesClient } from "./CategoriesClient";

export default async function CategoriesPage() {
  let user;
  try {
    user = await requireAuth("staff");
  } catch (e) {
    void apiError(e);
    redirect("/login");
  }

  const categories = await prisma.catalogCategory.findMany({
    where: { tenantId: user.tenantId },
    orderBy: [{ parentId: "asc" }, { name: "asc" }],
    include: {
      parent: { select: { name: true } },
      _count: { select: { products: true, children: true } },
    },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Link
        href="/admin/catalog"
        className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Catalog
      </Link>

      <div>
        <h2 className="text-xl font-bold text-white">Categorías</h2>
        <p className="text-sm text-white/40 mt-0.5">
          {categories.length} categoría{categories.length !== 1 ? "s" : ""}
        </p>
      </div>

      <CategoriesClient
        categories={categories.map((c) => ({
          id:           c.id,
          name:         c.name,
          parentId:     c.parentId,
          parentName:   c.parent?.name ?? null,
          productCount: c._count.products,
          childCount:   c._count.children,
        }))}
      />
    </div>
  );
}
