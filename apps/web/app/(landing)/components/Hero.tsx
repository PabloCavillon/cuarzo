"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { CuarzoIsotype } from "@/app/components/CuarzoLogo";
import { useT } from "@/lib/i18n/provider";

// Three.js bundle loads lazily after the hero text is painted.
// SVG isotype is shown while it loads — zero layout shift.
const CrystalScene = dynamic(
  () => document.createElement("canvas").getContext("webgl2")
    ? import("./CrystalScene").catch(() => ({ default: () => null }))
    : Promise.resolve({ default: () => null }),
  {
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center">
        <CuarzoIsotype height={160} className="opacity-60" />
      </div>
    ),
  }
);

export default function Hero() {
  const t = useT();

  return (
    <section id="inicio" className="night relative overflow-hidden rounded-b-[2.5rem] lg:rounded-b-[5rem]">
      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-32 lg:pt-0 lg:min-h-svh flex flex-col lg:justify-center">
        <div className="relative z-10 lg:max-w-[56%]">
          <h1 className="title text-[clamp(2.5rem,5.6vw,5rem)]!">
            {t.hero.heading1} {t.hero.heading2} {t.hero.heading3}
          </h1>
          <p className="ink-2 text-xl mt-6 max-w-[46ch] text-pretty">{t.hero.description}</p>
          <div className="flex flex-col sm:flex-row gap-3 mt-10">
            <Link href="/register" className="btn">
              {t.hero.ctaPrimary}
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
            <a href="#a-medida" className="btn btn-quiet">{t.hero.ctaSecondary}</a>
          </div>
        </div>
      </div>

      <div className="h-96 sm:h-128 mt-6 lg:mt-0 lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[52%] pointer-events-none lg:pointer-events-auto">
        <CrystalScene />
      </div>
    </section>
  );
}
