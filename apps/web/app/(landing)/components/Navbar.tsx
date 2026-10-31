"use client";

import { useState, useEffect } from "react";
import { Menu, X, Globe } from "lucide-react";
import Link from "next/link";
import { CuarzoIsotype } from "@/app/components/CuarzoLogo";
import { useT, useLocale, useSetLocale } from "@/lib/i18n/provider";
import { locales, localeLabels } from "@/lib/i18n";

export default function Navbar() {
  const t = useT();
  const locale = useLocale();
  const setLocale = useSetLocale();

  const [open, setOpen]         = useState(false);
  const [langOpen, setLangOpen] = useState(false);

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
    { label: t.nav.custom,   href: "#a-medida"  },
    { label: t.nav.contact,  href: "#contacto"  },
  ];

  return (
    <header className="fixed top-3 inset-x-3 z-50">
      <div className="max-w-7xl mx-auto rounded-4xl bg-white border border-(--line) text-(--ink)">
        <div className="flex items-center justify-between gap-4 h-14 pl-5 pr-2">
          <a href="#inicio" className="flex items-center gap-2.5">
            <CuarzoIsotype height={28} />
            <span className="subtitle tracking-[0.12em] text-xl!">CUARZO</span>
          </a>

          <nav className="hidden xl:flex items-center gap-7">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-base whitespace-nowrap hover:text-(--blue) transition-colors">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden xl:flex items-center gap-1">
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setLangOpen((v) => !v)}
                aria-expanded={langOpen}
                className="flex items-center gap-1.5 px-3 py-2 text-base"
                aria-label="Change language"
              >
                <Globe className="w-4 h-4" aria-hidden />
                {locale.toUpperCase()}
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-2 min-w-36 rounded-2xl overflow-hidden bg-white border border-(--line)">
                  {locales.map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLocale(l); setLangOpen(false); }}
                      className={`block w-full text-left px-4 py-2.5 text-base hover:text-(--blue) ${l === locale ? "font-semibold" : ""}`}
                    >
                      {localeLabels[l]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Link href="/login" className="px-3 py-2 text-base whitespace-nowrap hover:text-(--blue) transition-colors">{t.nav.login}</Link>
            <Link href="/register" className="btn min-h-10! py-2! px-5! whitespace-nowrap">{t.nav.start}</Link>
          </div>

          <button
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            className="xl:hidden flex items-center justify-center w-11 h-11"
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {open && (
          <div className="xl:hidden px-5 pb-5 max-h-[calc(100svh-6rem)] overflow-y-auto">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="block py-2.5">
                {link.label}
              </a>
            ))}

            <div className="flex gap-2 pt-3">
              {locales.map((l) => (
                <button
                  key={l}
                  onClick={() => { setLocale(l); setOpen(false); }}
                  className={`px-3 py-1.5 text-base ${l === locale ? "font-semibold text-(--blue)" : ""}`}
                >
                  {localeLabels[l]}
                </button>
              ))}
            </div>

            <div className="grid gap-2 mt-4">
              <Link href="/login" onClick={() => setOpen(false)} className="btn btn-quiet">{t.nav.login}</Link>
              <Link href="/register" onClick={() => setOpen(false)} className="btn">{t.nav.start}</Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
