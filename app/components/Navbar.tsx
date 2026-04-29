"use client";

import { useState } from "react";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] backdrop-blur-2xl bg-[#050d1a]/60">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Wordmark */}
        <a href="#" className="flex items-center gap-2.5 group select-none">
          <svg
            className="w-3.25 h-4.5 text-blue-400 group-hover:text-blue-300 transition-colors shrink-0"
            viewBox="0 0 18 24"
            fill="none"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeLinecap="round"
          >
            <path d="M9,1 L17,7 L17,23 L1,23 L1,7 Z" strokeWidth="1.5" />
            <line x1="1" y1="7" x2="17" y2="7" strokeWidth="1" />
            <line x1="9" y1="1" x2="5" y2="7" strokeWidth="0.75" />
            <line x1="9" y1="1" x2="13" y2="7" strokeWidth="0.75" />
            <line x1="1" y1="13" x2="17" y2="13" strokeWidth="0.3" strokeDasharray="2 3" />
            <line x1="1" y1="18" x2="17" y2="18" strokeWidth="0.3" strokeDasharray="2 3" />
          </svg>
          <span className="text-white font-semibold text-lg tracking-wide">Cuarzo</span>
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          <a href="#servicios" className="hover:text-white transition-colors">Servicios</a>
          <a href="#trabajos" className="hover:text-white transition-colors">Trabajos</a>
          <a href="#contacto" className="hover:text-white transition-colors">Contacto</a>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="#contacto"
            className="text-sm px-4 py-2 md:px-5 rounded-full bg-blue-600 text-white hover:bg-blue-500 transition-all hover:shadow-lg hover:shadow-blue-600/25 font-medium"
          >
            Hablemos
          </a>
          <button
            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
          >
            {open ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/6 bg-[#050d1a]/95 backdrop-blur-xl px-6 py-5 flex flex-col gap-5">
          <a href="#servicios" onClick={close} className="text-sm text-slate-400 hover:text-white transition-colors">Servicios</a>
          <a href="#trabajos" onClick={close} className="text-sm text-slate-400 hover:text-white transition-colors">Trabajos</a>
          <a href="#contacto" onClick={close} className="text-sm text-slate-400 hover:text-white transition-colors">Contacto</a>
        </div>
      )}
    </nav>
  );
}
