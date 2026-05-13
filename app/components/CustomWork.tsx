"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useT } from "@/lib/i18n/provider";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const card = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } },
};

export default function CustomWork() {
  const t = useT();

  return (
    <section className="py-16 sm:py-24 bg-navy-950 relative overflow-hidden">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Glow accent */}
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-navy-700/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 sm:mb-16"
        >
          <span className="text-navy-400 text-xs font-semibold tracking-[0.2em] uppercase mb-4 block">
            {t.customWork.eyebrow}
          </span>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
                {t.customWork.heading}
              </h2>
              <p className="text-white/45 text-base sm:text-lg max-w-xl leading-relaxed">
                {t.customWork.description}
              </p>
            </div>
            <a
              href="#contacto"
              className="inline-flex items-center gap-2 bg-white text-navy-900 font-semibold px-6 py-3.5 rounded-full hover:bg-navy-100 transition-all group shrink-0 self-start sm:self-auto text-sm"
            >
              {t.customWork.cta}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {t.customWork.items.map((item, i) => (
            <motion.div
              key={i}
              variants={card}
              className="bg-white/5 border border-white/8 rounded-2xl p-6 flex flex-col gap-4 hover:bg-white/8 hover:border-white/14 transition-all duration-300"
            >
              <span className="text-3xl">{item.icon}</span>

              <div>
                <h3 className="text-sm font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-white/45 leading-relaxed">{item.description}</p>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-medium text-navy-400 bg-navy-800/60 border border-navy-700/40 px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
