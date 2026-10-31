"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { inBackground } from "@/lib/integrations/background";
import { sendInvitation } from "@/lib/integrations/email";
import { checkMemberLimit } from "@/lib/utils/plan-limits";
import { audit } from "@/lib/utils/audit";
import { getRequestIp } from "@/lib/utils/request-ip";

type ActionResult = { ok: true } | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/;

// ─── Invite member ────────────────────────────────────────────────────────────

export async function inviteMember(fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireAuth("admin");
    const tid  = user.tenantId;

    const email = (fd.get("email") as string)?.trim().toLowerCase();
    const role  = (fd.get("role")  as string)?.trim() ?? "staff";

    if (!email || !EMAIL_RE.test(email)) return { ok: false, error: "Invalid email" };
    if (!["admin", "staff"].includes(role))  return { ok: false, error: "Invalid role" };

    // Login finds users by email alone, so one email can only live in one business.
    const existing = await prisma.user.findFirst({ where: { email } });
    if (existing) return { ok: false, error: "Ya existe una cuenta con ese email" };

    const tenant = await prisma.tenant.findUnique({ where: { id: tid }, select: { name: true, plan: true } });

    // Plan limit check
    const canInvite = await checkMemberLimit(tid, tenant?.plan ?? "free");
    if (!canInvite) return { ok: false, error: "You have reached your plan member limit. Upgrade to add more." };

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const inv = await prisma.invitation.upsert({
      where:  { tenantId_email: { tenantId: tid, email } },
      create: { tenantId: tid, email, role: role as never, expiresAt },
      update: { role: role as never, expiresAt, acceptedAt: null },
    });

    inBackground(() => sendInvitation({
      to:         email,
      tenantName: tenant?.name ?? "Cuarzo",
      invitedBy:  user.name,
      role,
      token:      inv.token,
    }));

    const ip = await getRequestIp();
    inBackground(() => audit(tid, user.id, "invite.sent", "invitation", inv.id, { email, role }, ip));
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error inesperado" };
  }
}

// ─── Cancel invitation ────────────────────────────────────────────────────────

export async function cancelInvitation(id: string): Promise<ActionResult> {
  try {
    const user = await requireAuth("admin");
    const inv  = await prisma.invitation.findUnique({ where: { id } });
    if (!inv || inv.tenantId !== user.tenantId) return { ok: false, error: "No encontrado" };

    await prisma.invitation.delete({ where: { id } });
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error inesperado" };
  }
}

// ─── Remove member ────────────────────────────────────────────────────────────

export async function removeMember(targetId: string): Promise<ActionResult> {
  try {
    const user = await requireAuth("admin");
    const tid  = user.tenantId;

    if (targetId === user.id) return { ok: false, error: "You cannot remove yourself" };

    const target = await prisma.user.findUnique({ where: { id: targetId } });
    if (!target || target.tenantId !== tid) return { ok: false, error: "Usuario no encontrado" };
    if (target.role === "owner") return { ok: false, error: "No se puede eliminar al owner" };

    // Tasks and tickets require an author: they stay with whoever removes the member.
    await prisma.$transaction([
      prisma.task.updateMany({ where: { createdById: targetId }, data: { createdById: user.id } }),
      prisma.supportTicket.updateMany({ where: { userId: targetId }, data: { userId: user.id } }),
      prisma.user.delete({ where: { id: targetId } }),
    ]);
    const ip = await getRequestIp();
    inBackground(() => audit(tid, user.id, "member.removed", "user", targetId, { removedEmail: target.email }, ip));
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error inesperado" };
  }
}

// ─── Update role ──────────────────────────────────────────────────────────────

export async function updateMemberRole(targetId: string, role: string): Promise<ActionResult> {
  try {
    const user = await requireAuth("admin");
    const tid  = user.tenantId;

    if (!["admin", "staff"].includes(role)) return { ok: false, error: "Invalid role" };
    if (targetId === user.id) return { ok: false, error: "You cannot change your own role" };

    const target = await prisma.user.findUnique({ where: { id: targetId } });
    if (!target || target.tenantId !== tid) return { ok: false, error: "Usuario no encontrado" };
    if (target.role === "owner") return { ok: false, error: "No se puede cambiar el rol del owner" };

    await prisma.user.update({ where: { id: targetId }, data: { role: role as never } });
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error inesperado" };
  }
}
