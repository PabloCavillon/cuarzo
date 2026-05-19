"use client";

import Link from "next/link";
import { CuarzoIsotype } from "@/app/components/CuarzoLogo";
import { useT } from "@/lib/i18n/provider";

const COMPANY_HREFS: Record<string, string> = {
  "Portfolio": "#portfolio",
  "CV":        "/cv",
  "Sobre nosotros": "#propuesta",
  "About us":  "#propuesta",
  "Sobre nós": "#propuesta",
  "Contato":   "#contacto",
  "Contact":   "#contacto",
  "Contacto":  "#contacto",
};

export default function FooterClient() {
  const t = useT();
  const year = new Date().getFullYear();

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
        <div className="sm:col-span-2 lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <CuarzoIsotype height={30} />
            <span className="text-base font-bold tracking-[0.2em] text-white">CUARZO</span>
          </div>
          <p className="text-white/35 text-sm leading-relaxed max-w-xs">{t.footer.tagline}</p>
        </div>

        <div>
          <h4 className="text-white text-xs font-semibold tracking-[0.2em] uppercase mb-5">
            {t.footer.productHeading}
          </h4>
          <ul className="space-y-3">
            {t.footer.productLinks.map((item) => (
              <li key={item}>
                <a href="#servicios" className="text-white/35 text-sm hover:text-white/70 transition-colors">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white text-xs font-semibold tracking-[0.2em] uppercase mb-5">
            {t.footer.companyHeading}
          </h4>
          <ul className="space-y-3">
            {t.footer.companyLinks.map((item) => {
              const href = COMPANY_HREFS[item] ?? "#";
              const isInternal = href.startsWith("/");
              return (
                <li key={item}>
                  {isInternal ? (
                    <Link href={href} className="text-white/35 text-sm hover:text-white/70 transition-colors">
                      {item}
                    </Link>
                  ) : (
                    <a href={href} className="text-white/35 text-sm hover:text-white/70 transition-colors">
                      {item}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="border-t border-navy-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <p className="text-white/25 text-xs">{t.footer.copyright(year)}</p>
        <p className="text-white/20 text-xs tracking-[0.2em] uppercase">{t.footer.location}</p>
      </div>
    </div>
  );
}
