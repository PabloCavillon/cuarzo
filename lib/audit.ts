import { prisma } from "./prisma";

export async function audit(
  tenantId:   string,
  userId:     string,
  action:     string,
  resource:   string,
  resourceId?: string,
  metadata:   Record<string, unknown> = {},
  ip?:        string,
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: { tenantId, userId, action, resource, resourceId, metadata, ip },
    });
  } catch {
    // Audit failures must never break business logic
  }
}
