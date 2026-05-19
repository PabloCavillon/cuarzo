"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useT } from "@/lib/i18n/provider";

const COLORS = [
  { bg: "bg-navy-900", accent: "bg-navy-700/40", tag: "bg-navy-700 text-navy-300" },
  { bg: "bg-[#0d2218]", accent: "bg-emerald-900/30", tag: "bg-emerald-900/60 text-emerald-400" },
  { bg: "bg-[#1a1206]", accent: "bg-amber-900/20", tag: "bg-amber-900/40 text-amber-400" },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const } },
};

export default function Portfolio() {
  const t = useT();

  return (
    <section id="portfolio" className="py-16 sm:py-24 lg:py-32 bg-navy-950 relative overflow-hidden">
      <div className="absolute top-1/3 left-0 w-72 h-72 bg-navy-700/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-navy-600/8 rounded-full blur-3xl pointer-events-none translate-x-1/3" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 sm:mb-16 lg:mb-20"
        >
          <span className="text-navy-400 text-xs font-semibold tracking-[0.2em] uppercase mb-4 block">
            {t.portfolio.eyebrow}
          </span>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
                {t.portfolio.heading}
              </h2>
              <p className="text-white/40 text-base sm:text-lg max-w-xl leading-relaxed">
                {t.portfolio.description}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid lg:grid-cols-3 gap-6"
        >
          {t.portfolio.cases.map((c, i) => {
            const color = COLORS[i % COLORS.length];
            return (
              <motion.div
                key={i}
                variants={item}
                className={`group relative flex flex-col ${color.bg} border border-white/8 rounded-2xl p-7 hover:border-white/16 transition-all duration-300 overflow-hidden`}
              >
                {/* Accent blob */}
                <div className={`absolute top-0 right-0 w-48 h-48 ${color.accent} rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3`} />

                <div className="relative">
                  <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-5 ${color.tag}`}>
                    {c.industry}
                  </span>

                  <h3 className="text-base font-bold text-white mb-4 leading-snug">
                    {c.title}
                  </h3>

                  <div className="space-y-3 mb-6">
                    <div>
                      <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1">
                        Desafío
                      </p>
                      <p className="text-xs text-white/50 leading-relaxed">{c.challenge}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1">
                        Solución
                      </p>
                      <p className="text-xs text-white/50 leading-relaxed">{c.solution}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-5 border-t border-white/8">
                    {c.metrics.map((m, j) => (
                      <div key={j}>
                        <p className="text-lg font-bold text-white leading-none mb-1">{m.value}</p>
                        <p className="text-[10px] text-white/30 leading-tight">{m.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-12 text-center"
        >
          <a
            href="#contacto"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors group"
          >
            Contanos tu desafío
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
