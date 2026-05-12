import { redirect } from "next/navigation";
import Link from "next/link";
import { Truck } from "lucide-react";
import { requireAuth, apiError } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ClientsClient } from "./ClientsClient";

type SP = Promise<Record<string, string | undefined>>;

export default async function ClientsPage({ searchParams }: { searchParams: SP }) {
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

  const clients = await prisma.client.findMany({
    where: {
      tenantId: tid,
      ...(showAll ? {} : { active: true }),
      ...(q ? {
        OR: [
          { name:  { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q, mode: "insensitive" } },
        ],
      } : {}),
    },
    orderBy: { name: "asc" },
    take: 200,
  });

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Clients</h2>
          <p className="text-sm text-white/40 mt-0.5">Base de clientes</p>
        </div>
        <Link
          href="/admin/clients/suppliers"
          className="flex items-center gap-2 px-4 py-2 bg-white/8 hover:bg-white/12 text-white/60 hover:text-white text-sm rounded-xl transition-colors"
        >
          <Truck className="w-4 h-4" />
          Proveedores
        </Link>
      </div>

      <ClientsClient
        clients={clients.map((c) => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
        }))}
        filters={{ q, inactive: showAll ? "1" : "" }}
      />
    </div>
  );
}
