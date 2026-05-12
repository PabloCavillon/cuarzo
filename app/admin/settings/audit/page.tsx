import { redirect } from "next/navigation";
import { requireAuth, apiError } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const ACTION_LABELS: Record<string, string> = {
  "invite.sent":    "Invitación enviada",
  "member.removed": "Miembro eliminado",
  "member.role":    "Rol actualizado",
  "order.status":   "Estado de pedido",
  "stock.adjusted": "Stock ajustado",
};

export default async function AuditLogPage() {
  let user;
  try {
    user = await requireAuth("admin");
  } catch (e) {
    void apiError(e);
    redirect("/login");
  }

  const logs = await prisma.auditLog.findMany({
    where:   { tenantId: user.tenantId },
    orderBy: { createdAt: "desc" },
    take:    200,
    include: { tenant: { select: { name: true } } },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">Registro de auditoría</h2>
        <p className="text-sm text-white/40 mt-0.5">Últimas 200 acciones del equipo</p>
      </div>

      <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
        {logs.length === 0 ? (
          <div className="py-12 text-center text-white/25 text-sm">
            Sin actividad registrada aún.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                {["Fecha", "Acción", "Recurso", "ID", "IP"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-white/40 font-medium uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 text-white/40 text-xs whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("es-AR", {
                      day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-white/80 text-xs font-medium">
                      {ACTION_LABELS[log.action] ?? log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/40 text-xs">{log.resource}</td>
                  <td className="px-4 py-3 text-white/25 text-xs font-mono truncate max-w-24">
                    {log.resourceId ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-white/25 text-xs">{log.ip ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
