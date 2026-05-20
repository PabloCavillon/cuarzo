import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { sendBookingConfirmed } from "@/lib/integrations/email";
import { checkBookingLimit } from "@/lib/utils/plan-limits";

// ─── Wire format ─────────────────────────────────────────────────────────────

export interface BookingResponse {
  id: string;
  code: string;
  serviceName: string;
  duration: number;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  status: string;
  createdAt: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

const UUID_RE   = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_RE   = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const TIME_RE   = /^([01]\d|2[0-3]):[0-5]\d$/;
const EMAIL_RE  = /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/;

interface ValidInput {
  serviceId: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string | null;
  notes: string | null;
}

function validate(raw: unknown): { ok: true; data: ValidInput } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, error: "Payload inválido." };
  }

  const b = raw as Record<string, unknown>;

  // serviceId — must be a valid UUID
  if (typeof b.serviceId !== "string" || !UUID_RE.test(b.serviceId)) {
    return { ok: false, error: "Servicio inválido." };
  }

  // date — YYYY-MM-DD, must be a future business day (Mon–Fri)
  if (typeof b.date !== "string" || !DATE_RE.test(b.date)) {
    return { ok: false, error: "Fecha con formato inválido." };
  }
  const [y, m, d] = b.date.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (dateObj <= today) {
    return { ok: false, error: "La fecha debe ser futura." };
  }
  const dow = dateObj.getDay();
  if (dow === 0 || dow === 6) {
    return { ok: false, error: "Solo se pueden reservar días hábiles (lunes a viernes)." };
  }
  // Prevent bookings too far in the future (> 60 days)
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 60);
  if (dateObj > maxDate) {
    return { ok: false, error: "No se pueden hacer reservas con más de 60 días de anticipación." };
  }

  // time — HH:MM within business hours (09:00–18:00), only 30-min slots
  if (typeof b.time !== "string" || !TIME_RE.test(b.time)) {
    return { ok: false, error: "Horario con formato inválido." };
  }
  const [hh, mm] = b.time.split(":").map(Number);
  if (hh < 9 || hh >= 18) {
    return { ok: false, error: "El horario debe ser entre las 09:00 y las 18:00." };
  }
  if (mm !== 0 && mm !== 30) {
    return { ok: false, error: "Los horarios son en intervalos de 30 minutos." };
  }

  // name — 2 to 100 chars
  if (typeof b.name !== "string") return { ok: false, error: "Nombre inválido." };
  const name = b.name.trim();
  if (name.length < 2 || name.length > 100) {
    return { ok: false, error: "El nombre debe tener entre 2 y 100 caracteres." };
  }

  // email — RFC-safe, max 254 chars
  if (typeof b.email !== "string") return { ok: false, error: "Email inválido." };
  const email = b.email.trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return { ok: false, error: "Email inválido." };
  }

  // phone — optional, max 30 chars
  let phone: string | null = null;
  if (b.phone !== undefined && b.phone !== null && b.phone !== "") {
    if (typeof b.phone !== "string" || b.phone.trim().length > 30) {
      return { ok: false, error: "Teléfono inválido." };
    }
    phone = b.phone.trim();
  }

  // notes — optional, max 1000 chars
  let notes: string | null = null;
  if (b.notes !== undefined && b.notes !== null && b.notes !== "") {
    if (typeof b.notes !== "string" || b.notes.trim().length > 1_000) {
      return { ok: false, error: "Las notas no pueden superar los 1000 caracteres." };
    }
    notes = b.notes.trim();
  }

  return {
    ok: true,
    data: { serviceId: b.serviceId, date: b.date, time: b.time, name, email, phone, notes },
  };
}

// ─── Crypto-secure booking code ───────────────────────────────────────────────
// 256 % 32 === 0 → no modulo bias
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return "TUR-" + Array.from(bytes, (b) => CHARS[b % 32]).join("");
}

async function uniqueCode(maxAttempts = 10): Promise<string | null> {
  for (let i = 0; i < maxAttempts; i++) {
    const code = generateCode();
    const exists = await prisma.turneraBooking.findUnique({ where: { code } });
    if (!exists) return code;
  }
  return null; // extremely unlikely
}

// ─── DB → wire ───────────────────────────────────────────────────────────────

