import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { InviteClient } from "./InviteClient";

type P = Promise<{ token: string }>;

export default async function InvitePage({ params }: { params: P }) {
  const { token } = await params;

  const inv = await prisma.invitation.findUnique({
    where:   { token },
    include: { tenant: { select: { name: true } } },
  });

  if (!inv || inv.acceptedAt) {
    redirect("/login?error=invalid_invite");
  }

  if (inv.expiresAt < new Date()) {
    redirect("/login?error=expired_invite");
  }

  return (
    <InviteClient
      token={token}
      email={inv.email}
      role={inv.role}
      tenantName={inv.tenant.name}
    />
  );
}
