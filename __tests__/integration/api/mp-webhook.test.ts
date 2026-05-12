import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const prismaMock = vi.hoisted(() => ({
  subscription: {
    findFirst: vi.fn(),
    update:    vi.fn(),
  },
}));

const getMPSubscriptionMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma",       () => ({ prisma: prismaMock }));
vi.mock("@/lib/mercadopago",  () => ({ getMPSubscription: getMPSubscriptionMock }));

// ── Imports ───────────────────────────────────────────────────────────────────

import { POST } from "@/app/api/webhooks/mercadopago/route";

// ── Helpers ───────────────────────────────────────────────────────────────────

const URL = "http://localhost:3000/api/webhooks/mercadopago";

function req(body: unknown): NextRequest {
  const json = JSON.stringify(body);
  return new NextRequest(URL, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    json,
  });
}

const MP_SUB = {
  status:            "authorized",
  payer_id:          "payer-123",
  date_created:      "2026-01-01T00:00:00Z",
  next_payment_date: "2026-02-01T00:00:00Z",
};

const DB_SUB = {
  id:       "sub-db-1",
  mpSubId:  "mp-sub-xyz",
  tenantId: "tenant-1",
  status:   "pending",
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/webhooks/mercadopago", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getMPSubscriptionMock.mockResolvedValue(MP_SUB);
    prismaMock.subscription.findFirst.mockResolvedValue(DB_SUB);
    prismaMock.subscription.update.mockResolvedValue({});
  });

  // ── Non-subscription events ─────────────────────────────────────────────────

  it("returns 200 ok without doing anything for non-subscription events", async () => {
    const res = await POST(req({ type: "payment", data: { id: "pay-1" } }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(getMPSubscriptionMock).not.toHaveBeenCalled();
    expect(prismaMock.subscription.update).not.toHaveBeenCalled();
  });

  it("returns 200 ok when type is missing", async () => {
    const res = await POST(req({ data: { id: "x" } }));
    expect(res.status).toBe(200);
    expect(getMPSubscriptionMock).not.toHaveBeenCalled();
  });

  it("returns 200 ok when data.id is missing", async () => {
    const res = await POST(req({ type: "subscription_preapproval" }));
    expect(res.status).toBe(200);
    expect(getMPSubscriptionMock).not.toHaveBeenCalled();
  });

  // ── Happy path ──────────────────────────────────────────────────────────────

  it("updates subscription status to 'authorized'", async () => {
    getMPSubscriptionMock.mockResolvedValue({ ...MP_SUB, status: "authorized" });

    const res = await POST(req({ type: "subscription_preapproval", data: { id: "mp-sub-xyz" } }));
    expect(res.status).toBe(200);
    expect(prismaMock.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "authorized" }),
      }),
    );
  });

  it("fetches the MP subscription using the ID from the event body", async () => {
    await POST(req({ type: "subscription_preapproval", data: { id: "mp-sub-xyz" } }));
    expect(getMPSubscriptionMock).toHaveBeenCalledWith("mp-sub-xyz");
  });

  it("looks up the DB subscription by mpSubId", async () => {
    await POST(req({ type: "subscription_preapproval", data: { id: "mp-sub-xyz" } }));
    expect(prismaMock.subscription.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { mpSubId: "mp-sub-xyz" } }),
    );
  });

  // ── Status mapping ──────────────────────────────────────────────────────────

  const STATUS_CASES = [
    { mpStatus: "pending",    expected: "pending"    },
    { mpStatus: "authorized", expected: "authorized" },
    { mpStatus: "paused",     expected: "paused"     },
    { mpStatus: "cancelled",  expected: "cancelled"  },
    { mpStatus: "ended",      expected: "expired"    },
  ];

  for (const { mpStatus, expected } of STATUS_CASES) {
    it(`maps MP status "${mpStatus}" to DB status "${expected}"`, async () => {
      getMPSubscriptionMock.mockResolvedValue({ ...MP_SUB, status: mpStatus });
      await POST(req({ type: "subscription_preapproval", data: { id: "mp-sub-xyz" } }));
      expect(prismaMock.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: expected }),
        }),
      );
      vi.clearAllMocks();
      getMPSubscriptionMock.mockResolvedValue({});
      prismaMock.subscription.findFirst.mockResolvedValue(DB_SUB);
      prismaMock.subscription.update.mockResolvedValue({});
    });
  }

  it("sets cancelledAt when status transitions to 'cancelled'", async () => {
    getMPSubscriptionMock.mockResolvedValue({ ...MP_SUB, status: "cancelled" });
    await POST(req({ type: "subscription_preapproval", data: { id: "mp-sub-xyz" } }));

    const updateData = prismaMock.subscription.update.mock.calls[0][0].data;
    expect(updateData.cancelledAt).toBeInstanceOf(Date);
  });

  it("does not set cancelledAt for non-cancelled statuses", async () => {
    getMPSubscriptionMock.mockResolvedValue({ ...MP_SUB, status: "authorized" });
    await POST(req({ type: "subscription_preapproval", data: { id: "mp-sub-xyz" } }));

    const updateData = prismaMock.subscription.update.mock.calls[0][0].data;
    expect(updateData.cancelledAt).toBeUndefined();
  });

  it("stores period dates from the MP response", async () => {
    await POST(req({ type: "subscription_preapproval", data: { id: "mp-sub-xyz" } }));

    const updateData = prismaMock.subscription.update.mock.calls[0][0].data;
    expect(updateData.currentPeriodStart).toBeInstanceOf(Date);
    expect(updateData.currentPeriodEnd).toBeInstanceOf(Date);
  });

  // ── Not-found guard ─────────────────────────────────────────────────────────

  it("returns 200 ok when no DB subscription matches the mpSubId", async () => {
    prismaMock.subscription.findFirst.mockResolvedValue(null);
    const res = await POST(req({ type: "subscription_preapproval", data: { id: "unknown-sub" } }));
    expect(res.status).toBe(200);
    expect(prismaMock.subscription.update).not.toHaveBeenCalled();
  });

  // ── Error handling ──────────────────────────────────────────────────────────

  it("returns 500 when getMPSubscription throws", async () => {
    getMPSubscriptionMock.mockRejectedValue(new Error("MP API down"));
    const res = await POST(req({ type: "subscription_preapproval", data: { id: "mp-sub-xyz" } }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.ok).toBe(false);
  });
});
