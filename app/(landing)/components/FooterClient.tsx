"use client";

import { CuarzoIsotype } from "@/app/components/CuarzoLogo";
import { useT } from "@/lib/i18n/provider";

const COMPANY_HREFS: Record<string, string> = {
  "CV":        "#equipo",
  "Sobre nosotros": "#equipo",
  "About us":  "#equipo",
  "Sobre nós": "#equipo",
  "Contato":   "#contacto",
  "Contact":   "#contacto",
  "Contacto":  "#contacto",
};

export default function FooterClient() {
  const t = useT();
  const year = new Date().getFullYear();

  const linkClass = "ink-2 hover:text-(--ink) underline-offset-4 hover:underline inline-flex items-center min-h-11 pointer-fine:min-h-0";

  return (
    <div className="section pb-10! grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
      <div className="sm:col-span-2">
        <div className="flex items-center gap-3 mb-4">
          <CuarzoIsotype height={30} />
          <span className="subtitle tracking-[0.14em]">CUARZO</span>
        </div>
        <p className="ink-2 max-w-xs">{t.footer.tagline}</p>
      </div>

      <div>
        <h3 className="mono ink-2 mb-3">{t.footer.productHeading}</h3>
        <ul className="pointer-fine:space-y-2">
          {t.footer.productLinks.map((item) => (
            <li key={item}>
              <a href="#servicios" className={linkClass}>{item}</a>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mono ink-2 mb-3">{t.footer.companyHeading}</h3>
        <ul className="pointer-fine:space-y-2">
          {t.footer.companyLinks.map((item) => (
            <li key={item}>
              <a href={COMPANY_HREFS[item] ?? "#"} className={linkClass}>{item}</a>
            </li>
          ))}
        </ul>
      </div>

      <div className="sm:col-span-2 lg:col-span-4 pt-6 border-t border-(--line) flex flex-col sm:flex-row justify-between gap-2 mono ink-2">
        <p>{t.footer.copyright(year)}</p>
        <p>{t.footer.location}</p>
      </div>
    </div>
  );
}
