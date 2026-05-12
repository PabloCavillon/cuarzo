import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM = "Cuarzo <noreply@cuarzo.dev>";

// ─── Template shell ───────────────────────────────────────────────────────────

function shell(body: string, preheader = ""): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}&nbsp;&#847;&zwnj;&nbsp;</div>` : ""}
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
  <tr>
    <td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Logo -->
        <tr>
          <td style="padding:0 0 28px 0;text-align:center;">
            <span style="font-size:18px;font-weight:800;letter-spacing:0.18em;color:#0a1628;">CUARZO</span>
          </td>
        </tr>

        <!-- Card -->
        <tr>
          <td style="background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;padding:36px 40px;">
            ${body}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:28px 0 0 0;text-align:center;">
            <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
              Este mensaje fue generado automáticamente · No respondas a este email
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

// ─── Shared snippets ──────────────────────────────────────────────────────────

function heading(text: string): string {
  return `<h1 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#0f172a;">${text}</h1>`;
}

function subtext(text: string): string {
  return `<p style="margin:0 0 24px 0;font-size:14px;color:#64748b;line-height:1.6;">${text}</p>`;
}

function badge(text: string, color: string): string {
  return `<span style="display:inline-block;padding:4px 12px;border-radius:99px;font-size:12px;font-weight:700;background:${color};color:#fff;margin-bottom:24px;">${text}</span>`;
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid #f1f5f9;margin:24px 0;">`;
}

function ctaButton(label: string, href: string): string {
  return `
<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
  <tr>
    <td align="center">
      <a href="${href}" style="display:inline-block;padding:12px 28px;background:#0a1628;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">${label}</a>
    </td>
  </tr>
</table>`;
}

function fmt(n: number): string {
  return n.toLocaleString("es-AR", { minimumFractionDigits: 2 });
}

// ─── Order items table ────────────────────────────────────────────────────────

type EmailItem = { nameSnap: string; skuSnap: string; qty: number; unitPrice: number };

function itemsTable(items: EmailItem[], total: number): string {
  const rows = items
    .map(
      (it) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#1e293b;">
        ${it.nameSnap}
        <span style="display:block;font-size:12px;color:#94a3b8;margin-top:2px;">${it.skuSnap}</span>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#64748b;text-align:center;white-space:nowrap;">
        × ${it.qty}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#1e293b;text-align:right;white-space:nowrap;">
        $ ${fmt(it.qty * it.unitPrice)}
      </td>
    </tr>`,
    )
    .join("");

  return `
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
  <thead>
    <tr>
      <th style="padding:0 0 8px 0;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;text-align:left;border-bottom:2px solid #f1f5f9;">Producto</th>
      <th style="padding:0 0 8px 0;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;text-align:center;border-bottom:2px solid #f1f5f9;">Cant.</th>
      <th style="padding:0 0 8px 0;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;text-align:right;border-bottom:2px solid #f1f5f9;">Subtotal</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>
<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td style="font-size:15px;font-weight:700;color:#0f172a;">Total</td>
    <td style="font-size:15px;font-weight:700;color:#0f172a;text-align:right;">ARS $ ${fmt(total)}</td>
  </tr>
</table>`;
}

// ─── Email senders ────────────────────────────────────────────────────────────

export type OrderEmailPayload = {
  to:      string;
  name:    string;
  orderId: string;
  items:   EmailItem[];
  total:   number;
};

export async function sendOrderCreated(payload: OrderEmailPayload): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  const shortId = payload.orderId.slice(0, 8).toUpperCase();

  const body = `
    ${heading(`Recibimos tu pedido, ${payload.name.split(" ")[0]}!`)}
    ${badge("Recibido", "#64748b")}
    ${subtext("Tu pedido fue registrado correctamente. En breve nos ponemos en contacto para coordinar los detalles.")}
    ${divider()}
    ${itemsTable(payload.items, payload.total)}
    ${divider()}
    <p style="margin:0;font-size:12px;color:#94a3b8;">Referencia: <strong style="color:#64748b;">#${shortId}</strong></p>
  `;

  await getResend().emails.send({
    from:    FROM,
    to:      [payload.to],
    subject: `Pedido recibido #${shortId} — Cuarzo`,
    html:    shell(body, `Tu pedido #${shortId} fue registrado correctamente.`),
  });
}

// ─── Status update emails ─────────────────────────────────────────────────────

type StatusConfig = {
  badgeColor: string;
  badgeLabel: string;
  heading:    string;
  body:       string;
};

