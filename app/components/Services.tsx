"use client";

import { motion } from "framer-motion";
import { Package, Calendar, FileText, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useT } from "@/lib/i18n/provider";

const ICONS = [Package, Calendar, FileText, ShoppingBag];
const HREFS = ["/register", "/turnera", "/register", "/register"];
const TURNERA_IDX = 1;

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const card = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

export default function Services() {
  const t = useT();

  return (
    <section id="servicios" className="py-16 sm:py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16 lg:mb-20"
        >
          <span className="text-navy-600 text-xs font-semibold tracking-[0.2em] uppercase mb-4 block">
            {t.services.eyebrow}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-navy-900 tracking-tight mb-5">
            {t.services.heading}
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            {t.services.description}
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {t.services.items.map((s, i) => {
            const Icon = ICONS[i];
            const isTurnera = i === TURNERA_IDX;
            const ctaLabel = isTurnera ? t.services.cta : t.pricing.cta;
            return (
              <motion.div
                key={i}
                variants={card}
                className="group relative bg-white border border-gray-100 rounded-2xl p-8 hover:border-navy-200 hover:shadow-xl hover:shadow-navy-900/5 transition-all duration-300 cursor-default overflow-hidden"
              >
                <span className="inline-block text-xs font-semibold text-navy-600 bg-navy-50 px-3 py-1 rounded-full mb-6">
                  {s.tag}
                </span>
                <div className="w-12 h-12 bg-navy-900 rounded-xl flex items-center justify-center mb-6 group-hover:bg-navy-700 transition-colors duration-300">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-navy-900 mb-3">{s.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-4">{s.description}</p>

                <Link
                  href={HREFS[i]}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-600 hover:text-navy-900 transition-colors group/link"
                  onClick={(e) => e.stopPropagation()}
                >
                  {ctaLabel}
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5" />
                </Link>

                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-navy-700 to-navy-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
