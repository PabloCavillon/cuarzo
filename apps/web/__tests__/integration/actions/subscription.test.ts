import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeAuthUser } from "../../helpers/mock-factories";

const sessionMock = vi.hoisted(() => ({ requireAuth: vi.fn() }));
const mpMock = vi.hoisted(() => ({
  createMPSubscription: vi.fn(), cancelMPSubscription: vi.fn(), createMPPlan: vi.fn(),
}));
const prismaMock = vi.hoisted(() => ({
  subscriptionPlan: { findUnique: vi.fn(), update: vi.fn() },
  subscription:     { findUnique: vi.fn(), upsert: vi.fn(), update: vi.fn() },
  tenant:           { update: vi.fn() },
  tenantModule:     { findMany: vi.fn(), updateMany: vi.fn() },
  user:             { findFirst: vi.fn() },
}));

vi.mock("@/lib/auth/session", () => sessionMock);
vi.mock("@/lib/api/mercadopago", () => mpMock);
vi.mock("@/lib/db/prisma", () => ({ prisma: prismaMock }));

import { startSubscription } from "@/app/admin/subscription/actions";

const PAYING = { mpSubId: "mp-1", status: "authorized" };

beforeEach(() => {
  vi.resetAllMocks();
  sessionMock.requireAuth.mockResolvedValue(makeAuthUser({ tenantId: "t1" }));
  prismaMock.tenantModule.findMany.mockResolvedValue([]);
});

describe("startSubscription", () => {
  it("cancels Mercado Pago before moving a paying tenant to free", async () => {
    prismaMock.subscriptionPlan.findUnique.mockResolvedValue({ id: "p0", priceUSD: 0 });
    prismaMock.subscription.findUnique.mockResolvedValue(PAYING);

    const res = await startSubscription("free");

    expect(res.ok).toBe(true);
    expect(mpMock.cancelMPSubscription).toHaveBeenCalledWith("mp-1");
  });

  it("keeps the subscription when Mercado Pago refuses the cancellation", async () => {
    prismaMock.subscriptionPlan.findUnique.mockResolvedValue({ id: "p0", priceUSD: 0 });
    prismaMock.subscription.findUnique.mockResolvedValue(PAYING);
    mpMock.cancelMPSubscription.mockRejectedValue(new Error("down"));

    expect((await startSubscription("free")).ok).toBe(false);
    expect(prismaMock.subscription.upsert).not.toHaveBeenCalled();
  });

  it("refuses to replace an active paid subscription", async () => {
    prismaMock.subscriptionPlan.findUnique.mockResolvedValue({ id: "p1", priceUSD: 19, mpPlanId: "x" });
    prismaMock.subscription.findUnique.mockResolvedValue(PAYING);

    expect((await startSubscription("starter")).ok).toBe(false);
    expect(mpMock.createMPSubscription).not.toHaveBeenCalled();
  });
});
