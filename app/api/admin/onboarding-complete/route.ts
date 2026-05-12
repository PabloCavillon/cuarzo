import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return Response.json({ error: "No autenticado." }, { status: 401 });
  }

  await prisma.tenant.update({
    where: { id: session.user.tenantId },
    data:  { onboarded: true },
  });

  return Response.json({ ok: true });
}
