"use client";

import { ArrowRight, Check, MessageCircle } from "lucide-react";
import Prism from "./Prism";
import { whatsappUrl } from "@/lib/contact";
import { useT } from "@/lib/i18n/provider";

// Illustrative only: what a sale looks like once the system runs on its own.
function OrderStatus() {
  const { title, steps, done } = useT().hero.order;

  return (
    <div aria-hidden className="glass p-4 w-60 sm:w-68">
      <p className="ink-2 mb-2">{title}</p>
      <ul className="space-y-1">
        {steps.map((step, i) => (
          <li key={step} className="log-line flex justify-between gap-4" style={{ animationDelay: `${0.9 + i * 0.35}s` }}>
            <span>{step}</span>
            <Check className="w-4 h-4 accent" />
          </li>
        ))}
        <li className="log-line flex items-center gap-2 pt-1" style={{ animationDelay: "2.05s" }}>
          <span className="beacon" />
          <span>{done}</span>
        </li>
      </ul>
    </div>
  );
}

export default function Hero() {
  const t = useT();

  return (
    <section id="inicio" className="hero relative overflow-hidden border-b border-(--line)">
      <div className="hairgrid" />
      <div className="relative max-w-360 mx-auto px-4 lg:px-8 pt-28 lg:pt-20 lg:min-h-svh flex flex-col lg:justify-center">
        <div className="relative z-10">
          <h1 className="display rise">
            <span><span>{t.hero.heading1}</span></span>
            <span><span className="accent" style={{ animationDelay: "120ms" }}>{t.hero.heading2} {t.hero.heading3}</span></span>
          </h1>
          <p className="ink-2 text-lg lg:text-xl mt-6 max-w-[46ch] text-pretty fade-in">{t.hero.description}</p>
          <div className="flex flex-col sm:flex-row gap-3 mt-8 fade-in">
            <a href="#contacto" className="btn btn-lg">
              {t.hero.ctaPrimary}
              <ArrowRight className="w-4 h-4" aria-hidden />
            </a>
            <a href={whatsappUrl(t.contact.whatsappMessage)} target="_blank" rel="noopener noreferrer" className="btn btn-lg btn-quiet">
              <MessageCircle className="w-4 h-4" aria-hidden />
              {t.contact.whatsappCta}
            </a>
          </div>
        </div>
        <Prism className="h-[34rem] sm:h-[40rem] mt-4 lg:mt-0 lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[42%] pointer-events-none lg:pointer-events-auto">
          <div className="absolute right-0 bottom-0 lg:right-8 lg:bottom-20 z-10 pointer-events-none">
            <OrderStatus />
          </div>
        </Prism>
      </div>
    </section>
  );
}
