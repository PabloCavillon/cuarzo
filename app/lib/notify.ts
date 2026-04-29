import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const SERVICE_LABEL: Record<string, string> = {
  WEB: "Desarrollo Web",
  BRAND: "Diseño de Marca",
  BOTH: "Ambos (web + marca)",
};

export async function notifyNewLead(lead: {
  name: string;
  email: string;
  business?: string;
  service: string;
  message?: string;
}) {
  if (!process.env.RESEND_API_KEY || !process.env.NOTIFICATION_EMAIL) return;

  const timestamp = new Date().toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    dateStyle: "full",
    timeStyle: "short",
  });

  await resend.emails.send({
    from: "Cuarzo <onboarding@resend.dev>",
    to: [process.env.NOTIFICATION_EMAIL],
    subject: `Nuevo contacto: ${lead.name}`,
    html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0f1e;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:560px;margin:32px auto;padding:0 16px;">

    <!-- Header -->
    <div style="background:#050d1a;border:1px solid rgba(255,255,255,0.07);border-radius:16px 16px 0 0;padding:24px 28px;display:flex;align-items:center;gap:10px;">
      <svg width="18" height="22" viewBox="0 0 18 22" fill="none" stroke="#60a5fa" stroke-linejoin="round" stroke-linecap="round">
        <polygon points="9,1 17,6 17,16 9,21 1,16 1,6" stroke-width="1.5"/>
        <line x1="1" y1="6" x2="17" y2="6" stroke-width="1"/>
        <line x1="9" y1="1" x2="5" y2="6" stroke-width="0.75"/>
        <line x1="9" y1="1" x2="13" y2="6" stroke-width="0.75"/>
      </svg>
      <span style="color:#fff;font-weight:700;font-size:16px;letter-spacing:0.5px;">Cuarzo</span>
    </div>

    <!-- Body -->
    <div style="background:#070e1f;border:1px solid rgba(255,255,255,0.07);border-top:none;padding:28px;">
      <p style="margin:0 0 4px;color:#94a3b8;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Nuevo mensaje de contacto</p>
      <h1 style="margin:0 0 20px;color:#fff;font-size:22px;font-weight:700;">${lead.name}</h1>

      <!-- Info table -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;width:110px;vertical-align:top;">Email</td>
          <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
            <a href="mailto:${lead.email}" style="color:#93c5fd;text-decoration:none;font-size:14px;">${lead.email}</a>
          </td>
        </tr>
        ${lead.business ? `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;vertical-align:top;">Negocio</td>
          <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:#f1f5f9;font-size:14px;">${lead.business}</td>
        </tr>` : ""}
        <tr>
          <td style="padding:10px 0;border-bottom:${lead.message ? "1px solid rgba(255,255,255,0.06)" : "none"};color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;vertical-align:top;">Servicio</td>
          <td style="padding:10px 0;border-bottom:${lead.message ? "1px solid rgba(255,255,255,0.06)" : "none"};">
            <span style="display:inline-block;background:rgba(37,99,235,0.15);border:1px solid rgba(59,130,246,0.25);color:#93c5fd;font-size:12px;padding:3px 10px;border-radius:20px;">
              ${SERVICE_LABEL[lead.service] ?? lead.service}
            </span>
          </td>
        </tr>
        ${lead.message ? `
        <tr>
          <td style="padding:10px 0;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;vertical-align:top;">Mensaje</td>
          <td style="padding:10px 0;color:#cbd5e1;font-size:14px;line-height:1.65;">${lead.message.replace(/\n/g, "<br>")}</td>
        </tr>` : ""}
      </table>

      <!-- CTA -->
      <a href="mailto:${lead.email}?subject=Re: tu consulta en Cuarzo"
         style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:11px 22px;border-radius:24px;font-size:13px;font-weight:600;">
        Responder a ${lead.name.split(" ")[0]}
      </a>
    </div>

    <!-- Footer -->
    <div style="background:#030710;border:1px solid rgba(255,255,255,0.05);border-top:none;border-radius:0 0 16px 16px;padding:16px 28px;text-align:center;">
      <p style="margin:0;color:#334155;font-size:11px;">${timestamp} · Solo vos recibís este mail.</p>
    </div>

  </div>
</body>
</html>
    `.trim(),
  });
}
