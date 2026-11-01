"use client";

import { ArrowRight } from "lucide-react";
import { useT } from "@/lib/i18n/provider";

export default function CustomWork() {
  const t = useT();

  return (
    <section id="a-medida" className="section grid lg:grid-cols-[2fr_3fr] gap-8">
      <div className="lg:sticky lg:top-20 lg:self-start">
        <h2 className="title" data-reveal>{t.customWork.heading}</h2>
        <p className="ink-2 mt-2 max-w-[42ch] text-pretty">{t.customWork.description}</p>
        <a href="#contacto" className="btn mt-6">
          {t.hero.ctaPrimary}
          <ArrowRight className="w-4 h-4" aria-hidden />
        </a>
      </div>

      <ul>
        {t.customWork.items.map((item) => (
          <li key={item.title} className="row" data-reveal>
            <h3 className="subtitle">{item.title}</h3>
            <p className="ink-2 max-w-[56ch]">{item.description}</p>
            <ul className="flex flex-wrap gap-1.5 mt-2">{item.tags.map((tag) => <li key={tag} className="chip">{tag}</li>)}</ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
