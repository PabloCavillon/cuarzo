import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Mail, MapPin, MessageCircle } from "lucide-react";
import { CuarzoIsotype } from "@/app/components/CuarzoLogo";
import Crystal from "../components/Crystal";
import ContactForm from "../components/ContactForm";
import { EMAIL, WHATSAPP_NUMBER, WHATSAPP_URL } from "@/lib/contact";
import { I18nProvider } from "@/lib/i18n/provider";

const external = { target: "_blank", rel: "noopener noreferrer" };
const tap = "inline-flex items-center min-h-11 pointer-fine:min-h-0";
type Partner = { name: string; href: string };

export function CVNav({ name, links, partner }: { name: string; links: { label: string; href: string }[]; partner: Partner }) {
  return (
    <header className="fixed top-0 inset-x-0 z-50 min-h-20 border-b border-(--line) bg-[rgba(9,11,16,0.75)] backdrop-blur-xl">
      <a href="#contenido" className="btn skip-link">Saltar al contenido</a>
      <div className="max-w-7xl min-h-20 mx-auto px-5 lg:px-10 flex flex-wrap items-center justify-between gap-x-4">
        <Link href="/" className="flex items-center gap-2.5 min-h-11" aria-label={`${name}, volver a Cuarzo`}>
          <CuarzoIsotype height={26} />
          <span className="subtitle uppercase tracking-tight">{name}</span>
        </Link>
        <nav className="flex items-center gap-8">
          <ul className="hidden lg:flex items-center gap-8">
            {links.map((link) => (
              <li key={link.href}><a href={link.href} className="ink-2 hover:text-(--accent) transition-colors">{link.label}</a></li>
            ))}
          </ul>
          <Link href={partner.href} className="btn min-h-11! px-5! whitespace-nowrap">CV de {partner.name}</Link>
        </nav>
      </div>
    </header>
  );
}

export function CVHero({ role, detail, location, links, children }: {
  role: string;
  detail: string;
  location: string;
  links: { label: string; href: string }[];
  children: ReactNode;
}) {
  const [first, ...rest] = role.split(" ");
  return (
    <section className="hero relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto min-h-svh px-5 lg:px-10 pt-32 pb-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="text-center md:text-left">
          <h1 className="display rise">
            <span><span>{first}</span></span>
            <span><span className="accent italic" style={{ animationDelay: "120ms" }}>{rest.join(" ")}</span></span>
          </h1>
          <p className="ink-2 text-xl lg:text-2xl mt-4 fade-in">{detail}</p>
          <p className="ink-2 mt-3 inline-flex items-center gap-2 fade-in">
            <MapPin className="w-4 h-4" aria-hidden />
            {location}
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-8 fade-in">
            {children}
            <a href="#contacto" className="btn btn-quiet">Contacto</a>
          </div>
          <ul className="flex flex-wrap justify-center md:justify-start gap-x-5 gap-y-1 mt-6 fade-in">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} {...external} className={`ink underline underline-offset-4 ${tap}`}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-center md:justify-end">
          <div className="cv-frame"><Crystal /></div>
        </div>
      </div>
    </section>
  );
}

function CVHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div data-reveal>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="title">{title}</h2>
    </div>
  );
}

