import { describe, it, expect, vi, beforeEach } from "vitest";

const prismaMock = vi.hoisted(() => ({
  tenantModule: { findFirst: vi.fn(), findMany: vi.fn(), updateMany: vi.fn() },
}));
vi.mock("@/lib/db/prisma", () => ({ prisma: prismaMock }));

import { hasModule, trimModulesToPlan } from "@/lib/utils/plan-limits";

beforeEach(() => vi.resetAllMocks());

describe("hasModule", () => {
  it("rejects a module the plan does not include even if it is on", async () => {
    prismaMock.tenantModule.findFirst.mockResolvedValue({ tenant: { plan: "free" } });
    expect(await hasModule("t1", "fiscal")).toBe(false);
  });

  it("accepts an active module the plan includes", async () => {
    prismaMock.tenantModule.findFirst.mockResolvedValue({ tenant: { plan: "pro" } });
    expect(await hasModule("t1", "fiscal")).toBe(true);
  });

  it("rejects a module that is off", async () => {
    prismaMock.tenantModule.findFirst.mockResolvedValue(null);
    expect(await hasModule("t1", "catalog")).toBe(false);
  });
});

describe("trimModulesToPlan", () => {
  it("keeps the oldest free modules on a downgrade", async () => {
    prismaMock.tenantModule.findMany.mockResolvedValue(
      ["fiscal", "turnera", "stock", "caja"].map((module) => ({ module })),
    );
    await trimModulesToPlan("t1", "free");
    expect(prismaMock.tenantModule.updateMany).toHaveBeenCalledWith({
      where: { tenantId: "t1", module: { notIn: ["turnera", "stock"] } },
      data:  { active: false },
    });
  });
});
