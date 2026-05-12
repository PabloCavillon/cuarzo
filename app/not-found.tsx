"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-24">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-navy-50 rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-navy-50 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="relative text-center max-w-lg w-full mx-auto">
        {/* 404 Number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative mb-8"
        >
          <span
            className="block text-[10rem] sm:text-[14rem] font-black leading-none tracking-tighter select-none"
            style={{
              background: "linear-gradient(135deg, #0b1e3d 0%, #1e4a8a 50%, #9fc0f0 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            404
          </span>
          {/* Subtle grid pattern behind number */}
          <div
            className="absolute inset-0 -z-10 opacity-5"
            style={{
              backgroundImage: "radial-gradient(circle, #0b1e3d 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-3 tracking-tight">
            Página no encontrada
          </h1>
          <p className="text-gray-400 text-base sm:text-lg leading-relaxed mb-10">
            La página que buscás no existe o fue movida.
            <br className="hidden sm:block" />
            Revisá la URL o volvé al inicio.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-700 transition-colors w-full sm:w-auto justify-center"
          >
            <Home className="w-4 h-4" />
            Volver al inicio
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-navy-900 border border-gray-200 rounded-xl text-sm font-semibold hover:border-navy-200 hover:bg-navy-50 transition-colors w-full sm:w-auto justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
            Página anterior
          </button>
        </motion.div>

        {/* Brand */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-xs text-gray-300 tracking-widest uppercase"
        >
          Cuarzo — Soluciones Digitales
        </motion.p>
      </div>
    </div>
  );
}
