"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useT } from "@/lib/i18n/provider";

const HREFS = ["/register", "/appointments", "/register", "/register"];
const TURNERA_IDX = 1;

export default function Services() {
  const t = useT();

  return (
    <section id="servicios" className="section grid lg:grid-cols-[2fr_3fr] gap-10 lg:gap-20">
      <div>
        <h2 className="title">{t.services.heading}</h2>
        <p className="ink-2 mt-5 max-w-[42ch] text-pretty">{t.services.description}</p>
      </div>

      <div>
        {t.services.items.map((s, i) => (
          <Link key={s.title} href={HREFS[i]} className="row">
            <h3 className="subtitle">{s.title}</h3>
            <p className="ink-2 max-w-[56ch]">{s.description}</p>
            <span className="inline-flex items-center gap-2 mt-1 text-base font-semibold text-(--blue)">
              {i === TURNERA_IDX ? t.services.cta : t.pricing.cta}
              <ArrowRight className="w-4 h-4" aria-hidden />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
