"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useT } from "@/lib/i18n/provider";

export default function Team() {
  const t = useT();

  return (
    <section id="equipo" className="section">
      <h2 className="title" data-reveal>{t.team.heading}</h2>
      <p className="ink-2 text-lg mt-4 max-w-[56ch] text-pretty" data-reveal>{t.team.description}</p>

      <div className="grid lg:grid-cols-2 gap-4 mt-10 lg:mt-14">
        {t.team.items.map((p) => (
          <Link key={p.name} href={p.href} aria-label={`${t.team.cv}: ${p.name}`} data-reveal className="glass lit group p-6 lg:p-8 flex flex-col items-start">
            <p className="mono accent">{p.role}</p>
            <h3 className="title mt-5 mb-4">{p.name}</h3>
            <p className="ink-2 max-w-[56ch] mb-8">{p.bio}</p>
            <span className="btn btn-quiet mt-auto">
              {t.team.cv}
              <ArrowRight className="w-4 h-4" aria-hidden />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
