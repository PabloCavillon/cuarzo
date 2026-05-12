import type { Metadata } from "next";
import Link from "next/link";
import {
  Mail, MapPin, Globe,
  Code2, Database, Server, Layers, ArrowUpRight, ExternalLink,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Pablo Cavillon — Full-Stack Developer",
  description: "Desarrollador full-stack especializado en plataformas SaaS, integración con AFIP/ARCA y soluciones digitales para el ecosistema argentino.",
};

const STACK = [
  { label: "Frontend", Icon: Layers, items: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion"] },
  { label: "Backend",  Icon: Server, items: ["Node.js", "Prisma ORM", "PostgreSQL", "REST APIs", "SOAP (AFIP)"] },
  { label: "DevOps",   Icon: Code2,  items: ["Docker", "Vercel", "GitHub Actions", "Neon DB"] },
  { label: "Integraciones", Icon: Database, items: ["Mercado Pago", "ARCA / AFIP", "NextAuth.js", "Resend"] },
];

const EXPERIENCE = [
  {
    role: "Founder & Lead Developer",
    company: "Cuarzo",
    period: "2024 — presente",
    description:
      "Diseño y desarrollo de plataforma SaaS multi-tenant para PYMEs argentinas. Módulos: Bookings, Catalog, Stock, CRM, Facturación ARCA, Caja Digital y Suscripciones.",
    tags: ["Next.js 15", "Prisma", "PostgreSQL", "Mercado Pago", "AFIP/ARCA"],
  },
  {
    role: "Full-Stack Developer",
    company: "Proyectos freelance",
    period: "2022 — 2024",
    description:
      "Desarrollo de aplicaciones web para clientes en Argentina. Integración de sistemas de pagos, facturación electrónica y gestión de inventarios.",
    tags: ["React", "Node.js", "PostgreSQL", "TypeScript"],
  },
];

const PROJECTS = [
  {
    name: "Cuarzo Platform",
    description: "SaaS multi-tenant con 7 módulos: Bookings, Stock, Catalog, CRM, Billing ARCA, Caja y Suscripciones en USD.",
    href: "/",
    tags: ["Next.js", "Prisma", "AFIP", "Mercado Pago"],
  },
  {
    name: "Turnera Digital",
    description: "Sistema de reservas online con wizard multi-paso, confirmación por email y gestión de disponibilidad.",
    href: "/turnera",
    tags: ["Next.js", "PostgreSQL", "TypeScript"],
  },
];

function Tag({ label }: { label: string }) {
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-navy-800 text-navy-300 border border-navy-700">
      {label}
    </span>
  );
}

export default function CVPage() {
  return (
    <div className="min-h-screen bg-navy-950 text-white">
      {/* Top bar */}
      <div className="border-b border-white/8">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xs text-white/40 hover:text-white transition-colors">
            ← cuarzo.dev
          </Link>
          <a
            href="/cv/pablo-cavillon.pdf"
            className="text-xs text-white/40 hover:text-white transition-colors"
          >
            Descargar PDF
          </a>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        {/* Header */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-navy-800 border border-white/10 flex items-center justify-center text-2xl font-bold text-white mb-5">
                PC
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Pablo Cavillon</h1>
              <p className="text-white/60 text-lg mb-1">Full-Stack Developer · Founder @ Cuarzo</p>
              <div className="flex items-center gap-1.5 text-sm text-white/35">
                <MapPin className="w-3.5 h-3.5" />
                Buenos Aires, Argentina
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:items-end">
              <a
                href="mailto:pabloa.cavillon@gmail.com"
                className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                pabloa.cavillon@gmail.com
              </a>
              <a
                href="https://github.com/PabloCavillon"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                github.com/PabloCavillon
              </a>
              <a
                href="/"
                className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                cuarzo.dev
              </a>
            </div>
          </div>

          <p className="mt-8 text-white/55 leading-relaxed max-w-2xl">
            Desarrollador full-stack especializado en la construcción de plataformas SaaS para el ecosistema
            argentino. Experiencia en integración con AFIP/ARCA, Mercado Pago y sistemas de gestión
            empresarial. Enfocado en código limpio, arquitecturas escalables y UX de alta calidad.
          </p>
        </section>

        {/* Stack */}
        <section>
          <h2 className="text-xs font-semibold text-white/30 uppercase tracking-[0.2em] mb-6">Stack técnico</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STACK.map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/8 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <s.Icon className="w-4 h-4 text-white/40" />
                  <p className="text-xs font-semibold text-white/50">{s.label}</p>
                </div>
                <ul className="space-y-1.5">
                  {s.items.map((item) => (
                    <li key={item} className="text-sm text-white/70">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Experience */}
        <section>
          <h2 className="text-xs font-semibold text-white/30 uppercase tracking-[0.2em] mb-6">Experiencia</h2>
          <div className="space-y-6">
            {EXPERIENCE.map((e, i) => (
              <div key={i} className="relative pl-5 border-l border-white/10">
                <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-white/15 border border-white/25" />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                  <div>
                    <span className="text-sm font-bold text-white">{e.role}</span>
                    <span className="text-white/40 text-sm"> · {e.company}</span>
                  </div>
                  <span className="text-xs text-white/30">{e.period}</span>
                </div>
                <p className="text-sm text-white/50 leading-relaxed mb-3">{e.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {e.tags.map((tag) => <Tag key={tag} label={tag} />)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section>
          <h2 className="text-xs font-semibold text-white/30 uppercase tracking-[0.2em] mb-6">Proyectos destacados</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {PROJECTS.map((p, i) => (
              <Link
                key={i}
                href={p.href}
                className="group flex flex-col bg-white/5 border border-white/8 rounded-2xl p-6 hover:border-white/16 hover:bg-white/8 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-bold text-white">{p.name}</h3>
                  <ArrowUpRight className="w-4 h-4 text-white/30 group-hover:text-white transition-colors shrink-0" />
                </div>
                <p className="text-xs text-white/45 leading-relaxed flex-1 mb-4">{p.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {p.tags.map((tag) => <Tag key={tag} label={tag} />)}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="border-t border-white/8 pt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white mb-1">¿Tenés un proyecto en mente?</p>
            <p className="text-xs text-white/40">Respondemos en menos de 24 hs hábiles.</p>
          </div>
          <a
            href="mailto:pabloa.cavillon@gmail.com"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-navy-900 text-sm font-semibold rounded-full hover:bg-navy-100 transition-colors shrink-0"
          >
            <Mail className="w-4 h-4" />
            Escribir email
          </a>
        </section>
      </main>
    </div>
  );
}
