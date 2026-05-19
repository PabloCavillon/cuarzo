import { notFound } from "next/navigation";
import Link from "next/link";
import { Package } from "lucide-react";
import { prisma } from "@/lib/db/prisma";

function fmt(n: number | string | { toString(): string }) {
  return Number(n).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

type Product = {
  id: string;
  name: string;
  description: string | null;
  basePrice: { toString(): string };
  categoryId: string | null;
  variants: { id: string; name: string; priceDelta: { toString(): string } }[];
};

function ProductGrid({
  products,
  slug,
}: {
  products: Product[];
  slug: string;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((p) => (
        <Link
          key={p.id}
          href={`/tienda/${slug}/producto/${p.id}`}
          className="group bg-white rounded-2xl border border-gray-100 p-4 hover:border-navy-200 hover:shadow-md transition-all"
        >
          <div className="aspect-square bg-gray-50 rounded-xl mb-3 flex items-center justify-center">
            <Package className="w-8 h-8 text-gray-200 group-hover:text-navy-200 transition-colors" />
          </div>
          <p className="text-sm font-semibold text-gray-800 mb-0.5 truncate group-hover:text-navy-700 transition-colors">
            {p.name}
          </p>
          {p.description && (
            <p className="text-xs text-gray-400 line-clamp-2 mb-2">
              {p.description}
            </p>
          )}
          <p className="text-sm font-bold text-navy-800">$ {fmt(p.basePrice)}</p>
          {p.variants.length > 0 && (
            <p className="text-[10px] text-gray-400 mt-0.5">
              {p.variants.length} variante{p.variants.length !== 1 ? "s" : ""}
            </p>
          )}
        </Link>
      ))}
    </div>
  );
}

export default async function TiendaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: { id: true, name: true },
  });
  if (!tenant) notFound();

  const [products, categories] = await Promise.all([
    prisma.catalogProduct.findMany({
      where: { tenantId: tenant.id, active: true },
      orderBy: { name: "asc" },
      include: {
        variants: {
          where: { active: true },
          select: { id: true, name: true, priceDelta: true },
        },
      },
    }),
    prisma.catalogCategory.findMany({
      where: { tenantId: tenant.id },
      orderBy: { name: "asc" },
    }),
  ]);

  const byCategory = categories
    .map((cat) => ({
      ...cat,
      products: products.filter((p) => p.categoryId === cat.id),
    }))
    .filter((c) => c.products.length > 0);

  const uncategorized = products.filter((p) => !p.categoryId);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Hero label */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {products.length} producto{products.length !== 1 ? "s" : ""} disponible{products.length !== 1 ? "s" : ""}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No hay productos disponibles aún.</p>
        </div>
      ) : (
        <>
          {byCategory.map((cat) => (
            <section key={cat.id}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 border-b border-gray-100 pb-2">
                {cat.name}
              </h2>
              <ProductGrid products={cat.products} slug={slug} />
            </section>
          ))}

          {uncategorized.length > 0 && (
            <section>
              {byCategory.length > 0 && (
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 border-b border-gray-100 pb-2">
                  Otros
                </h2>
              )}
              <ProductGrid products={uncategorized} slug={slug} />
            </section>
          )}
        </>
      )}
    </div>
  );
}