const STATUS_CONFIG: Record<string, StatusConfig> = {
  confirmed: {
    badgeColor: "#3b82f6",
    badgeLabel: "Confirmado",
    heading:    "Tu pedido fue confirmado",
    body:       "Excelente noticia — tu pedido ya fue confirmado y está siendo procesado. Te avisamos cuando esté listo para enviar.",
  },
  processing: {
    badgeColor: "#f59e0b",
    badgeLabel: "En proceso",
    heading:    "Tu pedido está en preparación",
    body:       "Estamos preparando tu pedido. Recibirás otra notificación cuando esté en camino.",
  },
  shipped: {
    badgeColor: "#8b5cf6",
    badgeLabel: "Enviado",
    heading:    "Tu pedido está en camino",
    body:       "Tu pedido salió de nuestras instalaciones y está en camino. Pronto llega a destino.",
  },
  delivered: {
    badgeColor: "#10b981",
    badgeLabel: "Entregado",
    heading:    "Tu pedido fue entregado",
    body:       "Tu pedido fue entregado exitosamente. Muchas gracias por tu compra — esperamos que todo esté perfecto.",
  },
};

export async function sendOrderStatusUpdate(
  payload: Omit<OrderEmailPayload, "items"> & { status: string },
): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;
  const cfg = STATUS_CONFIG[payload.status];
  if (!cfg) return;

  const shortId = payload.orderId.slice(0, 8).toUpperCase();

  const emailBody = `
    ${heading(cfg.heading)}
    ${badge(cfg.badgeLabel, cfg.badgeColor)}
    ${subtext(cfg.body)}
    ${divider()}
    <p style="margin:0;font-size:14px;color:#64748b;">
      <strong style="color:#1e293b;">Referencia:</strong> #${shortId}
    </p>
    <p style="margin:8px 0 0 0;font-size:14px;color:#64748b;">
      <strong style="color:#1e293b;">Total:</strong> ARS $ ${fmt(payload.total)}
    </p>
  `;

  await getResend().emails.send({
    from:    FROM,
    to:      [payload.to],
    subject: `Pedido ${cfg.badgeLabel.toLowerCase()} #${shortId} — Cuarzo`,
    html:    shell(emailBody, `${cfg.heading} — pedido #${shortId}`),
  });
}

// ─── Booking confirmation ─────────────────────────────────────────────────────

export type BookingEmailPayload = {
  to:          string;
  name:        string;
  code:        string;
  serviceName: string;
  date:        string;
  time:        string;
  price:       number;
};

// ─── Team invitation ──────────────────────────────────────────────────────────

