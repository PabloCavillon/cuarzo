import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import OnboardingClient from "./OnboardingClient";

export default async function OnboardingPage() {
  let user;
  try {
    user = await requireAuth("owner");
  } catch {
    redirect("/login");
  }

  const tenant = await prisma.tenant.findUnique({
    where:  { id: user.tenantId },
    select: { onboarded: true, plan: true },
  });

  if (tenant?.onboarded) redirect("/admin");

  return <OnboardingClient plan={tenant?.plan ?? "free"} />;
}
