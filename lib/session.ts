import "server-only";
import { auth } from "@/auth";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export type UserRole = "owner" | "admin" | "staff";

export const VIEW_TENANT_COOKIE = "x-cuarzo-view-tenant";

export interface AuthUser {
  id:            string;
  email:         string;
  name:          string;
  role:          UserRole;
  tenantId:      string;  // effective tenant (may differ from real tenant for super admins)
  realTenantId:  string;  // the user's own tenant
  superAdmin:    boolean;
}

const ROLE_WEIGHT: Record<UserRole, number> = { owner: 3, admin: 2, staff: 1 };

// ─── requireAuth ─────────────────────────────────────────────────────────────
// Call this at the top of every protected Route Handler.
//
// What it does:
//   1. Verifies the JWT signature via NextAuth (cryptographic, no DB).
//   2. Fetches the current user from the DB (catches revocations, role
//      changes, and deactivations that happened after the token was issued).
//   3. Optionally enforces a minimum role.
//   4. Super admins can impersonate any tenant via VIEW_TENANT_COOKIE.
//
// Throws an Error with a `status` property on failure so callers can:
//   catch (e) { return apiError(e) }

export async function requireAuth(minRole?: UserRole): Promise<AuthUser> {
  const session = await auth();
  const userId  = session?.user?.id;

  if (!userId) {
    throw authError(401, "No autorizado.");
  }

  // Always verify against DB — JWT alone is not enough for revocation
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { id: true, email: true, name: true, role: true, tenantId: true, active: true, superAdmin: true },
  });

  if (!user || !user.active) {
    throw authError(401, "No autorizado.");
  }

  if (minRole !== undefined) {
    const userWeight = ROLE_WEIGHT[user.role as UserRole] ?? 0;
    const minWeight  = ROLE_WEIGHT[minRole]               ?? 0;
    // Super admins bypass role checks
    if (!user.superAdmin && userWeight < minWeight) {
      throw authError(403, "Acceso denegado.");
    }
  }

  // Resolve effective tenantId — super admins can view any tenant
  let effectiveTenantId = user.tenantId;
  if (user.superAdmin) {
    const jar      = await cookies();
    const viewSlug = jar.get(VIEW_TENANT_COOKIE)?.value;
    if (viewSlug) {
      const viewTenant = await prisma.tenant.findUnique({
        where:  { id: viewSlug },
        select: { id: true },
      });
      if (viewTenant) effectiveTenantId = viewTenant.id;
    }
  }

  return {
    id:           user.id,
    email:        user.email,
    name:         user.name,
    role:         user.role as UserRole,
    tenantId:     effectiveTenantId,
    realTenantId: user.tenantId,
    superAdmin:   user.superAdmin,
  };
}

// ─── requireSuperAdmin ───────────────────────────────────────────────────────

export async function requireSuperAdmin(): Promise<AuthUser> {
  const user = await requireAuth();
  if (!user.superAdmin) {
    throw authError(403, "Acceso denegado.");
  }
  return user;
}

// ─── apiError ────────────────────────────────────────────────────────────────
// Returns a NextResponse-compatible Response for auth errors.
// Usage:  catch (e) { return apiError(e) }

export function apiError(e: unknown): Response {
  const err = e as { status?: number; message?: string };
  const status  = err.status  ?? 500;
  const message = err.message ?? "Error del servidor.";
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function authError(status: number, message: string): Error {
  return Object.assign(new Error(message), { status });
}
