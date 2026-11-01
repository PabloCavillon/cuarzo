"use client";

import { useT } from "@/lib/i18n/provider";

export default function Services() {
  const t = useT();

  return (
    <section id="servicios" className="section grid lg:grid-cols-[2fr_3fr] gap-10 lg:gap-20">
      <div>
        <h2 className="title">{t.services.heading}</h2>
        <p className="ink-2 mt-5 max-w-[42ch] text-pretty">{t.services.description}</p>
      </div>

      <div>
        {t.services.items.map((s) => (
          <div key={s.title} className="row">
            <h3 className="subtitle">{s.title}</h3>
            <p className="ink-2 max-w-[56ch]">{s.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
