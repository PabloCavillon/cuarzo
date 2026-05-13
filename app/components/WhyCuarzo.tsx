"use client";

import { motion } from "framer-motion";
import { CuarzoIsotype } from "./CuarzoLogo";
import { useT } from "@/lib/i18n/provider";

export default function WhyCuarzo() {
  const t = useT();

  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-navy-950 relative overflow-hidden">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-navy-700/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* — Left: isotype + closing line — */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex flex-col items-center lg:items-start gap-8"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-navy-500/10 rounded-full blur-2xl scale-150" />
              <CuarzoIsotype height={140} className="relative opacity-80" />
            </div>

            {/* Pillars */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
              {t.whyCuarzo.pillars.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
                  className="bg-white/4 border border-white/8 rounded-xl p-3.5"
                >
                  <p className="text-sm font-bold text-white mb-0.5">{p.value}</p>
                  <p className="text-[10px] text-white/35 leading-snug">{p.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* — Right: copy — */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <span className="text-navy-400 text-xs font-semibold tracking-[0.2em] uppercase mb-5 block">
              {t.whyCuarzo.eyebrow}
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.1] mb-8">
              {t.whyCuarzo.heading}
            </h2>

            <div className="space-y-5">
              <p className="text-white/55 text-base sm:text-lg leading-relaxed">
                {t.whyCuarzo.body1}
              </p>
              <p className="text-white/55 text-base sm:text-lg leading-relaxed">
                {t.whyCuarzo.body2}
              </p>
            </div>

            <div className="mt-10 pt-8 border-t border-white/8">
              <p className="text-white font-semibold text-lg sm:text-xl italic">
                &ldquo;{t.whyCuarzo.closing}&rdquo;
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
