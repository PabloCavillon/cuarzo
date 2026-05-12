import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAuth, apiError } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { SuppliersClient } from "./SuppliersClient";

type SP = Promise<Record<string, string | undefined>>;

export default async function SuppliersPage({ searchParams }: { searchParams: SP }) {
  let user;
  try {
    user = await requireAuth("staff");
  } catch (e) {
    void apiError(e);
    redirect("/login");
  }

  const sp      = await searchParams;
  const tid     = user.tenantId;
  const q       = sp.q?.trim() ?? "";
  const showAll = !!sp.inactive;

  const suppliers = await prisma.supplier.findMany({
    where: {
      tenantId: tid,
      ...(showAll ? {} : { active: true }),
      ...(q ? {
        OR: [
          { name:        { contains: q, mode: "insensitive" } },
          { contactName: { contains: q, mode: "insensitive" } },
          { email:       { contains: q, mode: "insensitive" } },
        ],
      } : {}),
    },
    orderBy: { name: "asc" },
    take: 200,
  });

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <Link
        href="/admin/clients"
        className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Clients
      </Link>

      <div>
        <h2 className="text-xl font-bold text-white">Proveedores</h2>
        <p className="text-sm text-white/40 mt-0.5">Base de proveedores</p>
      </div>

      <SuppliersClient
        suppliers={suppliers.map((s) => ({
          ...s,
          createdAt: s.createdAt.toISOString(),
        }))}
        filters={{ q, inactive: showAll ? "1" : "" }}
      />
    </div>
  );
}
