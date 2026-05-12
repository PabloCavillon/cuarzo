"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { CuarzoIsotype } from "./CuarzoLogo";
import { useT } from "@/lib/i18n/provider";

export default function Hero() {
  const t = useT();
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const bgY      = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const glowY    = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const crystalY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);

  const glassStats = [
    { value: "99.9%",  label: t.hero.stats.uptime },
    { value: "< 24h", label: t.hero.stats.onboarding },
    { value: "100%",  label: t.hero.stats.arca },
  ];

  return (
    <section
      ref={heroRef}
      id="inicio"
      className="relative min-h-screen bg-navy-950 flex items-center overflow-hidden"
    >
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 bg-linear-to-br from-navy-950 via-navy-900 to-navy-800"
      />
      <motion.div
        style={{
          y: bgY,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
        className="absolute inset-0 opacity-[0.035]"
      />
      <motion.div
        style={{ y: glowY }}
        className="absolute top-1/2 right-1/4 -translate-y-1/2 w-120 h-120 bg-navy-600/20 rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 pt-28 sm:py-24 sm:pt-36 lg:py-32 lg:pt-44 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center text-navy-300 text-xs font-semibold tracking-[0.2em] uppercase mb-6 sm:mb-8 border border-navy-700 rounded-full px-4 py-1.5">
                {t.hero.badge}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.08] tracking-tight mb-5 sm:mb-6"
            >
              {t.hero.heading1}{" "}
              <span className="text-navy-400">{t.hero.heading2}</span>{" "}
              {t.hero.heading3}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-white/55 leading-relaxed mb-8 sm:mb-10 max-w-xl"
            >
              {t.hero.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-10"
            >
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-white text-navy-900 font-semibold px-6 sm:px-8 py-3.5 sm:py-4 rounded-full hover:bg-navy-100 transition-all group text-sm sm:text-base"
              >
                {t.hero.ctaPrimary}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#servicios"
                className="inline-flex items-center justify-center gap-2 text-white/75 border border-white/20 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full hover:bg-white/10 hover:text-white transition-all text-sm sm:text-base"
              >
                {t.hero.ctaSecondary}
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex overflow-hidden rounded-2xl border border-white/10 bg-white/6 backdrop-blur-xl w-full max-w-xs sm:max-w-sm"
            >
              {glassStats.map((stat, i) => (
                <div
                  key={i}
                  className={`flex-1 min-w-0 px-3 sm:px-5 py-3.5 sm:py-4 flex flex-col gap-0.5 ${
                    i > 0 ? "border-l border-white/8" : ""
                  }`}
                >
                  <span className="text-white font-bold text-sm sm:text-base leading-none truncate">
                    {stat.value}
                  </span>
                  <span className="text-white/38 text-[10px] sm:text-xs tracking-wide truncate">
                    {stat.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ y: crystalY }}
            transition={{ duration: 1, delay: 0.15 }}
            className="hidden lg:flex justify-center items-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-navy-500/15 blur-3xl rounded-full scale-150 pointer-events-none" />
              <CuarzoIsotype height={420} />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-white/30 text-[10px] tracking-[0.3em] uppercase">
            {t.hero.scroll}
          </span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          >
            <ChevronDown className="text-white/30 w-5 h-5" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
