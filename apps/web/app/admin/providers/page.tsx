import { redirect } from "next/navigation";
import { requireAuth, apiError } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { ProvidersClient } from "./ProvidersClient";

type SP = Promise<Record<string, string | undefined>>;

export default async function ProvidersPage({ searchParams }: { searchParams: SP }) {
  let user;
  try {
    user = await requireAuth("staff");
  } catch (e) {
    void apiError(e);
    redirect("/login");
  }

  const sp      = await searchParams;
  const q       = sp.q?.trim() ?? "";
  const showAll = !!sp.inactive;

  const providers = await prisma.supplier.findMany({
    where: {
      tenantId: user.tenantId,
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
      <div>
        <h2 className="text-xl font-bold text-white">Providers</h2>
        <p className="text-sm text-white/40 mt-0.5">
          Manage your supplier and vendor directory
        </p>
      </div>

      <ProvidersClient
        providers={providers.map((p) => ({
          ...p,
          createdAt: p.createdAt.toISOString(),
        }))}
        filters={{ q, inactive: showAll ? "1" : "" }}
      />
    </div>
  );
}
