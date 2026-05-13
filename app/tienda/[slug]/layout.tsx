import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CuarzoIsotype } from "@/app/components/CuarzoLogo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: { name: true },
  });
  if (!tenant) return {};
  return {
    title: `${tenant.name} · Catálogo`,
    description: `Catálogo de productos de ${tenant.name}`,
  };
}

export default async function TiendaLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: { id: true, name: true, active: true },
  });

  if (!tenant || !tenant.active) notFound();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/" className="flex items-center">
              <CuarzoIsotype height={22} />
            </Link>
            <span className="text-gray-200 text-sm select-none mx-1">/</span>
            <Link
              href={`/tienda/${slug}`}
              className="font-semibold text-gray-800 text-sm hover:text-navy-700 transition-colors"
            >
              {tenant.name}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="py-6 border-t border-gray-100 bg-white">
        <p className="text-center text-xs text-gray-300">
          Powered by{" "}
          <Link href="/" className="hover:text-gray-500 transition-colors">
            Cuarzo
          </Link>{" "}
          · {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
