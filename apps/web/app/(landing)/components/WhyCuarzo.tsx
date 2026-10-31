"use client";

import { useT } from "@/lib/i18n/provider";

export default function WhyCuarzo() {
  const t = useT();

  return (
    <section className="night relative overflow-hidden rounded-[2.5rem] lg:rounded-[5rem] mx-3 lg:mx-6">
      {/* The hero's orbit, returning once past the fold */}
      <svg aria-hidden viewBox="0 0 540 540" fill="none" className="absolute hidden lg:block -right-24 -top-32 w-104 text-[#8fb2ff]">
        <ellipse cx="270" cy="270" rx="262" ry="108" transform="rotate(-18 270 270)" stroke="currentColor" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="section relative">
        <h2 className="title">{t.whyCuarzo.heading}</h2>
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-16 mt-8">
          <p className="ink-2">{t.whyCuarzo.body1}</p>
          <p className="ink-2">{t.whyCuarzo.body2}</p>
        </div>
        <p className="subtitle mt-12">{t.whyCuarzo.closing}</p>
      </div>
    </section>
  );
}
