"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Home, RefreshCw, AlertTriangle } from "lucide-react";
import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-24">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-50 rounded-full blur-3xl opacity-40" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-navy-50 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="relative text-center max-w-lg w-full mx-auto">
        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-navy-900 flex items-center justify-center shadow-2xl shadow-navy-900/25">
              <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 text-white" strokeWidth={1.5} />
            </div>
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-3xl border-2 border-navy-900/20 animate-ping" />
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-3 tracking-tight">
            Algo salió mal
          </h1>
          <p className="text-gray-400 text-base sm:text-lg leading-relaxed mb-4">
            Ocurrió un error inesperado. Podés intentar recargar
            <br className="hidden sm:block" />
            la página o volver al inicio.
          </p>

          {error.digest && (
            <p className="text-[11px] text-gray-300 font-mono bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 mb-8 inline-block">
              Error ID: {error.digest}
            </p>
          )}
          {!error.digest && <div className="mb-8" />}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-700 transition-colors w-full sm:w-auto justify-center"
          >
            <RefreshCw className="w-4 h-4" />
            Intentar de nuevo
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-navy-900 border border-gray-200 rounded-xl text-sm font-semibold hover:border-navy-200 hover:bg-navy-50 transition-colors w-full sm:w-auto justify-center"
          >
            <Home className="w-4 h-4" />
            Volver al inicio
          </Link>
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
