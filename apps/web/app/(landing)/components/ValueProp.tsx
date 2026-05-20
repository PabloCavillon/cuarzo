"use client";

import { motion } from "framer-motion";
import { Zap, Shield, TrendingUp, MapPin } from "lucide-react";
import { useT } from "@/lib/i18n/provider";

const ICONS = [TrendingUp, Zap, Shield, MapPin];

export default function ValueProp() {
  const t = useT();

  return (
    <section id="propuesta" className="py-16 sm:py-24 lg:py-32 bg-navy-950 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-navy-700/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-navy-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16 lg:mb-20"
        >
          <span className="text-navy-400 text-xs font-semibold tracking-[0.2em] uppercase mb-4 block">
            {t.values.eyebrow}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-5">
            {t.values.heading}
          </h2>
          <p className="text-white/40 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            {t.values.description}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-12 sm:mb-20">
          {t.values.items.map((v, i) => {
            const Icon = ICONS[i];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.1 }}
                className="group bg-white/5 backdrop-blur-sm border border-white/8 rounded-2xl p-7 hover:bg-white/8 hover:border-white/14 transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/8 border border-white/10 mb-6 group-hover:bg-navy-500/20 transition-colors duration-300">
                  <Icon className="w-5 h-5 text-navy-400" />
                </div>
                <h3 className="text-sm font-bold text-white mb-3">{v.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{v.description}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/5 backdrop-blur-sm border border-white/8 rounded-2xl p-8 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center"
        >
          {t.values.stats.map((s, i) => (
            <div key={i} className="relative">
              {i > 0 && (
                <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-8 bg-white/10" />
              )}
              <div className="text-3xl font-bold text-white mb-2">{s.value}</div>
              <div className="text-xs text-white/35 tracking-widest uppercase">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
