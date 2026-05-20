import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeAuthUser } from "../../helpers/mock-factories";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const sessionMock = vi.hoisted(() => ({ requireAuth: vi.fn() }));

const prismaMock = vi.hoisted(() => ({
  turneraBooking: {
    findUnique: vi.fn(),
    update:     vi.fn(),
  },
}));

vi.mock("@/lib/session", () => sessionMock);
vi.mock("@/lib/prisma",  () => ({ prisma: prismaMock }));

// ── Imports ───────────────────────────────────────────────────────────────────

import { confirmBooking, cancelBooking, markNoShow } from "@/app/admin/appointments/actions";

// ── Setup ─────────────────────────────────────────────────────────────────────

const TENANT = "tenant-1";
const USER   = makeAuthUser({ tenantId: TENANT });
const BOOKING = { id: "book-1", tenantId: TENANT, status: "pending" };

beforeEach(() => {
  vi.resetAllMocks();
  sessionMock.requireAuth.mockResolvedValue(USER);
});

// ── confirmBooking ────────────────────────────────────────────────────────────

describe("confirmBooking", () => {
  it("sets status to confirmed and returns ok: true", async () => {
    prismaMock.turneraBooking.findUnique.mockResolvedValue(BOOKING);
    prismaMock.turneraBooking.update.mockResolvedValue({});

    const result = await confirmBooking("book-1");

    expect(result).toEqual({ ok: true });
    expect(prismaMock.turneraBooking.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "book-1" }, data: { status: "confirmed" } }),
    );
  });

  it("returns error when booking is not found", async () => {
    prismaMock.turneraBooking.findUnique.mockResolvedValue(null);
    const result = await confirmBooking("missing");
    expect(result).toEqual({ ok: false, error: "Reserva no encontrada." });
    expect(prismaMock.turneraBooking.update).not.toHaveBeenCalled();
  });

  it("returns error when booking belongs to a different tenant", async () => {
    prismaMock.turneraBooking.findUnique.mockResolvedValue({ id: "b1", tenantId: "other" });
    const result = await confirmBooking("b1");
    expect(result).toEqual({ ok: false, error: "Reserva no encontrada." });
  });

  it("returns error when unauthenticated", async () => {
    sessionMock.requireAuth.mockRejectedValue(new Error("No autorizado."));
    const result = await confirmBooking("b1");
    expect(result).toEqual({ ok: false, error: "No autorizado." });
  });
});

// ── cancelBooking ─────────────────────────────────────────────────────────────

describe("cancelBooking", () => {
  it("sets status to cancelled and returns ok: true", async () => {
    prismaMock.turneraBooking.findUnique.mockResolvedValue(BOOKING);
    prismaMock.turneraBooking.update.mockResolvedValue({});

    const result = await cancelBooking("book-1");

    expect(result).toEqual({ ok: true });
    expect(prismaMock.turneraBooking.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "cancelled" } }),
    );
  });

  it("returns error when booking belongs to a different tenant", async () => {
    prismaMock.turneraBooking.findUnique.mockResolvedValue({ id: "b1", tenantId: "wrong" });
    const result = await cancelBooking("b1");
    expect(result).toEqual({ ok: false, error: "Reserva no encontrada." });
  });

  it("returns error when booking is not found", async () => {
    prismaMock.turneraBooking.findUnique.mockResolvedValue(null);
    const result = await cancelBooking("missing");
    expect(result).toEqual({ ok: false, error: "Reserva no encontrada." });
  });

  it("propagates Prisma update errors", async () => {
    prismaMock.turneraBooking.findUnique.mockResolvedValue(BOOKING);
    prismaMock.turneraBooking.update.mockRejectedValue(new Error("DB error"));
    const result = await cancelBooking("book-1");
    expect(result).toEqual({ ok: false, error: "DB error" });
  });
});

// ── markNoShow ────────────────────────────────────────────────────────────────

describe("markNoShow", () => {
  it("sets status to no_show and returns ok: true", async () => {
    prismaMock.turneraBooking.findUnique.mockResolvedValue(BOOKING);
    prismaMock.turneraBooking.update.mockResolvedValue({});

    const result = await markNoShow("book-1");

    expect(result).toEqual({ ok: true });
    expect(prismaMock.turneraBooking.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "no_show" } }),
    );
  });

  it("returns error when booking is not found", async () => {
    prismaMock.turneraBooking.findUnique.mockResolvedValue(null);
    const result = await markNoShow("missing");
    expect(result).toEqual({ ok: false, error: "Reserva no encontrada." });
  });

  it("returns error when booking belongs to a different tenant", async () => {
    prismaMock.turneraBooking.findUnique.mockResolvedValue({ id: "b1", tenantId: "other" });
    const result = await markNoShow("b1");
    expect(result).toEqual({ ok: false, error: "Reserva no encontrada." });
  });

  it("returns error when unauthenticated", async () => {
    sessionMock.requireAuth.mockRejectedValue(new Error("No autorizado."));
    const result = await markNoShow("b1");
    expect(result).toEqual({ ok: false, error: "No autorizado." });
  });
});
