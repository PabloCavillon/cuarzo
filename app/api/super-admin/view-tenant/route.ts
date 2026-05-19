import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin, apiError, VIEW_TENANT_COOKIE } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

// POST /api/super-admin/view-tenant  { tenantId }  → set viewing cookie
export async function POST(req: NextRequest) {
  try { await requireSuperAdmin(); } catch (e) {
    return apiError(e);
  }

  const { tenantId } = await req.json().catch(() => ({})) as { tenantId?: string };
  if (!tenantId) {
    return NextResponse.json({ error: "tenantId requerido." }, { status: 400 });
  }

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { id: true } });
  if (!tenant) {
    return NextResponse.json({ error: "Tenant no encontrado." }, { status: 404 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(VIEW_TENANT_COOKIE, tenantId, {
    httpOnly: true,
    sameSite: "lax",
    path:     "/",
    maxAge:   60 * 60 * 8, // 8 hours
  });
  return res;
}

// DELETE → clear viewing cookie
export async function DELETE() {
  try { await requireSuperAdmin(); } catch (e) {
    return apiError(e);
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(VIEW_TENANT_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
