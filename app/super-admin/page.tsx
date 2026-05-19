import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { requireSuperAdmin, apiError } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { SuperPanel } from "./SuperPanel";

export default async function SuperAdminPage() {
  let user;
  try {
    user = await requireSuperAdmin();
  } catch (e) {
    void apiError(e);
    redirect("/login");
  }

  const jar = await cookies();
  if (!jar.get("sa-pin")?.value) {
    redirect("/super-admin/login");
  }

  const [tenants, tickets] = await Promise.all([
    prisma.tenant.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, slug: true, plan: true,
        active: true, onboarded: true, createdAt: true,
        _count: { select: { users: true, modules: true } },
      },
    }),
    prisma.supportTicket.findMany({
      orderBy: { updatedAt: "desc" },
      take: 200,
      include: {
        tenant:  { select: { id: true, name: true } },
        user:    { select: { id: true, name: true } },
        replies: { select: { id: true } },
      },
    }),
  ]);

  return (
    <SuperPanel
      user={{ email: user.email, name: user.name }}
      currentViewTenantId={user.tenantId !== user.realTenantId ? user.tenantId : null}
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
      tickets={tickets.map((t) => ({
        id:         t.id,
        subject:    t.subject,
        status:     t.status,
        createdAt:  t.createdAt.toISOString(),
        tenantName: t.tenant.name,
        tenantId:   t.tenant.id,
        userName:   t.user.name,
        replyCount: t.replies.length,
      }))}
    />
  );
}
