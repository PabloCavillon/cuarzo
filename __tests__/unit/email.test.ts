import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const sendMock = vi.hoisted(() => vi.fn().mockResolvedValue({ data: { id: "e1" }, error: null }));

// The global setup already mocks "resend", but we need access to the send fn.
// Override it here so we can inspect calls in this file's tests.
// Use a regular function (not arrow) so new Resend() works as a constructor.
vi.mock("resend", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Resend: vi.fn(function (this: any) { this.emails = { send: sendMock }; }),
}));

// ── Imports (after mocks) ─────────────────────────────────────────────────────

import {
  sendOrderCreated,
  sendOrderStatusUpdate,
  sendInvitation,
  sendBookingConfirmed,
  sendPasswordReset,
  sendEmailVerification,
  sendLowStockAlert,
} from "@/lib/integrations/email";

// ── Helpers ───────────────────────────────────────────────────────────────────

const KEY_BACKUP = process.env.RESEND_API_KEY;

function withoutKey(fn: () => Promise<void>) {
  return async () => {
    const orig = process.env.RESEND_API_KEY;
    delete process.env.RESEND_API_KEY;
    try { await fn(); }
    finally { process.env.RESEND_API_KEY = orig; }
  };
}

// ── sendOrderCreated ──────────────────────────────────────────────────────────

describe("sendOrderCreated", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = KEY_BACKUP ?? "re_test";
  });

  it("does not call resend when RESEND_API_KEY is absent", withoutKey(async () => {
    await sendOrderCreated({
      to: "client@example.com", name: "Juan", orderId: "ord-001",
      items: [{ nameSnap: "Remera", skuSnap: "REM-001", qty: 2, unitPrice: 1000 }],
      total: 2000,
    });
    expect(sendMock).not.toHaveBeenCalled();
  }));

  it("calls resend.emails.send with the correct from/to/subject", async () => {
    await sendOrderCreated({
      to: "client@example.com", name: "Juan López", orderId: "abcdef12-0000-0000-0000-000000000000",
      items: [{ nameSnap: "Remera", skuSnap: "REM-001", qty: 1, unitPrice: 500 }],
      total: 500,
    });

    expect(sendMock).toHaveBeenCalledOnce();
    const call = sendMock.mock.calls[0][0];
    expect(call.from).toContain("Cuarzo");
    expect(call.to).toContain("client@example.com");
    expect(call.subject).toContain("ABCDEF12");
    expect(call.html).toContain("Remera");
    expect(call.html).toContain("Juan");
  });

  it("uses the first 8 chars of orderId uppercased as the short ID", async () => {
    await sendOrderCreated({
      to: "a@b.com", name: "A", orderId: "xyz00001-0000-0000-0000-000000000000",
      items: [], total: 0,
    });
    const call = sendMock.mock.calls[0][0];
    expect(call.subject).toContain("XYZ00001");
  });

  it("includes item names and quantity in the HTML body", async () => {
    await sendOrderCreated({
      to: "a@b.com", name: "Test",
      orderId: "00000000-0000-0000-0000-000000000001",
      items: [
        { nameSnap: "Pantalón", skuSnap: "PAN-42", qty: 3, unitPrice: 2000 },
        { nameSnap: "Camisa",   skuSnap: "CAM-M",  qty: 1, unitPrice: 1500 },
      ],
      total: 7500,
    });
    const html = sendMock.mock.calls[0][0].html as string;
    expect(html).toContain("Pantalón");
    expect(html).toContain("Camisa");
    expect(html).toContain("× 3");
  });
});

// ── sendOrderStatusUpdate ─────────────────────────────────────────────────────

describe("sendOrderStatusUpdate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = KEY_BACKUP ?? "re_test";
  });

  it("does not call resend when RESEND_API_KEY is absent", withoutKey(async () => {
    await sendOrderStatusUpdate({ to: "x@y.com", name: "X", orderId: "o1", status: "confirmed", total: 100 });
    expect(sendMock).not.toHaveBeenCalled();
  }));

  it("does not call resend for an unknown status", async () => {
    await sendOrderStatusUpdate({ to: "x@y.com", name: "X", orderId: "o1", status: "unknown_status", total: 0 });
    expect(sendMock).not.toHaveBeenCalled();
  });

  const KNOWN_STATUSES = [
    { status: "confirmed",  label: "Confirmado",  color: "#3b82f6" },
    { status: "processing", label: "En proceso",  color: "#f59e0b" },
    { status: "shipped",    label: "Enviado",      color: "#8b5cf6" },
    { status: "delivered",  label: "Entregado",    color: "#10b981" },
  ];

  for (const { status, label } of KNOWN_STATUSES) {
    it(`sends email with correct label for status "${status}"`, async () => {
      await sendOrderStatusUpdate({ to: "c@d.com", name: "Cliente", orderId: "ord-xyz", status, total: 999 });
      expect(sendMock).toHaveBeenCalledOnce();
      const call = sendMock.mock.calls[0][0];
      expect(call.html).toContain(label);
      vi.clearAllMocks();
    });
  }

  it("includes the total amount in the email body", async () => {
    await sendOrderStatusUpdate({ to: "c@d.com", name: "X", orderId: "o1", status: "confirmed", total: 12345 });
    const html = sendMock.mock.calls[0][0].html as string;
    expect(html).toMatch(/12\.345/);
  });
});

