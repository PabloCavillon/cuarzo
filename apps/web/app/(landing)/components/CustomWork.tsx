"use client";

import { ArrowRight } from "lucide-react";
import { useT } from "@/lib/i18n/provider";

export default function CustomWork() {
  const t = useT();

  return (
    <section id="a-medida" className="section pt-0! lg:pt-0! grid lg:grid-cols-[2fr_3fr] gap-10 lg:gap-20">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <h2 className="title">{t.customWork.heading}</h2>
        <p className="ink-2 mt-5 max-w-[42ch] text-pretty">{t.customWork.description}</p>
        <a href="#contacto" className="btn mt-8">
          {t.customWork.cta}
          <ArrowRight className="w-4 h-4" aria-hidden />
        </a>
      </div>

      <ul>
        {t.customWork.items.map((item) => (
          <li key={item.title} className="row">
            <h3 className="subtitle">{item.title}</h3>
            <p className="ink-2 max-w-[56ch]">{item.description}</p>
            <p className="ink-2 text-base">{item.tags.join(" · ")}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
