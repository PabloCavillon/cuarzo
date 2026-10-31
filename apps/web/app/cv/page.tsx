import type { Metadata } from "next";
import Link from "next/link";
import {
  Mail, MapPin, Globe, MessageCircle,
  Code2, Database, Server, Layers, Plug, Wrench, ArrowUpRight, ExternalLink,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Pablo Cavillon — Desarrollador Full Stack",
  description: "Desarrollador Full Stack freelance. Sistemas web a medida para pymes y emprendedores: e-commerce, sistemas de gestión, APIs y automatizaciones.",
};

const WHATSAPP = "https://wa.me/5491166565670";

const SERVICES = [
  { name: "E-commerce", description: "Catálogo, carrito, checkout con Mercado Pago y envíos con Andreani." },
  { name: "Sistemas de gestión a medida", description: "Stock, clientes, órdenes de trabajo, logística, roles y permisos." },
  { name: "APIs e integraciones", description: "Backend con Spring Boot o Node.js y conexión con sistemas existentes." },
  { name: "Automatizaciones", description: "Carga automática de datos, por ejemplo de adjuntos de correo a base de datos, controles y reportes." },
];

const STACK = [
  { label: "Backend", Icon: Server, items: ["Java (Spring Boot)", "Node.js (Express)", "PHP", "C#"] },
  { label: "Frontend", Icon: Layers, items: ["JavaScript", "React", "Next.js", "HTML", "CSS"] },
  { label: "Bases de datos", Icon: Database, items: ["MySQL", "PostgreSQL (Neon)", "MongoDB", "Prisma ORM"] },
  { label: "Integraciones", Icon: Plug, items: ["Mercado Pago", "Andreani", "Auth.js / Google OAuth"] },
  { label: "Infraestructura", Icon: Code2, items: ["Docker", "Vercel"] },
  { label: "Otros", Icon: Wrench, items: ["Python"] },
];

const EXPERIENCE = [
  {
    role: "Desarrollador",
    company: "Prisma Medios de Pago",
    period: "Dic 2018 — Actualidad",
    points: [
      "Desarrollo y mantenimiento de APIs con Spring Boot en el área de desarrollo de sistemas abiertos.",
      "Sistemas internos para detectar a tiempo desvíos en la operación diaria con bancos.",
      "Automatización de controles para reducir tiempos de revisión y riesgo de errores.",
      "Reportes e indicadores de performance sobre bases de datos.",
      "Trabajo junto a los equipos de Operaciones, Tecnología y Soporte.",
    ],
  },
  {
    role: "Fundador y desarrollador",
    company: "CuarzoStudio",
    period: "Actualidad",
    points: ["Estudio de desarrollo propio, en sociedad. Relevamiento, cotización, arquitectura y desarrollo de sistemas para clientes."],
  },
];

const PROJECTS: { name: string; description: string; href?: string; tags: string[] }[] = [
  {
    name: "Sistema de gestión logística",
    description: "Cinco módulos: entidades y legales, operativa logística, trazabilidad y calidad, administración y rentabilidad, y seguridad y roles. Incluye un portal para que los propietarios de camiones vean sus unidades e ingresos.",
    tags: ["CuarzoStudio"],
  },
  {
    name: "GLEEKCH",
    description: "E-commerce propio de remeras print-on-demand (DTF): catálogo, carrito, login con Google, checkout con Mercado Pago y envíos con Andreani.",
    href: "https://gleekch.vercel.app",
    tags: ["Next.js", "Prisma", "Neon", "Auth.js", "Zustand", "Vercel"],
  },
  {
    name: "API de control de archivos bancarios",
    description: "Control y conciliación de archivos bancarios, con un modelo MySQL de 57 tablas y un generador de datos de prueba en Python.",
    tags: ["MySQL", "Python"],
  },
  {
    name: "Cuarzo",
    description: "SaaS para negocios con turnos, catálogo, stock, pedidos, caja y facturación electrónica.",
    href: "/",
    tags: ["Next.js", "Prisma", "PostgreSQL", "Mercado Pago", "AFIP/ARCA"],
  },
];

const OTHER_PROJECTS = [
  "Lector de correos de Outlook que carga los adjuntos en una base de datos (Java).",
  "Backend con Spring Boot, MySQL y Docker, con autenticación JWT.",
  "Sistema de gestión de stock, técnicos y órdenes de trabajo (MySQL).",
  "Zenda, un explorador educativo de animales (Node.js, Express, MongoDB).",
];

function Tag({ label }: { label: string }) {
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-navy-800 text-navy-300 border border-navy-700">
      {label}
    </span>
  );
}

const sectionTitle = "text-xs font-semibold text-white/30 uppercase tracking-[0.2em] mb-6";
const contactLink = "flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors";

