import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
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
    select: { onboarded: true },
  });

  if (tenant?.onboarded) redirect("/admin");

  return <OnboardingClient />;
}
