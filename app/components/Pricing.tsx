"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, Zap } from "lucide-react";
import { useT } from "@/lib/i18n/provider";

const POPULAR_IDX = 2; // Pro

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const card = {
  hidden:   { opacity: 0, y: 32 },
  visible:  { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } },
};

export default function Pricing() {
  const t = useT();

  return (
    <section id="precios" className="py-16 sm:py-24 lg:py-32 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-navy-50 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16 lg:mb-20"
        >
          <span className="text-navy-600 text-xs font-semibold tracking-[0.2em] uppercase mb-4 block">
            {t.pricing.eyebrow}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-navy-900 tracking-tight mb-5">
            {t.pricing.heading}
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            {t.pricing.description}
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start"
        >
          {t.pricing.plans.map((plan, i) => {
            const isPopular = i === POPULAR_IDX;
            const isFree    = plan.price === "0";

            return (
              <motion.div
                key={i}
                variants={card}
                className={`relative flex flex-col rounded-2xl p-7 border transition-all duration-300 ${
                  isPopular
                    ? "bg-navy-900 border-navy-800 shadow-2xl shadow-navy-900/20 scale-[1.02]"
                    : "bg-white border-gray-100 hover:border-navy-200 hover:shadow-xl hover:shadow-navy-900/5"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="flex items-center gap-1 px-3 py-1 bg-white text-navy-900 text-[10px] font-bold rounded-full shadow-sm">
                      <Zap className="w-3 h-3" />
                      {t.pricing.popular}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`text-sm font-bold mb-3 ${isPopular ? "text-white" : "text-navy-900"}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    {isFree ? (
                      <span className={`text-3xl font-bold ${isPopular ? "text-white" : "text-navy-900"}`}>
                        {t.pricing.ctaFree.split(" ")[0]}
                      </span>
                    ) : (
                      <>
                        <span className={`text-xs font-semibold mt-1 ${isPopular ? "text-navy-400" : "text-gray-400"}`}>
                          USD
                        </span>
                        <span className={`text-3xl font-bold ${isPopular ? "text-white" : "text-navy-900"}`}>
                          ${plan.price}
                        </span>
                        <span className={`text-xs ${isPopular ? "text-navy-400" : "text-gray-400"}`}>
                          {t.pricing.monthly}
                        </span>
                      </>
                    )}
                  </div>
                  <p className={`text-[11px] mt-1 ${isPopular ? "text-navy-500" : "text-gray-300"}`}>
                    {plan.period}
                  </p>
                </div>

                <ul className="flex-1 space-y-2.5 mb-7">
                  {plan.features.map((f, j) => (
                    <li key={j} className={`flex items-start gap-2 text-xs leading-relaxed ${
                      isPopular ? "text-navy-300" : "text-gray-500"
                    }`}>
                      <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                        isPopular ? "text-navy-400" : "text-navy-600"
                      }`} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/register?plan=${plan.name.toLowerCase()}`}
                  className={`block text-center py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isPopular
                      ? "bg-white text-navy-900 hover:bg-navy-100"
                      : isFree
                        ? "bg-navy-900 text-white hover:bg-navy-700"
                        : "bg-navy-50 text-navy-900 border border-navy-100 hover:bg-navy-100"
                  }`}
                >
                  {isFree ? t.pricing.ctaFree : t.pricing.cta}
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center text-xs text-gray-300 mt-10"
        >
          Precios en USD · Facturación mensual · Cancelá en cualquier momento
        </motion.p>
      </div>
    </section>
  );
}
