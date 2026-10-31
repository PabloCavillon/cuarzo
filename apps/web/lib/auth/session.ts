import "server-only";
import { auth } from "@/auth";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/db/prisma";

export type UserRole = "owner" | "admin" | "staff";

export const VIEW_TENANT_COOKIE = "x-cuarzo-view-tenant";
export const TWO_FA_COOKIE      = "x-2fa-auth";
export const SUPER_ADMIN_COOKIE = "sa-pin";

// Cookie value proving a second factor was passed. Signed so it cannot be
// forged from the user id, and bound to sessionVersion so it dies on password reset.
export function signProof(kind: "2fa" | "super-admin", userId: string, sessionVersion: number): string {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET not configured");
  return createHmac("sha256", secret).update(`${kind}:${userId}:${sessionVersion}`).digest("hex");
}

export function hasValidProof(
  value: string | undefined,
  kind: "2fa" | "super-admin",
  userId: string,
  sessionVersion: number,
): boolean {
  if (!value) return false;
  const expected = Buffer.from(signProof(kind, userId, sessionVersion));
  const actual   = Buffer.from(value);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export interface AuthUser {
  id:            string;
  email:         string;
  name:          string;
  role:          UserRole;
  tenantId:      string;  // effective tenant (may differ from real tenant for super admins)
  realTenantId:  string;  // the user's own tenant
  superAdmin:    boolean;
  sessionVersion: number;
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

// pending: true is only for the screens that finish a login (2FA, email check).
export async function requireAuth(minRole?: UserRole, opts: { pending?: boolean } = {}): Promise<AuthUser> {
  const session = await auth();
  const userId  = session?.user?.id;

  if (!userId) {
    throw authError(401, "No autorizado.");
  }

  // Always verify against DB — JWT alone is not enough for revocation
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: {
      id: true, email: true, name: true, role: true, tenantId: true, active: true, superAdmin: true,
      emailVerified: true, totpEnabled: true, sessionVersion: true,
    },
  });

  if (!user || !user.active) {
    throw authError(401, "No autorizado.");
  }

  const sessionVersion = user.sessionVersion ?? 0;
  if ((session?.user?.sessionVersion ?? 0) !== sessionVersion) {
    throw authError(401, "No autorizado.");
  }

  const jar = await cookies();

  if (!opts.pending) {
    if (!user.emailVerified) throw authError(403, "Verificá tu email.");
    if (user.totpEnabled && !hasValidProof(jar.get(TWO_FA_COOKIE)?.value, "2fa", user.id, sessionVersion)) {
      throw authError(403, "Verificación en dos pasos requerida.");
    }
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
  if (user.superAdmin && hasValidProof(jar.get(SUPER_ADMIN_COOKIE)?.value, "super-admin", user.id, sessionVersion)) {
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
    sessionVersion,
  };
}

// ─── requireSuperAdmin ───────────────────────────────────────────────────────

export async function requireSuperAdmin(opts: { pending?: boolean } = {}): Promise<AuthUser> {
  const user = await requireAuth(undefined, opts);
  if (!user.superAdmin) {
    throw authError(403, "Acceso denegado.");
  }
  if (!opts.pending) {
    const jar = await cookies();
    if (!hasValidProof(jar.get(SUPER_ADMIN_COOKIE)?.value, "super-admin", user.id, user.sessionVersion)) {
      throw authError(403, "Código de super admin requerido.");
    }
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
