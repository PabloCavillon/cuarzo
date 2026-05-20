import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { nextWeekday } from "../../helpers/mock-factories";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const prismaMock = vi.hoisted(() => ({
  tenant:         { findUnique: vi.fn() },
  turneraService: { findFirst: vi.fn() },
  turneraBooking: {
    findUnique: vi.fn(),
    findMany:   vi.fn(),
    create:     vi.fn(),
    count:      vi.fn().mockResolvedValue(0),
  },
}));

const emailMock = vi.hoisted(() => ({
  sendBookingConfirmed: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/email",  () => emailMock);

// ── Imports ───────────────────────────────────────────────────────────────────

import { POST, GET } from "@/app/api/appointments/bookings/route";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const DEMO_TENANT = { id: "demo-id", slug: "demo", plan: "free" };
const SVC_ID      = "11111111-1111-1111-1111-111111111111";

const DEMO_SERVICE = {
  id:           SVC_ID,
  tenantId:     "demo-id",
  name:         "Corte clásico",
  durationMin:  30,
  price:        { toString: () => "800" },
  active:       true,
};

const DB_BOOKING = {
  id:              "book-1",
  code:            "TUR-ABCDEF",
  tenantId:        "demo-id",
  serviceNameSnap: "Corte clásico",
  durationMinSnap: 30,
  date:            "2026-07-01",
  time:            "10:00",
  clientName:      "Ana",
  clientEmail:     "ana@example.com",
  clientPhone:     null,
  notes:           null,
  status:          "confirmed",
  createdAt:       new Date("2026-05-01"),
  priceSnap:       { toString: () => "800" },
};

function postReq(body: unknown): NextRequest {
  const json = JSON.stringify(body);
  return new NextRequest("http://localhost/api/appointments/bookings", {
    method:  "POST",
    headers: { "Content-Type": "application/json", "content-length": String(json.length) },
    body:    json,
  });
}

function getReq(params: Record<string, string>): NextRequest {
  const url = new URL("http://localhost/api/appointments/bookings");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new NextRequest(url.toString());
}

// ── Valid booking payload ─────────────────────────────────────────────────────

function validPayload(overrides?: Record<string, unknown>) {
  return {
    serviceId: SVC_ID,
    date:      nextWeekday(3),
    time:      "10:00",
    name:      "Ana García",
    email:     "ana@example.com",
    ...overrides,
  };
}

// ── POST tests ────────────────────────────────────────────────────────────────

describe("POST /api/appointments/bookings", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    prismaMock.tenant.findUnique.mockResolvedValue(DEMO_TENANT);
    prismaMock.turneraService.findFirst.mockResolvedValue(DEMO_SERVICE);
    prismaMock.turneraBooking.findUnique.mockResolvedValue(null); // code collision check
    prismaMock.turneraBooking.create.mockResolvedValue(DB_BOOKING);
    prismaMock.turneraBooking.count.mockResolvedValue(0); // plan limit: 0 bookings this month
  });

  // ── Happy path ──────────────────────────────────────────────────────────────

  it("creates a booking and returns 201 with the booking object", async () => {
    const res = await POST(postReq(validPayload()));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.booking).toBeDefined();
    expect(body.booking.code).toBe("TUR-ABCDEF");
  });

  it("fires sendBookingConfirmed after creation", async () => {
    await POST(postReq(validPayload()));
    expect(emailMock.sendBookingConfirmed).toHaveBeenCalledOnce();
    expect(emailMock.sendBookingConfirmed).toHaveBeenCalledWith(
      expect.objectContaining({ to: "ana@example.com" }),
    );
  });

  // ── Body size guard ─────────────────────────────────────────────────────────

  it("returns 413 for oversized body", async () => {
    const bigReq = new NextRequest("http://localhost/api/appointments/bookings", {
      method:  "POST",
      headers: { "content-length": "9000" },
      body:    "{}",
    });
    const res = await POST(bigReq);
    expect(res.status).toBe(413);
  });

  // ── Validation ──────────────────────────────────────────────────────────────

  it("returns 422 for invalid serviceId (not a UUID)", async () => {
    const res = await POST(postReq(validPayload({ serviceId: "not-a-uuid" })));
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error).toContain("Servicio");
  });

  it("returns 422 for past date", async () => {
    const res = await POST(postReq(validPayload({ date: "2020-01-15" })));
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error).toContain("futura");
  });

  it("returns 422 for a Saturday date", async () => {
    // Find the next Saturday
    const d = new Date();
    while (d.getDay() !== 6) d.setDate(d.getDate() + 1);
    // Make it at least 1 day in the future
    d.setDate(d.getDate() + 1);
    while (d.getDay() !== 6) d.setDate(d.getDate() + 1);
    const satDate = d.toISOString().slice(0, 10);

    const res = await POST(postReq(validPayload({ date: satDate })));
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error).toContain("hábiles");
  });

  it("returns 422 for a Sunday date", async () => {
    const d = new Date();
    while (d.getDay() !== 0) d.setDate(d.getDate() + 1);
    d.setDate(d.getDate() + 7); // next Sunday at least 7 days from today
    const sunDate = d.toISOString().slice(0, 10);

    const res = await POST(postReq(validPayload({ date: sunDate })));
    expect(res.status).toBe(422);
  });

  it("returns 422 for date more than 60 days ahead", async () => {
    const d = new Date();
    d.setDate(d.getDate() + 65);
    const farDate = d.toISOString().slice(0, 10);
    const res = await POST(postReq(validPayload({ date: farDate })));
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error).toContain("60 días");
  });

  it("returns 422 for time outside business hours", async () => {
    const res = await POST(postReq(validPayload({ time: "07:00" })));
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error).toContain("09:00");
  });

  it("returns 422 for time in non-30-minute slot", async () => {
    const res = await POST(postReq(validPayload({ time: "10:15" })));
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error).toContain("30 minutos");
  });

  it("returns 422 for name shorter than 2 characters", async () => {
    const res = await POST(postReq(validPayload({ name: "X" })));
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error).toContain("nombre");
  });

  it("returns 422 for invalid email", async () => {
    const res = await POST(postReq(validPayload({ email: "not-an-email" })));
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error).toContain("Email");
  });

  it("returns 422 for invalid JSON body", async () => {
    const badReq = new NextRequest("http://localhost/api/appointments/bookings", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    "bad-json",
    });
    const res = await POST(badReq);
    expect(res.status).toBe(400);
  });

  // ── DB checks ───────────────────────────────────────────────────────────────

  it("returns 503 when demo tenant is not found", async () => {
    prismaMock.tenant.findUnique.mockResolvedValue(null);
    const res = await POST(postReq(validPayload()));
    expect(res.status).toBe(503);
  });

  it("returns 404 when the service is not found or inactive", async () => {
    prismaMock.turneraService.findFirst.mockResolvedValue(null);
    const res = await POST(postReq(validPayload()));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toContain("Servicio");
  });

  it("accepts optional phone and notes fields", async () => {
    const res = await POST(postReq(validPayload({ phone: "1122334455", notes: "Alergia a tintes" })));
    expect(res.status).toBe(201);
    expect(prismaMock.turneraBooking.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ clientPhone: "1122334455", notes: "Alergia a tintes" }),
      }),
    );
  });

  it("sets booking status to 'confirmed' on creation", async () => {
    await POST(postReq(validPayload()));
    expect(prismaMock.turneraBooking.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "confirmed" }),
      }),
    );
  });
});