function toResponse(
  b: Awaited<ReturnType<typeof prisma.turneraBooking.findUniqueOrThrow>>
): BookingResponse {
  return {
    id: b.id,
    code: b.code,
    serviceName: b.serviceNameSnap,
    duration: b.durationMinSnap,
    date: b.date,
    time: b.time,
    name: b.clientName,
    email: b.clientEmail,
    phone: b.clientPhone ?? "",
    notes: b.notes ?? "",
    status: b.status,
    createdAt: b.createdAt.toISOString(),
  };
}

const DEMO_TENANT = "demo";

// ─── POST — create booking ────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Enforce a max body size (prevent memory exhaustion)
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > 8_000) {
    return NextResponse.json({ error: "Payload demasiado grande." }, { status: 413 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const result = validate(raw);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  const { serviceId, date, time, name, email, phone, notes } = result.data;

  try {
    const tenant = await prisma.tenant.findUnique({ where: { slug: DEMO_TENANT } });
    if (!tenant) {
      return NextResponse.json({ error: "Servicio no disponible." }, { status: 503 });
    }

    // Plan limit check — prevent free-tier tenants from exceeding monthly booking cap
    const allowed = await checkBookingLimit(tenant.id, tenant.plan);
    if (!allowed) {
      return NextResponse.json(
        { error: "Se alcanzó el límite de turnos del plan. Contactá al administrador." },
        { status: 402 }
      );
    }

    // Service must exist and belong to this tenant — prevents cross-tenant booking
    const service = await prisma.turneraService.findFirst({
      where: { id: serviceId, tenantId: tenant.id, active: true },
    });
    if (!service) {
      return NextResponse.json({ error: "Servicio no encontrado." }, { status: 404 });
    }

    const code = await uniqueCode();
    if (!code) {
      return NextResponse.json({ error: "No se pudo generar un código único." }, { status: 500 });
    }

    const booking = await prisma.turneraBooking.create({
      data: {
        tenantId: tenant.id,
        serviceId: service.id,
        code,
        serviceNameSnap: service.name,
        durationMinSnap: service.durationMin,
        priceSnap: service.price,
        date,
        time,
        clientName: name,
        clientEmail: email,
        clientPhone: phone,
        notes,
        status: "confirmed",
      },
    });

    void sendBookingConfirmed({
      to:          email,
      name,
      code:        booking.code,
      serviceName: booking.serviceNameSnap,
      date:        booking.date,
      time:        booking.time,
      price:       Number(booking.priceSnap.toString()),
    });

    return NextResponse.json({ booking: toResponse(booking) }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/appointments/bookings]", err);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

// ─── GET — look up by code or by email ───────────────────────────────────────
// Requires either ?code= or ?email= — never returns all bookings unauthenticated.

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code  = searchParams.get("code")?.trim().toUpperCase() ?? "";
  const email = searchParams.get("email")?.trim().toLowerCase() ?? "";

  if (!code && !email) {
    return NextResponse.json(
      { error: "Se requiere el parámetro 'code' o 'email'." },
      { status: 400 }
    );
  }

  // Basic format guards before hitting the DB
  if (code && !/^TUR-[A-Z2-9]{6}$/.test(code)) {
    return NextResponse.json({ error: "Código inválido." }, { status: 400 });
  }
  if (email && (!EMAIL_RE.test(email) || email.length > 254)) {
    return NextResponse.json({ error: "Email inválido." }, { status: 400 });
  }

  try {
    const tenant = await prisma.tenant.findUnique({ where: { slug: DEMO_TENANT } });
    if (!tenant) {
      return NextResponse.json({ error: "Servicio no disponible." }, { status: 503 });
    }

    if (code) {
      const booking = await prisma.turneraBooking.findUnique({ where: { code } });
      // Constant-time-like check: always verify tenantId to avoid oracle attacks
      if (!booking || booking.tenantId !== tenant.id) {
        return NextResponse.json({ error: "Reserva no encontrada." }, { status: 404 });
      }
      return NextResponse.json({ booking: toResponse(booking) });
    }

    // email — return only that user's bookings
    const list = await prisma.turneraBooking.findMany({
      where: { tenantId: tenant.id, clientEmail: email },
      orderBy: { createdAt: "desc" },
      take: 100, // safety cap — no unbounded queries
    });
    return NextResponse.json({ bookings: list.map(toResponse) });
  } catch (err) {
    console.error("[GET /api/appointments/bookings]", err);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
