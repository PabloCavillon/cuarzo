"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";
import { useT } from "@/lib/i18n/provider";

type Form = { name: string; email: string; company: string; message: string };

const labelClass = "text-base font-semibold mb-1.5 block";

export default function Contact() {
  const t = useT();
  const [form, setForm]         = useState<Form>({ name: "", email: "", company: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [failed, setFailed]         = useState(false);

  const set = (field: keyof Form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFailed(false);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) setSubmitted(true);
      else setFailed(true);
    } catch {
      setFailed(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contacto" className="night rounded-t-[2.5rem] lg:rounded-t-[5rem]">
      <div className="section grid lg:grid-cols-2 gap-10 lg:gap-20">
        <div>
          <h2 className="title">{t.contact.heading}</h2>
          <p className="ink-2 mt-5 max-w-[42ch] text-pretty">{t.contact.description}</p>
          <dl className="mt-10 space-y-4">
            <div>
              <dt className="ink-2 text-base">{t.contact.emailLabel}</dt>
              <dd><a href="mailto:dev@cuarzostudio.com" className="ink underline underline-offset-4">dev@cuarzostudio.com</a></dd>
            </div>
            <div>
              <dt className="ink-2 text-base">WhatsApp</dt>
              <dd><a href="https://wa.me/5491166565670" target="_blank" rel="noopener noreferrer" className="ink underline underline-offset-4">11 6656-5670</a></dd>
            </div>
            <div>
              <dt className="ink-2 text-base">{t.contact.locationLabel}</dt>
              <dd className="ink">{t.contact.locationValue}</dd>
            </div>
          </dl>
        </div>

        <div className="form-panel rounded-4xl p-6 sm:p-10">
          {submitted ? (
            <div role="status" className="h-full flex flex-col justify-center gap-3">
              <CheckCircle className="w-10 h-10 text-(--blue)" aria-hidden />
              <h3 className="title">{t.contact.success.heading}</h3>
              <p className="ink-2">{t.contact.success.description}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="contact-name" className={labelClass}>{t.contact.fields.name}</label>
                  <input id="contact-name" required type="text" maxLength={200} autoComplete="name" value={form.name} onChange={set("name")} placeholder={t.contact.fields.namePlaceholder} className="field" />
                </div>
                <div>
                  <label htmlFor="contact-email" className={labelClass}>{t.contact.fields.email}</label>
                  <input id="contact-email" required type="email" maxLength={200} autoComplete="email" value={form.email} onChange={set("email")} placeholder={t.contact.fields.emailPlaceholder} className="field" />
                </div>
              </div>

              <div>
                <label htmlFor="contact-company" className={labelClass}>{t.contact.fields.company}</label>
                <input id="contact-company" type="text" maxLength={200} autoComplete="organization" value={form.company} onChange={set("company")} placeholder={t.contact.fields.companyPlaceholder} className="field" />
              </div>

              <div>
                <label htmlFor="contact-message" className={labelClass}>{t.contact.fields.message}</label>
                <textarea id="contact-message" required rows={5} maxLength={5000} value={form.message} onChange={set("message")} placeholder={t.contact.fields.messagePlaceholder} className="field resize-none" />
              </div>

              {failed && <p role="alert" className="font-semibold text-base">{t.contact.error}</p>}

              <button type="submit" disabled={submitting} className="btn w-full">
                <Send className="w-4 h-4" aria-hidden />
                {submitting ? t.contact.sending : t.contact.submit}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
