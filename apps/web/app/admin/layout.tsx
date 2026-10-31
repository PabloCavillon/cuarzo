import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { requireAuth, apiError, hasValidProof, TWO_FA_COOKIE } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AdminShell } from "./components/AdminShell";
import type { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  let user;
  try {
    user = await requireAuth("staff", { pending: true });
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
    if (!hasValidProof(jar.get(TWO_FA_COOKIE)?.value, "2fa", user.id, user.sessionVersion)) {
      redirect("/2fa");
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
