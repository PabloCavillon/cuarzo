import { redirect } from "next/navigation";
import { requireAuth, apiError } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "./components/AdminShell";
import type { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  let user;
  try {
    user = await requireAuth("staff");
  } catch (e) {
    void apiError(e);
    redirect("/login");
  }

  const modules = await prisma.tenantModule.findMany({
    where: { tenantId: user.tenantId, active: true },
    select: { module: true },
  });

  return (
    <AdminShell user={user} activeModules={modules.map((m) => m.module)}>
      {children}
    </AdminShell>
  );
}
