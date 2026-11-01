"use client";

import { ArrowRight } from "lucide-react";
import { useT } from "@/lib/i18n/provider";

// Two identical halves, so the loop that shifts it by half has no visible seam.
const WAVE = `M0 40 Q 25 0 50 40${Array.from({ length: 79 }, (_, i) => ` T ${100 + i * 50} 40`).join("")}`;

export default function WhyCuarzo() {
  const t = useT();

  return (
    <section className="layer relative overflow-hidden">
      <div className="section relative pb-10! lg:pb-14!">
        <h2 className="title" data-reveal>{t.whyCuarzo.heading}</h2>
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-12 mt-8 text-lg leading-7" data-reveal>
          <p className="ink-2">{t.whyCuarzo.body1}</p>
          <p className="ink-2">{t.whyCuarzo.body2}</p>
        </div>
      </div>

      <div aria-hidden className="wave loops">
        <svg viewBox="0 0 4000 80" preserveAspectRatio="none" fill="none">
          <path d={WAVE} stroke="var(--accent)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
        </svg>
        <svg viewBox="0 0 4000 80" preserveAspectRatio="none" fill="none" className="wave-slow">
          <path d={WAVE} stroke="var(--violet)" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>

      <div className="section pt-10! lg:pt-14! flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6" data-reveal>
        <p className="title accent max-w-[20ch]">{t.whyCuarzo.closing}</p>
        <a href="#contacto" className="btn btn-lg shrink-0">
          {t.hero.ctaPrimary}
          <ArrowRight className="w-4 h-4" aria-hidden />
        </a>
      </div>
    </section>
  );
}
