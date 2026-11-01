"use client";

import { useT } from "@/lib/i18n/provider";

export default function ValueProp() {
  const t = useT();

  return (
    <section id="propuesta" className="layer scroll-mt-16">
      <div className="section">
        <h2 className="title" data-reveal>{t.values.heading}</h2>
        <p className="ink-2 text-lg mt-4 max-w-[56ch] text-pretty" data-reveal>{t.values.description}</p>

        <ol className="pipeline loops mt-12 lg:mt-16" data-reveal>
          {t.values.steps.map((step, i) => (
            <li key={step} className="pipeline-step">
              <span className="pipeline-node" style={{ animationDelay: `${i * 0.75}s` }} />
              <span className="subtitle">{step}</span>
            </li>
          ))}
        </ol>

        <div className="grid sm:grid-cols-2 gap-4 mt-10 lg:mt-14">
          {t.values.items.map((v) => (
            <div key={v.title} data-reveal className="glass lit p-5">
              <h3 className="subtitle mb-2">{v.title}</h3>
              <p className="ink-2">{v.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
