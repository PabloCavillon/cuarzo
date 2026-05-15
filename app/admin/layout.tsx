import { redirect } from "next/navigation";
import { cookies } from "next/headers";
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

  // Enforce email verification
  const dbUser = await prisma.user.findUnique({
    where:  { id: user.id },
    select: { emailVerified: true, totpEnabled: true },
  });

  if (!dbUser?.emailVerified) {
    redirect("/verify-email");
  }

  // Enforce 2FA when enabled
  if (dbUser.totpEnabled) {
    const jar     = await cookies();
    const verified = jar.get("x-2fa-auth")?.value;
    if (verified !== user.id) {
      redirect("/admin/2fa");
    }
  }

  const modules = await prisma.tenantModule.findMany({
    where:  { tenantId: user.tenantId, active: true },
    select: { module: true },
  });

  return (
    <AdminShell user={user} activeModules={modules.map((m) => m.module)}>
      {children}
    </AdminShell>
  );
}