// ── sendInvitation ────────────────────────────────────────────────────────────

describe("sendInvitation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = KEY_BACKUP ?? "re_test";
  });

  it("does not call resend when RESEND_API_KEY is absent", withoutKey(async () => {
    await sendInvitation({ to: "x@y.com", tenantName: "Tienda", invitedBy: "Ana", role: "staff", token: "tok" });
    expect(sendMock).not.toHaveBeenCalled();
  }));

  it("sends to the correct address with the tenant name in the subject", async () => {
    await sendInvitation({
      to: "newuser@example.com", tenantName: "Mi Tienda", invitedBy: "Admin",
      role: "staff", token: "abc-token-123",
    });
    const call = sendMock.mock.calls[0][0];
    expect(call.to).toContain("newuser@example.com");
    expect(call.subject).toContain("Mi Tienda");
  });

  it("includes the accept URL with the token in the email body", async () => {
    await sendInvitation({
      to: "x@y.com", tenantName: "T", invitedBy: "B", role: "admin", token: "my-unique-token",
    });
    const html = sendMock.mock.calls[0][0].html as string;
    expect(html).toContain("my-unique-token");
  });

  it("maps role 'admin' to 'Admin' label", async () => {
    await sendInvitation({ to: "x@y.com", tenantName: "T", invitedBy: "B", role: "admin", token: "t" });
    expect(sendMock.mock.calls[0][0].html).toContain("Admin");
  });

  it("maps role 'staff' to 'Staff' label", async () => {
    await sendInvitation({ to: "x@y.com", tenantName: "T", invitedBy: "B", role: "staff", token: "t" });
    expect(sendMock.mock.calls[0][0].html).toContain("Staff");
  });

  it("includes the inviter name in the body", async () => {
    await sendInvitation({ to: "x@y.com", tenantName: "T", invitedBy: "María García", role: "staff", token: "t" });
    expect(sendMock.mock.calls[0][0].html).toContain("María García");
  });
});

// ── sendBookingConfirmed ──────────────────────────────────────────────────────

describe("sendBookingConfirmed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = KEY_BACKUP ?? "re_test";
  });

  it("does not call resend when RESEND_API_KEY is absent", withoutKey(async () => {
    await sendBookingConfirmed({
      to: "x@y.com", name: "X", code: "TUR-ABCD12",
      serviceName: "Corte", date: "2026-06-15", time: "10:00", price: 1000,
    });
    expect(sendMock).not.toHaveBeenCalled();
  }));

  it("includes booking code, service name, time in the body", async () => {
    await sendBookingConfirmed({
      to: "client@example.com", name: "Pedro Gómez", code: "TUR-XYZ123",
      serviceName: "Masaje deportivo", date: "2026-06-15", time: "14:30", price: 2500,
    });
    const html = sendMock.mock.calls[0][0].html as string;
    expect(html).toContain("TUR-XYZ123");
    expect(html).toContain("Masaje deportivo");
    expect(html).toContain("14:30");
  });

  it("omits the price row when price is 0", async () => {
    await sendBookingConfirmed({
      to: "x@y.com", name: "X", code: "TUR-AAAAAA",
      serviceName: "Consulta gratis", date: "2026-06-20", time: "09:00", price: 0,
    });
    const html = sendMock.mock.calls[0][0].html as string;
    expect(html).not.toContain("Precio");
  });

  it("includes price when price > 0", async () => {
    await sendBookingConfirmed({
      to: "x@y.com", name: "X", code: "TUR-BBBBBB",
      serviceName: "S", date: "2026-06-20", time: "09:00", price: 500,
    });
    const html = sendMock.mock.calls[0][0].html as string;
    expect(html).toContain("Precio");
  });

  it("uses the recipient's first name in the greeting", async () => {
    await sendBookingConfirmed({
      to: "x@y.com", name: "Sofía Martínez", code: "TUR-CCCCCC",
      serviceName: "S", date: "2026-06-21", time: "10:00", price: 0,
    });
    const html = sendMock.mock.calls[0][0].html as string;
    expect(html).toContain("Sofía");
  });

  it("sends to the correct address with code in the subject", async () => {
    await sendBookingConfirmed({
      to: "booking@test.com", name: "N", code: "TUR-DDDDDD",
      serviceName: "S", date: "2026-06-21", time: "10:00", price: 0,
    });
    const call = sendMock.mock.calls[0][0];
    expect(call.to).toContain("booking@test.com");
    expect(call.subject).toContain("TUR-DDDDDD");
  });
});

// ── sendPasswordReset ─────────────────────────────────────────────────────────