export function CVAbout({ eyebrow, title, stats, children }: {
  eyebrow: string;
  title: string;
  stats: { value: string; label: string }[];
  children: ReactNode;
}) {
  return (
    <section id="sobre-mi" className="section scroll-mt-20 grid md:grid-cols-12 gap-6">
      <div className="md:col-span-4"><CVHeading eyebrow={eyebrow} title={title} /></div>
      <div className="md:col-span-8" data-reveal>
        <div className="ink-2 text-lg leading-7 space-y-4">{children}</div>
        <dl className="grid lg:grid-cols-3 gap-3 sm:gap-6 mt-8">
          {stats.map((s) => (
            <div key={s.label} className="glass flex flex-col-reverse text-center p-4 sm:p-6">
              <dt className="ink-2 text-xs uppercase tracking-widest mt-1">{s.label}</dt>
              <dd className="subtitle accent">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function CVSkills({ eyebrow, title, groups }: {
  eyebrow: string;
  title: string;
  groups: { label: string; Icon: ComponentType<{ className?: string }>; items: string[] }[];
}) {
  return (
    <section id="herramientas" className="layer scroll-mt-20">
      <div className="section">
        <CVHeading eyebrow={eyebrow} title={title} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 sm:[&>:last-child:nth-child(odd)]:col-span-2">
          {groups.map(({ label, Icon, items }) => (
            <div key={label} className="glass cv-card p-6" data-reveal>
              <Icon className="w-8 h-8 accent mb-4" />
              <h3 className="subtitle mb-3">{label}</h3>
              <ul className="flex flex-wrap gap-1.5">
                {items.map((item) => <li key={item} className="chip">{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CVWork({ id, eyebrow, title, link, children }: {
  id: string;
  eyebrow: string;
  title: string;
  link?: { label: string; href: string };
  children: ReactNode;
}) {
  return (
    <section id={id} className="section scroll-mt-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <CVHeading eyebrow={eyebrow} title={title} />
        {link && (
          <a href={link.href} {...external} className={`accent text-xs font-semibold uppercase tracking-widest gap-2 ${tap}`}>
            {link.label}
            <ArrowRight className="w-4 h-4" aria-hidden />
          </a>
        )}
      </div>
      <div className="grid md:grid-cols-2 gap-x-12 gap-y-14 mt-12 md:[&>:last-child:nth-child(odd)]:col-span-2 md:[&>:last-child:nth-child(odd)_.cv-media]:aspect-[32/9]">{children}</div>
    </section>
  );
}

export function CVWorkCard({ title, description, tag, href, children }: {
  title: string;
  description: string;
  tag?: string;
  href?: string;
  children: ReactNode;
}) {
  return (
    <article data-reveal>
      <div className="cv-media">
        {children}
        {tag && <span className="cv-tag">{tag}</span>}
      </div>
      <h3 className="subtitle mt-4">
        {href ? (
          <a href={href} {...external} className={`gap-2 hover:text-(--accent) transition-colors ${tap}`}>
            {title}
            <ArrowUpRight className="w-4 h-4" aria-hidden />
          </a>
        ) : title}
      </h3>
      <p className="ink-2 mt-1">{description}</p>
    </article>
  );
}

type TimelineItem = { title: string; meta: string; points?: string[] };

function CVTimeline({ title, items }: { title: string; items: TimelineItem[] }) {
  return (
    <div data-reveal>
      <h2 className="eyebrow mb-6!">{title}</h2>
      <ol className="cv-timeline">
        {items.map((item) => (
          <li key={item.title}>
            <h3 className="subtitle">{item.title}</h3>
            <p className="accent font-medium mt-1">{item.meta}</p>
            {item.points && (
              <ul className="ink-2 space-y-1 mt-3">
                {item.points.map((point) => <li key={point}>{point}</li>)}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function CVPath({ education, experience }: { education: TimelineItem[]; experience: TimelineItem[] }) {
  return (
    <section id="trayectoria" className="layer scroll-mt-20">
      <div className="section grid md:grid-cols-2 gap-14">
        <CVTimeline title="Formación" items={education} />
        <CVTimeline title="Experiencia" items={experience} />
      </div>
    </section>
  );
}

const iconBox = "w-12 h-12 shrink-0 rounded-2xl border border-(--line) grid place-items-center accent";

export function CVContact({ note, location, whatsapp }: { note?: string; location: string; whatsapp?: boolean }) {
  return (
    <section id="contacto" className="section scroll-mt-20">
      <div className="glass overflow-hidden grid lg:grid-cols-2" data-reveal>
        <div className="p-6 sm:p-10 lg:p-16 flex flex-col justify-between gap-10">
          <div>
            <p className="eyebrow">Contacto</p>
            <h2 className="title">¿Tenés un <span className="accent">proyecto</span> en mente?</h2>
            {note && <p className="ink-2 text-lg mt-4">{note}</p>}
          </div>
          <ul className="space-y-4">
            <li className="flex items-center gap-4">
              <span className={iconBox}><Mail className="w-5 h-5" aria-hidden /></span>
              <a href={`mailto:${EMAIL}`} className={`wrap-anywhere hover:text-(--accent) transition-colors ${tap}`}>{EMAIL}</a>
            </li>
            {whatsapp && (
              <li className="flex items-center gap-4">
                <span className={iconBox}><MessageCircle className="w-5 h-5" aria-hidden /></span>
                <a href={WHATSAPP_URL} {...external} className={`hover:text-(--accent) transition-colors ${tap}`}>+54 {WHATSAPP_NUMBER}</a>
              </li>
            )}
            <li className="flex items-center gap-4">
              <span className={iconBox}><MapPin className="w-5 h-5" aria-hidden /></span>
              {location}
            </li>
          </ul>
        </div>
        <div className="p-6 sm:p-10 lg:p-16 bg-(--raised)">
          {/* The CV is only in Spanish, whatever language the visitor picked on the landing. */}
          <I18nProvider initialLocale="es"><ContactForm /></I18nProvider>
        </div>
      </div>
    </section>
  );
}

export function CVFooter({ name, partner }: { name: string; partner: Partner }) {
  return (
    <footer className="border-t border-(--line)">
      <div className="max-w-7xl mx-auto px-5 lg:px-10 py-12 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="subtitle uppercase tracking-tight">{name}</span>
        <div className="flex gap-6">
          <Link href={partner.href} className={`ink-2 hover:text-(--accent) transition-colors ${tap}`}>CV de {partner.name}</Link>
          <Link href="/" className={`ink-2 hover:text-(--accent) transition-colors ${tap}`}>cuarzostudio.com</Link>
        </div>
      </div>
    </footer>
  );
}
