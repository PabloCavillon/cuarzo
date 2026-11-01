"use client";

import { ArrowRight } from "lucide-react";
import { SERVICE_EVENT } from "@/lib/contact";
import { useT } from "@/lib/i18n/provider";
import { ApiDemo, AutomationDemo, CommerceDemo, DesignDemo, ManagementDemo } from "./ServiceDemos";

const DEMOS = [CommerceDemo, ManagementDemo, ApiDemo, AutomationDemo, DesignDemo];
const SPANS = ["lg:col-span-3", "lg:col-span-3", "lg:col-span-2", "lg:col-span-2", "lg:col-span-2"];

export default function Services() {
  const t = useT();

  return (
    <section id="servicios" className="section">
      <h2 className="title max-w-[18ch]" data-reveal>{t.services.heading}</h2>
      <p className="ink-2 text-lg mt-4 max-w-[56ch] text-pretty" data-reveal>{t.services.description}</p>

      <div className="grid lg:grid-cols-6 gap-4 mt-10 lg:mt-14">
        {t.services.items.map((s, i) => {
          const Demo = DEMOS[i];
          return (
            <a
              key={s.title}
              href="#contacto"
              onClick={() => window.dispatchEvent(new CustomEvent(SERVICE_EVENT, { detail: s.title }))}
              data-reveal
              className={`glass lit loops group flex flex-col justify-between gap-8 p-6 ${SPANS[i]}`}
            >
              <div aria-hidden className="min-h-24"><Demo /></div>
              <div>
                <h3 className="subtitle flex items-start justify-between gap-3">
                  <span className="min-w-0">{s.title}</span>
                  <ArrowRight className="w-5 h-5 shrink-0 ink-2 group-hover:text-(--accent) transition-colors" aria-hidden />
                </h3>
                <p className="ink-2 mt-2">{s.description}</p>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
