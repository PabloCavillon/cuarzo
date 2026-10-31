"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useT } from "@/lib/i18n/provider";

const POPULAR_IDX = 2; // Pro

export default function Pricing() {
  const t = useT();

  return (
    <section id="precios" className="section">
      <h2 className="title max-w-[20ch]">{t.pricing.heading}</h2>
      <p className="ink-2 mt-5 max-w-[50ch] text-pretty">{t.pricing.description}</p>

      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-px rounded-4xl overflow-hidden border border-(--line) bg-(--line)">
        {t.pricing.plans.map((plan, i) => {
          const isPopular = i === POPULAR_IDX;
          const isFree = plan.price === "0";

          return (
            <div key={plan.name} className={`${isPopular ? "plan-featured" : "bg-(--surface)"} flex flex-col p-7`}>
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="subtitle ink">{plan.name}</h3>
                {isPopular && <span className="ink text-sm font-semibold">{t.pricing.popular}</span>}
              </div>

              <p className="title ink mt-5 tabular-nums">${plan.price}</p>
              <p className="ink-2 text-base mb-6">{plan.period}</p>

              <ul className="flex-1 space-y-2.5 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="ink-2 flex items-start gap-2.5 text-base leading-snug">
                    <Check className="w-4 h-4 shrink-0 mt-1" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href={`/register?plan=${plan.name.toLowerCase()}`} className="btn">
                {isFree ? t.pricing.ctaFree : t.pricing.cta}
              </Link>
            </div>
          );
        })}
      </div>

      <p className="ink-2 mt-6 text-base">{t.pricing.disclaimer}</p>
    </section>
  );
}
