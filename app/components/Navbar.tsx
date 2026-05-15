"use client";

import { useState, useEffect } from "react";
import { Menu, X, Globe } from "lucide-react";
import Link from "next/link";
import { CuarzoIsotype } from "./CuarzoLogo";
import { useT, useLocale, useSetLocale } from "@/lib/i18n/provider";
import { locales, localeLabels } from "@/lib/i18n";

export default function Navbar() {
  const t = useT();
  const locale = useLocale();
  const setLocale = useSetLocale();

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close lang dropdown when clicking outside
  useEffect(() => {
    if (!langOpen) return;
    const close = () => setLangOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [langOpen]);

  const navLinks = [
    { label: t.nav.services, href: "#servicios" },
    { label: t.nav.whyUs,    href: "#propuesta" },
    { label: t.nav.pricing,  href: "#precios"   },
    { label: t.nav.contact,  href: "#contacto"  },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-navy-950/80 backdrop-blur-2xl border-b border-white/8 shadow-lg shadow-black/30"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="#inicio" className="flex items-center gap-3">
            <CuarzoIsotype height={34} />
            <span className="text-lg font-bold tracking-[0.2em] text-white">CUARZO</span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-white/70 hover:text-white transition-colors tracking-wide"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop right: lang switcher + CTA */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language switcher */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setLangOpen((v) => !v)}
                className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs font-medium transition-colors px-2 py-1.5 rounded-lg hover:bg-white/10"
                aria-label="Change language"
              >
                <Globe className="w-3.5 h-3.5" />
                {locale.toUpperCase()}
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-2 bg-navy-950/95 backdrop-blur border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 min-w-32.5">
                  {locales.map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLocale(l); setLangOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${
                        l === locale
                          ? "text-white bg-white/10"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {localeLabels[l]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/login"
              className="inline-flex items-center text-white/70 hover:text-white text-sm font-medium px-4 py-2.5 rounded-full hover:bg-white/10 transition-colors"
            >
              {t.nav.login}
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center bg-white text-navy-900 text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-navy-50 transition-colors"
            >
              {t.nav.start}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-white p-2 -mr-2"
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-navy-950/98 backdrop-blur-md border-t border-white/10">
          <div className="px-6 py-5 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block text-white/70 hover:text-white py-3 text-sm transition-colors"
              >
                {link.label}
              </a>
            ))}

            {/* Mobile lang switcher */}
            <div className="flex gap-2 pt-3">
              {locales.map((l) => (
                <button
                  key={l}
                  onClick={() => { setLocale(l); setOpen(false); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    l === locale
                      ? "bg-white/20 text-white"
                      : "text-white/40 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {localeLabels[l]}
                </button>
              ))}
            </div>

            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="block border border-white/20 text-white/80 font-medium text-center px-5 py-3 rounded-full mt-4 text-sm hover:bg-white/10 transition-colors"
            >
              {t.nav.login}
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="block bg-white text-navy-900 font-semibold text-center px-5 py-3 rounded-full mt-2 text-sm"
            >
              {t.nav.start}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
