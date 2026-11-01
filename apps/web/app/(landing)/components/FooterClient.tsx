"use client";

import Link from "next/link";
import { CuarzoIsotype } from "@/app/components/CuarzoLogo";
import { useT } from "@/lib/i18n/provider";

const COMPANY_HREFS: Record<string, string> = {
  "CV":        "/cv",
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

  const linkClass = "ink-2 text-base hover:text-(--ink) underline-offset-4 hover:underline";

  return (
    <div className="section pt-0! lg:pt-0! grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
      <div className="sm:col-span-2">
        <div className="flex items-center gap-3 mb-4">
          <CuarzoIsotype height={30} />
          <span className="subtitle tracking-[0.12em]">CUARZO</span>
        </div>
        <p className="ink-2 text-base max-w-xs">{t.footer.tagline}</p>
      </div>

      <div>
        <h4 className="font-semibold text-base mb-3">{t.footer.productHeading}</h4>
        <ul className="space-y-2">
          {t.footer.productLinks.map((item) => (
            <li key={item}>
              <a href="#servicios" className={linkClass}>{item}</a>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-base mb-3">{t.footer.companyHeading}</h4>
        <ul className="space-y-2">
          {t.footer.companyLinks.map((item) => {
            const href = COMPANY_HREFS[item] ?? "#";
            const isInternal = href.startsWith("/");
            return (
              <li key={item}>
                {isInternal ? (
                  <Link href={href} className={linkClass}>{item}</Link>
                ) : (
                  <a href={href} className={linkClass}>{item}</a>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="sm:col-span-2 lg:col-span-4 pt-6 border-t border-(--line) flex flex-col sm:flex-row justify-between gap-2 text-base ink-2">
        <p>{t.footer.copyright(year)}</p>
        <p>{t.footer.location}</p>
      </div>
    </div>
  );
}
