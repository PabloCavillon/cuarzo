import { redirect } from "next/navigation";
import { requireSuperAdmin, apiError } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { SuperAdminClient } from "./SuperAdminClient";

export default async function SuperAdminPage() {
  let user;
  try {
    user = await requireSuperAdmin();
  } catch (e) {
    void apiError(e);
    redirect("/login");
  }

  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id:        true,
      name:      true,
      slug:      true,
      plan:      true,
      active:    true,
      onboarded: true,
      createdAt: true,
      _count: {
        select: { users: true, modules: true },
      },
    },
  });

  return (
    <div className="min-h-screen bg-[#0a1628] px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="text-xs text-white/30 mb-1">Super Admin · {user.email}</p>
          <h1 className="text-2xl font-bold text-white">Panel Global</h1>
          <p className="text-sm text-white/40 mt-1">{tenants.length} tenants registrados</p>
        </div>

        <SuperAdminClient
          tenants={tenants.map((t) => ({
            id:        t.id,
            name:      t.name,
            slug:      t.slug,
            plan:      t.plan,
            active:    t.active,
            onboarded: t.onboarded,
            createdAt: t.createdAt.toISOString(),
            users:     t._count.users,
            modules:   t._count.modules,
          }))}
          currentViewTenantId={user.tenantId !== user.realTenantId ? user.tenantId : null}
        />
      </div>
    </div>
  );
}
