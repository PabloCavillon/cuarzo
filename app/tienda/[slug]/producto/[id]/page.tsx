import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, Tag } from "lucide-react";
import { prisma } from "@/lib/db/prisma";

function fmt(n: number | string | { toString(): string }) {
  return Number(n).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!tenant) return {};
  const product = await prisma.catalogProduct.findFirst({
    where: { id, tenantId: tenant.id, active: true },
    select: { name: true, description: true },
  });
  if (!product) return {};
  return {
    title: `${product.name} · Catálogo`,
    description: product.description ?? undefined,
  };
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: { id: true, name: true },
  });
  if (!tenant) notFound();

  const product = await prisma.catalogProduct.findFirst({
    where: { id, tenantId: tenant.id, active: true },
    include: {
      category: { select: { name: true } },
      variants: {
        where: { active: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true, priceDelta: true },
      },
    },
  });

  if (!product) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <Link
        href={`/tienda/${slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al catálogo
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {/* Placeholder image area */}
        <div className="aspect-video bg-gray-50 flex items-center justify-center">
          <Package className="w-20 h-20 text-gray-100" />
        </div>

        <div className="p-6 space-y-5">
          {/* Category badge */}
          {product.category && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-navy-600 bg-navy-50 px-2.5 py-1 rounded-full">
              <Tag className="w-3 h-3" />
              {product.category.name}
            </span>
          )}

          {/* Name + SKU */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">SKU: {product.sku}</p>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-gray-500 text-sm leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Price */}
          <div className="pt-1">
            <p className="text-3xl font-bold text-navy-900">
              $ {fmt(product.basePrice)}
            </p>
          </div>

          {/* Variants */}
          {product.variants.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Variantes disponibles
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <div
                    key={v.id}
                    className="text-sm px-3 py-1.5 border border-gray-200 rounded-full text-gray-700 bg-gray-50"
                  >
                    {v.name}
                    {Number(v.priceDelta) !== 0 && (
                      <span className="text-gray-400 ml-1.5">
                        {Number(v.priceDelta) > 0 ? "+" : ""}${" "}
                        {fmt(v.priceDelta)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