// ── GET tests ─────────────────────────────────────────────────────────────────

describe("GET /api/appointments/bookings", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    prismaMock.tenant.findUnique.mockResolvedValue(DEMO_TENANT);
  });

  it("returns 400 when neither code nor email is provided", async () => {
    const res = await GET(getReq({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("parámetro");
  });

  it("returns a booking by valid code", async () => {
    prismaMock.turneraBooking.findUnique.mockResolvedValue(DB_BOOKING);
    const res = await GET(getReq({ code: "TUR-ABCDEF" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.booking.code).toBe("TUR-ABCDEF");
  });

  it("normalizes code to uppercase before lookup", async () => {
    prismaMock.turneraBooking.findUnique.mockResolvedValue(DB_BOOKING);
    await GET(getReq({ code: "tur-abcdef" }));
    expect(prismaMock.turneraBooking.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { code: "TUR-ABCDEF" } }),
    );
  });

  it("returns 400 for an invalid code format", async () => {
    const res = await GET(getReq({ code: "INVALID" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Código");
  });

  it("returns 404 when code is not found", async () => {
    prismaMock.turneraBooking.findUnique.mockResolvedValue(null);
    const res = await GET(getReq({ code: "TUR-ZZZZZZ" }));
    expect(res.status).toBe(404);
  });

  it("returns 404 when booking belongs to a different tenant", async () => {
    prismaMock.turneraBooking.findUnique.mockResolvedValue({ ...DB_BOOKING, tenantId: "other" });
    const res = await GET(getReq({ code: "TUR-ABCDEF" }));
    expect(res.status).toBe(404);
  });

  it("returns bookings list by email", async () => {
    prismaMock.turneraBooking.findMany.mockResolvedValue([DB_BOOKING]);
    const res = await GET(getReq({ email: "ana@example.com" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.bookings)).toBe(true);
    expect(body.bookings).toHaveLength(1);
  });

  it("returns 400 for an invalid email format", async () => {
    const res = await GET(getReq({ email: "not-an-email" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Email");
  });

  it("normalizes email to lowercase before lookup", async () => {
    prismaMock.turneraBooking.findMany.mockResolvedValue([]);
    await GET(getReq({ email: "ANA@EXAMPLE.COM" }));
    expect(prismaMock.turneraBooking.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ clientEmail: "ana@example.com" }),
      }),
    );
  });

  it("returns 503 when demo tenant is not found", async () => {
    prismaMock.tenant.findUnique.mockResolvedValue(null);
    const res = await GET(getReq({ code: "TUR-AAAAAA" }));
    expect(res.status).toBe(503);
  });

  it("returns an empty bookings array when email has no bookings", async () => {
    prismaMock.turneraBooking.findMany.mockResolvedValue([]);
    const res = await GET(getReq({ email: "nobody@example.com" }));
    const body = await res.json();
    expect(body.bookings).toEqual([]);
  });
});