export async function sendInvitation({
  to,
  tenantName,
  invitedBy,
  role,
  token,
}: {
  to:         string;
  tenantName: string;
  invitedBy:  string;
  role:       string;
  token:      string;
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  const acceptUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/invite/${token}`;
  const roleLabel = role === "admin" ? "Admin" : "Staff";

  const emailBody = `
    ${heading(`Fuiste invitado a ${tenantName}`)}
    ${badge("Invitación pendiente", "#6366f1")}
    ${subtext(`<strong>${invitedBy}</strong> te invitó a unirte al equipo de <strong>${tenantName}</strong> en Cuarzo con el rol de <strong>${roleLabel}</strong>.`)}
    ${ctaButton("Aceptar invitación", acceptUrl)}
    ${divider()}
    <p style="margin:0;font-size:12px;color:#94a3b8;">Este enlace expira en 7 días. Si no reconocés esta invitación, ignorá este mensaje.</p>
  `;

  await getResend().emails.send({
    from:    FROM,
    to:      [to],
    subject: `Invitación a ${tenantName} en Cuarzo`,
    html:    shell(emailBody, `${invitedBy} te invitó a unirse a ${tenantName}.`),
  });
}

// ─── Password reset ───────────────────────────────────────────────────────────

export async function sendPasswordReset({
  to, name, resetUrl,
}: { to: string; name: string; resetUrl: string }): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  const emailBody = `
    ${heading(`Restablecer contraseña`)}
    ${subtext(`Hola ${name.split(" ")[0]}, recibimos una solicitud para restablecer la contraseña de tu cuenta Cuarzo.`)}
    ${ctaButton("Restablecer contraseña", resetUrl)}
    ${divider()}
    <p style="margin:0;font-size:12px;color:#94a3b8;">Este enlace expira en 1 hora. Si no solicitaste el restablecimiento, ignorá este mensaje — tu cuenta está segura.</p>
  `;

  await getResend().emails.send({
    from:    FROM,
    to:      [to],
    subject: "Restablecer contraseña — Cuarzo",
    html:    shell(emailBody, "Enlace para restablecer tu contraseña de Cuarzo."),
  });
}

// ─── Email verification ───────────────────────────────────────────────────────

export async function sendEmailVerification({
  to, name, verifyUrl,
}: { to: string; name: string; verifyUrl: string }): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  const emailBody = `
    ${heading(`Verificá tu email, ${name.split(" ")[0]}!`)}
    ${badge("Pendiente de verificación", "#6366f1")}
    ${subtext("Para activar todas las funciones de tu cuenta Cuarzo, verificá tu dirección de email.")}
    ${ctaButton("Verificar email", verifyUrl)}
    ${divider()}
    <p style="margin:0;font-size:12px;color:#94a3b8;">Este enlace expira en 24 horas. Si no creaste esta cuenta, ignorá este mensaje.</p>
  `;

  await getResend().emails.send({
    from:    FROM,
    to:      [to],
    subject: "Verificá tu email — Cuarzo",
    html:    shell(emailBody, "Verificá tu email para activar tu cuenta Cuarzo."),
  });
}

// ─── Low stock alert ──────────────────────────────────────────────────────────

export async function sendLowStockAlert({
  to, tenantName, products,
}: {
  to:         string;
  tenantName: string;
  products:   { name: string; sku: string; qty: number; minStock: number; warehouse: string }[];
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  const rows = products
    .map(
      (p) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#1e293b;">
        ${p.name}
        <span style="display:block;font-size:12px;color:#94a3b8;">${p.sku} · ${p.warehouse}</span>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#ef4444;text-align:right;font-weight:700;">${p.qty}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#94a3b8;text-align:right;">mín. ${p.minStock}</td>
    </tr>`,
    )
    .join("");

  const table = `
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
  <thead>
    <tr>
      <th style="padding:0 0 8px 0;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;text-align:left;border-bottom:2px solid #f1f5f9;">Producto</th>
      <th style="padding:0 0 8px 0;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;text-align:right;border-bottom:2px solid #f1f5f9;">Stock actual</th>
      <th style="padding:0 0 8px 0;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;text-align:right;border-bottom:2px solid #f1f5f9;">Mínimo</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>`;

  const emailBody = `
    ${heading("Alerta de stock bajo")}
    ${badge(`${products.length} producto${products.length > 1 ? "s" : ""} con stock bajo`, "#ef4444")}
    ${subtext(`Los siguientes productos de <strong>${tenantName}</strong> están por debajo de su stock mínimo:`)}
    ${table}
    <a href="${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/admin/stock"
       style="color:#0a1628;font-size:13px;font-weight:600;">Ver stock →</a>
  `;

  await getResend().emails.send({
    from:    FROM,
    to:      [to],
    subject: `Alerta: ${products.length} producto${products.length > 1 ? "s" : ""} con stock bajo — ${tenantName}`,
    html:    shell(emailBody, `${products.length} productos por debajo del stock mínimo.`),
  });
}

// ─── Booking confirmation ─────────────────────────────────────────────────────

export async function sendBookingConfirmed(payload: BookingEmailPayload): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  const [y, m, d]   = payload.date.split("-").map(Number);
  const dateFormatted = new Date(y, m - 1, d).toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const emailBody = `
    ${heading(`Tu turno está confirmado, ${payload.name.split(" ")[0]}!`)}
    ${badge("Confirmado", "#10b981")}
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
      <tr>
        <td>
          <p style="margin:0 0 10px 0;font-size:14px;color:#64748b;">
            <strong style="color:#1e293b;display:inline-block;width:100px;">Servicio</strong>${payload.serviceName}
          </p>
          <p style="margin:0 0 10px 0;font-size:14px;color:#64748b;">
            <strong style="color:#1e293b;display:inline-block;width:100px;">Fecha</strong>${dateFormatted}
          </p>
          <p style="margin:0 0 10px 0;font-size:14px;color:#64748b;">
            <strong style="color:#1e293b;display:inline-block;width:100px;">Hora</strong>${payload.time} hs
          </p>
          ${payload.price > 0 ? `
          <p style="margin:0;font-size:14px;color:#64748b;">
            <strong style="color:#1e293b;display:inline-block;width:100px;">Precio</strong>ARS $ ${fmt(payload.price)}
          </p>` : ""}
        </td>
      </tr>
    </table>
    ${divider()}
    <p style="margin:0;font-size:12px;color:#94a3b8;">Código de reserva: <strong style="color:#64748b;font-family:monospace;font-size:14px;">${payload.code}</strong></p>
    <p style="margin:8px 0 0 0;font-size:12px;color:#94a3b8;">Guardá este email como comprobante.</p>
  `;

  await getResend().emails.send({
    from:    FROM,
    to:      [payload.to],
    subject: `Turno confirmado ${payload.code} — Cuarzo`,
    html:    shell(emailBody, `Tu turno del ${dateFormatted} a las ${payload.time} hs está confirmado.`),
  });
}
