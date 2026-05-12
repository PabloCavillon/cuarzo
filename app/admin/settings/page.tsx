import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth, apiError } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  let user;
  try {
    user = await requireAuth("staff");
  } catch (e) {
    void apiError(e);
    redirect("/login");
  }

  const tid = user.tenantId;

  const [tenant, modules, allUsers, invitations] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: tid } }),
    prisma.tenantModule.findMany({ where: { tenantId: tid }, orderBy: { enabledAt: "asc" } }),
    prisma.user.findMany({
      where:   { tenantId: tid },
      orderBy: { createdAt: "asc" },
      select:  { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    prisma.invitation.findMany({
      where:   { tenantId: tid, acceptedAt: null },
      orderBy: { createdAt: "desc" },
      select:  { id: true, email: true, role: true, expiresAt: true, createdAt: true },
    }),
  ]);

  if (!tenant) redirect("/login");

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">Configuración</h2>
        <p className="text-sm text-white/40 mt-0.5">Cuenta, módulos y equipo</p>
      </div>

      <SettingsClient
        tenant={{
          id:   tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          plan: tenant.plan,
        }}
        modules={modules.map((m) => ({
          module:    m.module,
          active:    m.active,
          enabledAt: m.enabledAt.toISOString(),
        }))}
        users={allUsers.map((u) => ({
          id:        u.id,
          name:      u.name,
          email:     u.email,
          role:      u.role,
          createdAt: u.createdAt.toISOString(),
        }))}
        invitations={invitations.map((inv) => ({
          id:        inv.id,
          email:     inv.email,
          role:      inv.role,
          expiresAt: inv.expiresAt.toISOString(),
          createdAt: inv.createdAt.toISOString(),
        }))}
        currentUserId={user.id}
        currentUserRole={user.role}
      />

      {["admin", "owner"].includes(user.role) && (
        <div className="bg-white/5 border border-white/8 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Registro de auditoría</p>
            <p className="text-xs text-white/40 mt-0.5">Historial de acciones del equipo</p>
          </div>
          <Link
            href="/admin/settings/audit"
            className="text-xs text-white/40 hover:text-white transition-colors"
          >
            Ver registro →
          </Link>
        </div>
      )}

      <div className="bg-white/5 border border-white/8 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Exportar datos</p>
          <p className="text-xs text-white/40 mt-0.5">Descargá tu información en CSV</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {[
            { module: "clients",   label: "Clientes"  },
            { module: "bookings",  label: "Turnos"    },
            { module: "orders",    label: "Pedidos"   },
            { module: "caja",      label: "Caja"      },
          ].map(({ module, label }) => (
            <a
              key={module}
              href={`/api/admin/export?module=${module}`}
              className="text-xs text-white/40 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