export default function CVPage() {
  return (
    <div className="min-h-screen bg-navy-950 text-white">
      {/* Top bar */}
      <div className="border-b border-white/8">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/" className="text-xs text-white/40 hover:text-white transition-colors">
            ← cuarzostudio.com
          </Link>
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
              <p className="text-white/60 text-lg mb-1">Desarrollador Full Stack freelance</p>
              <p className="text-white/40 text-sm mb-2">Java (Spring Boot) · Node.js · React / Next.js</p>
              <div className="flex items-center gap-1.5 text-sm text-white/35">
                <MapPin className="w-3.5 h-3.5" />
                Mendoza, Argentina · Trabajo remoto
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:items-end">
              <a href="mailto:contacto@cuarzostudio.com" className={contactLink}>
                <Mail className="w-3.5 h-3.5" />
                contacto@cuarzostudio.com
              </a>
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className={contactLink}>
                <MessageCircle className="w-3.5 h-3.5" />
                +54 11 6656-5670
              </a>
              <a href="https://linkedin.com/in/pablo-cavillon/" target="_blank" rel="noopener noreferrer" className={contactLink}>
                <ExternalLink className="w-3.5 h-3.5" />
                linkedin.com/in/pablo-cavillon
              </a>
              <a href="https://github.com/PabloCavillon" target="_blank" rel="noopener noreferrer" className={contactLink}>
                <ExternalLink className="w-3.5 h-3.5" />
                github.com/PabloCavillon
              </a>
              <Link href="/" className={contactLink}>
                <Globe className="w-3.5 h-3.5" />
                cuarzostudio.com
              </Link>
            </div>
          </div>

          <div className="mt-8 space-y-4 text-white/55 leading-relaxed max-w-2xl">
            <p>
              Desarrollo sistemas web a medida para pymes y emprendedores: tiendas online con cobro por
              Mercado Pago, sistemas de gestión con roles y permisos, APIs e integraciones, y automatizaciones
              de procesos. Me encargo del proyecto completo, desde el relevamiento y la cotización hasta el deploy.
            </p>
            <p>
              Además, desde diciembre de 2018 trabajo como desarrollador en Prisma Medios de Pago, en sistemas
              que procesan la operación diaria con bancos.
            </p>
          </div>
        </section>

        {/* Services */}
        <section>
          <h2 className={sectionTitle}>Servicios</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {SERVICES.map((s) => (
              <div key={s.name} className="bg-white/5 border border-white/8 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white mb-2">{s.name}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section>
          <h2 className={sectionTitle}>Proyectos</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {PROJECTS.map((p) => {
              const Box = p.href ? "a" : "div";
              const external = p.href?.startsWith("http");
              return (
                <Box
                  key={p.name}
                  {...(p.href ? { href: p.href } : {})}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={`group flex flex-col bg-white/5 border border-white/8 rounded-2xl p-6 transition-all ${p.href ? "hover:border-white/16 hover:bg-white/8" : ""}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-sm font-bold text-white">{p.name}</h3>
                    {p.href && <ArrowUpRight className="w-4 h-4 text-white/30 group-hover:text-white transition-colors shrink-0" />}
                  </div>
                  <p className="text-sm text-white/50 leading-relaxed flex-1 mb-4">{p.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.tags.map((tag) => <Tag key={tag} label={tag} />)}
                  </div>
                </Box>
              );
            })}
          </div>

          <h3 className="text-sm font-semibold text-white/70 mt-8 mb-3">Otros proyectos</h3>
          <ul className="space-y-1.5 text-sm text-white/50 leading-relaxed">
            {OTHER_PROJECTS.map((p) => <li key={p}>{p}</li>)}
          </ul>
        </section>

        {/* Experience */}
        <section>
          <h2 className={sectionTitle}>Experiencia</h2>
          <div className="space-y-6">
            {EXPERIENCE.map((e) => (
              <div key={e.company} className="relative pl-5 border-l border-white/10">
                <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-white/15 border border-white/25" />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                  <div>
                    <span className="text-sm font-bold text-white">{e.role}</span>
                    <span className="text-white/40 text-sm"> · {e.company}</span>
                  </div>
                  <span className="text-xs text-white/30">{e.period}</span>
                </div>
                <ul className="space-y-1.5 text-sm text-white/50 leading-relaxed">
                  {e.points.map((point) => <li key={point}>{point}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Stack */}
        <section>
          <h2 className={sectionTitle}>Tecnologías</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

        {/* Education and languages */}
        <section className="grid sm:grid-cols-2 gap-10">
          <div>
            <h2 className={sectionTitle}>Formación</h2>
            <p className="text-sm font-bold text-white">Ingeniero en Informática</p>
            <p className="text-sm text-white/50">Universidad de Belgrano, Buenos Aires · 2020</p>
          </div>
          <div>
            <h2 className={sectionTitle}>Idiomas</h2>
            <p className="text-sm text-white/70">Español nativo · Inglés B1 (en curso)</p>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="border-t border-white/8 pt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white mb-1">¿Tenés un proyecto en mente?</p>
            <p className="text-xs text-white/40">Respondo en menos de 24 hs hábiles.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-navy-900 text-sm font-semibold rounded-full hover:bg-navy-100 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Escribir por WhatsApp
            </a>
            <a
              href="mailto:contacto@cuarzostudio.com"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-white/20 text-white text-sm font-semibold rounded-full hover:bg-white/8 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Escribir email
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
