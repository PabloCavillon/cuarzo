"use client";

import { useT } from "@/lib/i18n/provider";

export default function ValueProp() {
  const t = useT();

  return (
    <section id="propuesta" className="section pt-0! lg:pt-0!">
      <h2 className="title max-w-[20ch]">{t.values.heading}</h2>
      <p className="ink-2 mt-5 max-w-[46ch] text-pretty">{t.values.description}</p>

      <div className="grid sm:grid-cols-2 gap-x-12 lg:gap-x-20 mt-12">
        {t.values.items.map((v) => (
          <div key={v.title} className="py-7 border-t border-(--line)">
            <h3 className="subtitle mb-2">{v.title}</h3>
            <p className="ink-2 max-w-[48ch]">{v.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
