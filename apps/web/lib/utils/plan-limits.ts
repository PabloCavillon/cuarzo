import { prisma } from "@/lib/db/prisma";
import type { ModuleSlug } from "@/prisma/generated/client";
import { FREE_MODULE_MAX, FREE_MODULE_INFO } from "./module-catalog";
export { FREE_MODULE_MAX, FREE_MODULE_INFO };

export type PlanKey = "free" | "starter" | "pro" | "enterprise";

export const PLAN_LIMITS: Record<PlanKey, {
  bookingsPerMonth: number;  // -1 = unlimited
  productsMax:      number;
  servicesMax:      number;
  teamMembers:      number;
  modulesMax:       number;  // -1 = unlimited
  modules:          string[];
}> = {
  free: {
    bookingsPerMonth: 50,
    productsMax:      10,
    servicesMax:      5,
    teamMembers:      1,
    modulesMax:       FREE_MODULE_MAX,
    modules:          Object.keys(FREE_MODULE_INFO),
  },
  starter: {
    bookingsPerMonth: 500,
    productsMax:      100,
    servicesMax:      20,
    teamMembers:      3,
    modulesMax:       -1,
    modules:          ["turnera", "catalog", "stock", "orders", "payments", "caja"],
  },
  pro: {
    bookingsPerMonth: -1,
    productsMax:      -1,
    servicesMax:      -1,
    teamMembers:      10,
    modulesMax:       -1,
    modules:          ["turnera", "catalog", "stock", "orders", "payments", "fiscal", "caja"],
  },
  enterprise: {
    bookingsPerMonth: -1,
    productsMax:      -1,
    servicesMax:      -1,
    teamMembers:      -1,
    modulesMax:       -1,
    modules:          ["turnera", "catalog", "stock", "orders", "payments", "fiscal", "caja"],
  },
};

export function getLimits(plan: string) {
  return PLAN_LIMITS[plan as PlanKey] ?? PLAN_LIMITS.free;
}

export async function checkBookingLimit(tenantId: string, plan: string): Promise<boolean> {
  const { bookingsPerMonth } = getLimits(plan);
  if (bookingsPerMonth === -1) return true;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const count = await prisma.turneraBooking.count({
    where: { tenantId, createdAt: { gte: startOfMonth } },
  });

  return count < bookingsPerMonth;
}

export async function checkProductLimit(tenantId: string, plan: string): Promise<boolean> {
  const { productsMax } = getLimits(plan);
  if (productsMax === -1) return true;

  const count = await prisma.catalogProduct.count({
    where: { tenantId, active: true },
  });

  return count < productsMax;
}

export async function checkServiceLimit(tenantId: string, plan: string): Promise<boolean> {
  const { servicesMax } = getLimits(plan);
  if (servicesMax === -1) return true;

  const count = await prisma.turneraService.count({
    where: { tenantId, active: true },
  });

  return count < servicesMax;
}

export async function checkMemberLimit(tenantId: string, plan: string): Promise<boolean> {
  const { teamMembers } = getLimits(plan);
  if (teamMembers === -1) return true;

  const count = await prisma.user.count({
    where: { tenantId, active: true },
  });

  return count < teamMembers;
}

export function isModuleAllowed(plan: string, module: string): boolean {
  return getLimits(plan).modules.includes(module);
}

export async function hasModule(tenantId: string, module: ModuleSlug): Promise<boolean> {
  const row = await prisma.tenantModule.findFirst({
    where:  { tenantId, module, active: true },
    select: { tenant: { select: { plan: true } } },
  });
  return !!row && isModuleAllowed(row.tenant.plan, module);
}

// After a downgrade: keeps the oldest modules the new plan allows and turns off the rest.
export async function trimModulesToPlan(tenantId: string, plan: string) {
  const { modules, modulesMax } = getLimits(plan);
  const active = await prisma.tenantModule.findMany({
    where:   { tenantId, active: true },
    orderBy: { enabledAt: "asc" },
  });
  const allowed = active.filter((m) => modules.includes(m.module));
  const keep    = modulesMax === -1 ? allowed : allowed.slice(0, modulesMax);
  await prisma.tenantModule.updateMany({
    where: { tenantId, module: { notIn: keep.map((m) => m.module) } },
    data:  { active: false },
  });
}

// The public booking pages only serve live businesses with the module on.
export function findBookableTenant(slug: string) {
  return prisma.tenant.findFirst({
    where: { slug, active: true, modules: { some: { module: "turnera", active: true } } },
  });
}
