"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X, Globe } from "lucide-react";
import { CuarzoIsotype } from "@/app/components/CuarzoLogo";
import { useT, useLocale, useSetLocale } from "@/lib/i18n/provider";
import { locales, localeLabels } from "@/lib/i18n";

export default function Navbar() {
  const t = useT();
  const locale = useLocale();
  const setLocale = useSetLocale();

  const [open, setOpen]         = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const langButton = useRef<HTMLButtonElement>(null);

  // Close lang dropdown when clicking outside
  useEffect(() => {
    if (!langOpen) return;
    const close = () => setLangOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [langOpen]);

  // Esc closes whatever is open and gives focus back to the button that opened it.
  useEffect(() => {
    if (!open && !langOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      setLangOpen(false);
      (langOpen ? langButton : menuButton).current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, langOpen]);

  const navLinks = [
    { label: t.nav.services, href: "#servicios" },
    { label: t.nav.whyUs,    href: "#propuesta" },
    { label: t.nav.custom,   href: "#a-medida"  },
  ];

  return (
    <header className="fixed top-3 inset-x-3 z-50">
      <a href="#contenido" className="btn skip-link">{t.nav.skip}</a>
      <div className="glass rounded-xl! max-w-360 mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-x-2 min-h-14 pl-4 pr-2">
          <a href="#inicio" className="flex items-center gap-2.5 min-h-11">
            <CuarzoIsotype height={28} />
            <span className="subtitle tracking-[0.14em] text-lg!">CUARZO</span>
          </a>

          <nav className="hidden xl:flex items-center gap-7">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-[0.9375rem] whitespace-nowrap hover:text-(--accent) transition-colors">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <div className="relative hidden xl:block" onClick={(e) => e.stopPropagation()}>
              <button
                ref={langButton}
                onClick={() => setLangOpen((v) => !v)}
                aria-expanded={langOpen}
                className="flex items-center gap-1.5 px-3 min-h-11 text-[0.9375rem]"
                aria-label={t.nav.language}
              >
                <Globe className="w-4 h-4" aria-hidden />
                {locale.toUpperCase()}
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-2 min-w-36 glass overflow-hidden bg-(--raised)!">
                  {locales.map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLocale(l); setLangOpen(false); }}
                      aria-current={l === locale}
                      className={`block w-full text-left px-4 py-2.5 text-[0.9375rem] hover:text-(--accent) ${l === locale ? "font-semibold" : ""}`}
                    >
                      {localeLabels[l]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <a href="#contacto" onClick={() => setOpen(false)} className="btn px-4! whitespace-nowrap">{t.nav.start}</a>

            <button
              ref={menuButton}
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              className="xl:hidden flex items-center justify-center w-11 h-11"
              aria-label={t.nav.menu}
            >
              {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
            </button>
          </div>
        </div>

        {open && (
          <div className="xl:hidden px-5 pb-4 max-h-[calc(100svh-6rem)] overflow-y-auto">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="block py-3">
                {link.label}
              </a>
            ))}

            <div className="flex flex-wrap gap-2 pt-2 -ml-3">
              {locales.map((l) => (
                <button
                  key={l}
                  onClick={() => { setLocale(l); setOpen(false); }}
                  aria-current={l === locale}
                  className={`px-3 min-h-11 text-[0.9375rem] ${l === locale ? "font-semibold text-(--accent)" : ""}`}
                >
                  {localeLabels[l]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
