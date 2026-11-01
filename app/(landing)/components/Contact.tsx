"use client";

import { MessageCircle } from "lucide-react";
import ContactForm from "./ContactForm";
import { EMAIL, WHATSAPP_NUMBER, whatsappUrl } from "@/lib/contact";
import { useT } from "@/lib/i18n/provider";

export default function Contact() {
  const t = useT();

  return (
    <section id="contacto" className="layer glow relative overflow-hidden scroll-mt-16">
      <div className="section relative grid lg:grid-cols-2 gap-8">
        <div data-reveal>
          <h2 className="title">{t.contact.heading}</h2>
          <p className="ink-2 text-lg mt-4 max-w-[46ch] text-pretty">{t.contact.description}</p>
          <a href={whatsappUrl(t.contact.whatsappMessage)} target="_blank" rel="noopener noreferrer" className="btn btn-lg btn-quiet w-full sm:w-auto mt-8">
            <MessageCircle className="w-4 h-4" aria-hidden />
            {t.contact.whatsappCta}
          </a>
          <dl className="mt-10 space-y-2">
            <div>
              <dt className="mono ink-2">{t.contact.emailLabel}</dt>
              <dd><a href={`mailto:${EMAIL}`} className="ink underline underline-offset-4 wrap-anywhere inline-flex items-center min-h-11">{EMAIL}</a></dd>
            </div>
            <div>
              <dt className="mono ink-2">WhatsApp</dt>
              <dd className="ink">{WHATSAPP_NUMBER}</dd>
            </div>
            <div>
              <dt className="mono ink-2">{t.contact.locationLabel}</dt>
              <dd className="ink">{t.contact.locationValue}</dd>
            </div>
          </dl>
        </div>

        <div className="glass lit p-5 sm:p-6" data-reveal>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
