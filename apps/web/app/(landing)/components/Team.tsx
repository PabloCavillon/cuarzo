"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/provider";

export default function Team() {
  const t = useT();

  return (
    <section id="equipo" className="section pt-0! lg:pt-0!">
      <h2 className="title max-w-[20ch]">{t.team.heading}</h2>
      <p className="ink-2 mt-5 max-w-[46ch] text-pretty">{t.team.description}</p>

      <div className="grid sm:grid-cols-2 gap-x-12 lg:gap-x-20 mt-12">
        {t.team.items.map((p) => (
          <div key={p.name} className="py-7 border-t border-(--line)">
            <h3 className="subtitle">{p.name}</h3>
            <p className="font-semibold text-base mt-1 mb-2">{p.role}</p>
            <p className="ink-2 max-w-[48ch]">{p.bio}</p>
            <Link href={p.href} aria-label={`${t.team.cv}: ${p.name}`} className="inline-block mt-3 text-base font-semibold text-(--blue) underline underline-offset-4">
              {t.team.cv}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
