import { NextRequest } from "next/server";
import { EMAIL_RE } from "@/lib/contact";
import { sendContactMessage } from "@/lib/integrations/email";

export async function POST(req: NextRequest) {
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > 10_000) {
    return Response.json({ error: "Solicitud demasiado grande." }, { status: 413 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return Response.json({ error: "JSON inválido." }, { status: 400 });
  }

  const { name, email, company, message, website } = (body ?? {}) as Record<string, unknown>;
  // Only bots fill the hidden field. They get a success, so they don't retry.
  if (website) return Response.json({ ok: true });

  if (
    typeof name !== "string" || !name.trim() || name.length > 200 ||
    typeof email !== "string" || email.length > 200 || !EMAIL_RE.test(email.trim()) ||
    typeof message !== "string" || !message.trim() || message.length > 5000 ||
    (company !== undefined && (typeof company !== "string" || company.length > 200))
  ) {
    return Response.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const sent = await sendContactMessage({
    // Single line: this value also goes into the email subject.
    name: name.trim().replace(/\s+/g, " "),
    email: email.trim(),
    company: company?.trim() || undefined,
    message: message.trim(),
  }).catch(() => false);

  if (!sent) return Response.json({ error: "No se pudo enviar el mensaje." }, { status: 502 });
  return Response.json({ ok: true });
}