describe("sendPasswordReset", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = KEY_BACKUP ?? "re_test";
  });

  it("does not call resend when RESEND_API_KEY is absent", withoutKey(async () => {
    await sendPasswordReset({ to: "x@y.com", name: "X", resetUrl: "http://localhost/reset" });
    expect(sendMock).not.toHaveBeenCalled();
  }));

  it("sends to the correct address", async () => {
    await sendPasswordReset({ to: "user@example.com", name: "Juan", resetUrl: "http://localhost/reset?token=abc" });
    expect(sendMock).toHaveBeenCalledOnce();
    const call = sendMock.mock.calls[0][0];
    expect(call.to).toContain("user@example.com");
  });

  it("includes the reset URL in the body", async () => {
    const resetUrl = "http://localhost:3000/reset-password?token=abc123";
    await sendPasswordReset({ to: "x@y.com", name: "Ana", resetUrl });
    const html = sendMock.mock.calls[0][0].html as string;
    expect(html).toContain(resetUrl);
  });

  it("mentions 1-hour expiry in the body", async () => {
    await sendPasswordReset({ to: "x@y.com", name: "Ana", resetUrl: "http://x.com/r" });
    const html = sendMock.mock.calls[0][0].html as string;
    expect(html).toContain("1 hora");
  });

  it("includes user first name in the body", async () => {
    await sendPasswordReset({ to: "x@y.com", name: "Lucía Pérez", resetUrl: "http://x.com/r" });
    const html = sendMock.mock.calls[0][0].html as string;
    expect(html).toContain("Lucía");
  });
});

// ── sendEmailVerification ─────────────────────────────────────────────────────

describe("sendEmailVerification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = KEY_BACKUP ?? "re_test";
  });

  it("does not call resend when RESEND_API_KEY is absent", withoutKey(async () => {
    await sendEmailVerification({ to: "x@y.com", name: "X", verifyUrl: "http://localhost/verify" });
    expect(sendMock).not.toHaveBeenCalled();
  }));

  it("sends to the correct address", async () => {
    await sendEmailVerification({ to: "new@example.com", name: "Paula", verifyUrl: "http://x.com/v" });
    const call = sendMock.mock.calls[0][0];
    expect(call.to).toContain("new@example.com");
  });

  it("includes the verify URL in the body", async () => {
    const verifyUrl = "http://localhost:3000/api/auth/verify-email?token=xyz";
    await sendEmailVerification({ to: "x@y.com", name: "Paula", verifyUrl });
    const html = sendMock.mock.calls[0][0].html as string;
    expect(html).toContain(verifyUrl);
  });

  it("mentions 24-hour expiry in the body", async () => {
    await sendEmailVerification({ to: "x@y.com", name: "Paula", verifyUrl: "http://x.com/v" });
    const html = sendMock.mock.calls[0][0].html as string;
    expect(html).toContain("24 horas");
  });

  it("includes user first name in greeting", async () => {
    await sendEmailVerification({ to: "x@y.com", name: "Roberto García", verifyUrl: "http://x.com/v" });
    const html = sendMock.mock.calls[0][0].html as string;
    expect(html).toContain("Roberto");
  });
});

// ── sendLowStockAlert ─────────────────────────────────────────────────────────

describe("sendLowStockAlert", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = KEY_BACKUP ?? "re_test";
  });

  const PRODUCTS = [
    { name: "Café molido", sku: "CAF-001", qty: 2, minStock: 10, warehouse: "Depósito principal" },
    { name: "Azúcar",      sku: "AZU-002", qty: 1, minStock: 5,  warehouse: "Depósito principal" },
  ];

  it("does not call resend when RESEND_API_KEY is absent", withoutKey(async () => {
    await sendLowStockAlert({ to: "x@y.com", tenantName: "T", products: PRODUCTS });
    expect(sendMock).not.toHaveBeenCalled();
  }));

  it("sends to the correct address", async () => {
    await sendLowStockAlert({ to: "admin@tienda.com", tenantName: "Mi Tienda", products: PRODUCTS });
    expect(sendMock).toHaveBeenCalledOnce();
    const call = sendMock.mock.calls[0][0];
    expect(call.to).toContain("admin@tienda.com");
  });

  it("includes all product names in the email body", async () => {
    await sendLowStockAlert({ to: "x@y.com", tenantName: "T", products: PRODUCTS });
    const html = sendMock.mock.calls[0][0].html as string;
    expect(html).toContain("Café molido");
    expect(html).toContain("Azúcar");
  });

  it("includes current qty and minStock for each product", async () => {
    await sendLowStockAlert({ to: "x@y.com", tenantName: "T", products: PRODUCTS });
    const html = sendMock.mock.calls[0][0].html as string;
    expect(html).toContain("mín. 10");
    expect(html).toContain("mín. 5");
  });

  it("mentions the tenant name in the body", async () => {
    await sendLowStockAlert({ to: "x@y.com", tenantName: "Panadería El Sol", products: PRODUCTS });
    const html = sendMock.mock.calls[0][0].html as string;
    expect(html).toContain("Panadería El Sol");
  });

  it("includes product count in the subject", async () => {
    await sendLowStockAlert({ to: "x@y.com", tenantName: "T", products: PRODUCTS });
    const subject = sendMock.mock.calls[0][0].subject as string;
    expect(subject).toContain("2");
  });
});
