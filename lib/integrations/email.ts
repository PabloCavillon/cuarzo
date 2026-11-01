import { Resend } from "resend";
import { EMAIL } from "@/lib/contact";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM = "Cuarzo <noreply@cuarzostudio.com>";

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
              Respondé este mail para contestarle directamente a quien escribió
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

export type ContactMessage = { name: string; email: string; company?: string; message: string };

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Returns false instead of throwing so the form can tell the visitor nothing was sent.
export async function sendContactMessage({ name, email, company, message }: ContactMessage): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) return false;

  const emailBody = `
    <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#0f172a;">Nueva consulta desde la web</h1>
    <p style="margin:0 0 24px 0;font-size:14px;color:#64748b;line-height:1.6;">${escapeHtml(name)} (${escapeHtml(email)})${company ? ` · ${escapeHtml(company)}` : ""}</p>
    <hr style="border:none;border-top:1px solid #f1f5f9;margin:24px 0;">
    <p style="margin:0;font-size:14px;line-height:1.6;color:#334155;white-space:pre-wrap;">${escapeHtml(message)}</p>
  `;

  const { error } = await getResend().emails.send({
    from:    FROM,
    to:      [EMAIL],
    replyTo: email,
    subject: `Consulta de ${name}`,
    html:    shell(emailBody, `Consulta de ${escapeHtml(name)}`),
  });
  return !error;
}
