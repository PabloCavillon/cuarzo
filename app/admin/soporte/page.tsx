import { redirect } from "next/navigation";
import { requireAuth, apiError } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { SoporteClient } from "./SoporteClient";

export default async function SoportePage() {
  let user;
  try { user = await requireAuth("staff"); } catch (e) {
    void apiError(e); redirect("/login");
  }

  const tickets = await prisma.supportTicket.findMany({
    where:   { tenantId: user.tenantId },
    include: {
      user:    { select: { id: true, name: true } },
      replies: { select: { id: true, fromAdmin: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">Soporte</h2>
        <p className="text-sm text-white/40 mt-0.5">Enviá consultas o reportá problemas al equipo de Cuarzo</p>
      </div>
      <SoporteClient
        initialTickets={tickets.map((t) => ({
          id:        t.id,
          subject:   t.subject,
          status:    t.status,
          createdAt: t.createdAt.toISOString(),
          userName:  t.user.name,
          replyCount: t.replies.length,
          hasAdminReply: t.replies.some((r) => r.fromAdmin),
          lastActivity: (t.replies[0]?.createdAt ?? t.createdAt).toISOString(),
        }))}
      />
    </div>
  );
}
