import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import type { ModuleSlug } from "@/prisma/generated/client";
import { requireAuth } from "@/lib/auth/session";
import { hasModule } from "@/lib/utils/plan-limits";

export async function ModuleGate({ module, children }: { module: ModuleSlug; children: ReactNode }) {
  let user;
  try {
    user = await requireAuth("staff", { pending: true });
  } catch {
    redirect("/login");
  }
  if (!(await hasModule(user.tenantId, module))) redirect("/admin");
  return children;
}
