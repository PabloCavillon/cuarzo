"use client";

import { useEffect, useRef, useState } from "react";
import { Send, CheckCircle, MessageCircle } from "lucide-react";
import { EMAIL, EMAIL_RE, SERVICE_EVENT, whatsappUrl } from "@/lib/contact";
import { useT } from "@/lib/i18n/provider";
import type { T } from "@/lib/i18n";

type Form = { name: string; email: string; company: string; message: string; website: string };
type Required = "name" | "email" | "message";
type Errors = Partial<Record<Required, keyof T["contact"]["errors"]>>;

const labelClass = "font-medium mb-1 block";
const REQUIRED: Required[] = ["name", "email", "message"];

function validate(form: Form): Errors {
  const errors: Errors = {};
  if (!form.name.trim()) errors.name = "name";
  if (!form.email.trim()) errors.email = "email";
  else if (!EMAIL_RE.test(form.email.trim())) errors.email = "emailInvalid";
  if (!form.message.trim()) errors.message = "message";
  return errors;
}

export default function ContactForm() {
  const t = useT();
  const [form, setForm]         = useState<Form>({ name: "", email: "", company: "", message: "", website: "" });
  const [errors, setErrors]     = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [failed, setFailed]         = useState(false);
  const successHeading = useRef<HTMLHeadingElement>(null);

  // The form that held the focus is gone: keyboard and screen reader users land on the result.
  useEffect(() => {
    if (submitted) successHeading.current?.focus();
  }, [submitted]);

  // A service card starts the message, unless the visitor already wrote one.
  useEffect(() => {
    const onService = (e: Event) => {
      const start = t.contact.serviceMessage((e as CustomEvent<string>).detail);
      setForm((prev) => (prev.message.trim() ? prev : { ...prev, message: start }));
      setErrors((prev) => ({ ...prev, message: undefined }));
    };
    window.addEventListener(SERVICE_EVENT, onService);
    return () => window.removeEventListener(SERVICE_EVENT, onService);
  }, [t]);

  const set = (field: keyof Form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const describe = (field: Required) => ({
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? `contact-${field}-error` : undefined,
  });

  const fieldError = (field: Required) => {
    const key = errors[field];
    return key && <p id={`contact-${field}-error`} className="field-error">{t.contact.errors[key]}</p>;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    const first = REQUIRED.find((field) => found[field]);
    if (first) {
      // Centered, so the floating header never covers the field.
      const input = e.currentTarget.elements.namedItem(first) as HTMLElement;
      input.focus({ preventScroll: true });
      input.scrollIntoView({ block: "center" });
      return;
    }

    setSubmitting(true);
    setFailed(false);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        signal: AbortSignal.timeout(15_000),
      });
      if (res.ok) setSubmitted(true);
      else setFailed(true);
    } catch {
      setFailed(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="h-full flex flex-col justify-center items-start gap-3">
        <CheckCircle className="w-10 h-10 text-(--accent)" aria-hidden />
        <h3 ref={successHeading} tabIndex={-1} className="subtitle scroll-mt-24 outline-none!">{t.contact.success.heading}</h3>
        <p className="ink-2">{t.contact.success.description}</p>
        <a href={whatsappUrl(t.contact.whatsappMessage)} target="_blank" rel="noopener noreferrer" className="btn btn-quiet mt-2">
          <MessageCircle className="w-4 h-4" aria-hidden />
          {t.contact.whatsappCta}
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <p className="ink-2">{t.contact.requiredNote}</p>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact-name" className={labelClass}>{t.contact.fields.name}</label>
          <input id="contact-name" name="name" required type="text" maxLength={200} autoComplete="name" value={form.name} onChange={set("name")} placeholder={t.contact.fields.namePlaceholder} className="field" {...describe("name")} />
          {fieldError("name")}
        </div>
        <div>
          <label htmlFor="contact-email" className={labelClass}>{t.contact.fields.email}</label>
          <input id="contact-email" name="email" required type="email" maxLength={200} autoComplete="email" value={form.email} onChange={set("email")} placeholder={t.contact.fields.emailPlaceholder} className="field" {...describe("email")} />
          {fieldError("email")}
        </div>
      </div>

      <div>
        <label htmlFor="contact-company" className={labelClass}>{t.contact.fields.company}</label>
        <input id="contact-company" type="text" maxLength={200} autoComplete="organization" value={form.company} onChange={set("company")} placeholder={t.contact.fields.companyPlaceholder} className="field" />
      </div>

      <div>
        <label htmlFor="contact-message" className={labelClass}>{t.contact.fields.message}</label>
        <textarea id="contact-message" name="message" required rows={5} maxLength={5000} value={form.message} onChange={set("message")} placeholder={t.contact.fields.messagePlaceholder} className="field resize-none" {...describe("message")} />
        {fieldError("message")}
      </div>

      {/* Trap for bots: people never see this field. */}
      <input aria-hidden tabIndex={-1} type="text" name="website" autoComplete="off" value={form.website} onChange={set("website")} className="sr-only" />

      {failed && (
        <div role="alert" className="space-y-3">
          <p className="font-medium">{t.contact.error}</p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2">
            {/* Capped: a very long link can fail to open. */}
            <a href={whatsappUrl(form.message.slice(0, 1000))} target="_blank" rel="noopener noreferrer" className="btn btn-quiet">
              <MessageCircle className="w-4 h-4" aria-hidden />
              WhatsApp
            </a>
            <a href={`mailto:${EMAIL}`} className="btn btn-quiet">{EMAIL}</a>
          </div>
        </div>
      )}

      <button type="submit" disabled={submitting} className="btn w-full">
        <Send className="w-4 h-4" aria-hidden />
        {submitting ? t.contact.sending : t.contact.submit}
      </button>
    </form>
  );
}
