import Image from "next/image";
import { LeadForm } from "@/components/LeadForm";
import { Navbar } from "@/components/Navbar";
import { HeroBackground } from "@/components/HeroBackground";

// ── Structured data ──────────────────────────────────────────────────────────

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cuarzo.dev";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfessionalService",
      "@id": `${siteUrl}/#organization`,
      name: "Cuarzo",
      description: "Desarrollo web y diseño de marca a medida para pequeños negocios.",
      url: siteUrl,
      founder: {
        "@type": "Person",
        name: "Pablo Cavillon",
        sameAs: "https://www.linkedin.com/in/pablo-cavillon/",
      },
      areaServed: { "@type": "Country", name: "Argentina" },
      serviceType: ["Desarrollo Web", "Diseño de Marca", "E-commerce"],
      knowsLanguage: "es",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Servicios Cuarzo",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Desarrollo Web",
              description: "Landing pages, tiendas online y sitios institucionales a medida.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Diseño de Marca",
              description: "Logotipo, identidad visual completa y material gráfico digital.",
            },
          },
        ],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Cuarzo",
      description: "Desarrollo web y diseño de marca a medida para pequeños negocios.",
      inLanguage: "es",
    },
  ],
};

// ── Data ─────────────────────────────────────────────────────────────────────

const projects = [
  {
    name: "Projaska",
    url: "https://projaska.com",
    category: "E-commerce · Tecnología y Seguridad",
    tagline: "Tienda online de tecnología y seguridad para profesionales",
    description:
      "Plataforma de e-commerce completa para una empresa especializada en equipamiento de seguridad: cámaras, DVRs, alarmas, cerraduras y más. Pensada para que los profesionales del rubro encuentren y compren rápido.",
    highlights: [
      "Catálogo con cámaras, DVRs, XVR, switches y accesorios",
      "Carrito de compras y gestión de stock en tiempo real",
      "Panel de administración para carga de productos",
      "Optimizado para SEO y velocidad de carga",
    ],
    tags: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "Tailwind CSS"],
    screenshot: "/screenshots/projaska.png",
  },
  {
    name: "Hermanas Baking",
    url: "https://hermanas-baking.vercel.app",
    category: "E-commerce · Gastronomía Artesanal",
    tagline: "Cookies y tortas artesanales por encargo · Córdoba, Argentina",
    description:
      "Tienda online y plataforma de pedidos para un emprendimiento de repostería artesanal en Córdoba. Diseño que transmite calidez, artesanía y calidad — y que convierte visitas en pedidos por WhatsApp.",
    highlights: [
      "Catálogo de productos con fotos y precios",
      "Carrito de compras y pedido directo por WhatsApp",
      "Sistema de promociones y destacados",
      "Identidad visual y diseño de marca completo",
    ],
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "Diseño de Marca"],
    screenshot: "/screenshots/hermanas-baking.png",
    reversed: true,
  },
];

const services = [
  {
    title: "Desarrollo Web",
    description:
      "Sitios web modernos y rápidos, construidos a medida para tu negocio. Landing pages, tiendas online, portfolios y más.",
    icon: () => (
      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    items: ["Landing pages de alta conversión", "Tiendas online y catálogos", "Sitios institucionales"],
  },
  {
    title: "Diseño de Marca",
    description:
      "Identidad visual profesional que refleja la esencia de tu negocio. Logos, paletas de color, tipografías y guías de estilo.",
    icon: () => (
      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    items: ["Diseño de logotipo", "Identidad visual completa", "Material gráfico digital"],
  },
];

const stats = [
  { value: "100%", label: "A medida", sub: "Sin templates. Cada proyecto, único desde cero." },
  { value: "Ágil", label: "Entrega rápida", sub: "Plazos acordados y comunicación directa." },
  { value: "∞", label: "Soporte continuo", sub: "Acompaño a mi cliente más allá del lanzamiento." },
];

// ── Components ───────────────────────────────────────────────────────────────

function CrystalMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 18 24" fill="none" stroke="currentColor" strokeLinejoin="round" strokeLinecap="round">
      <path d="M9,1 L17,7 L17,23 L1,23 L1,7 Z" strokeWidth="1.5" />
      <line x1="1" y1="7" x2="17" y2="7" strokeWidth="1" />
      <line x1="9" y1="1" x2="5" y2="7" strokeWidth="0.75" />
      <line x1="9" y1="1" x2="13" y2="7" strokeWidth="0.75" />
      <line x1="1" y1="13" x2="17" y2="13" strokeWidth="0.3" strokeDasharray="2 3" />
      <line x1="1" y1="18" x2="17" y2="18" strokeWidth="0.3" strokeDasharray="2 3" />
    </svg>
  );
}

function SectionHeader({ label, title, subtitle }: { label: string; title: string; subtitle?: string }) {
  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <CrystalMark className="w-3 h-[15px] text-blue-500 shrink-0" />
        <p className="text-blue-400 text-xs font-medium tracking-[0.3em] uppercase">{label}</p>
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{title}</h2>
      {subtitle && <p className="text-slate-400 mt-3 max-w-xl leading-relaxed">{subtitle}</p>}
    </>
  );
}

function HeroVisual() {
  return (
    <div className="relative hidden lg:block w-[380px] xl:w-[420px] shrink-0 self-center">
      {/* Ambient glow behind the card */}
      <div className="absolute -inset-10 bg-blue-600/10 rounded-[40px] blur-3xl pointer-events-none" />

      {/* Tech stack chip — top left */}
      <div className="absolute -top-4 -left-6 z-10 backdrop-blur-xl bg-[#0a1628]/85 border border-blue-500/25 rounded-xl px-3.5 py-2 shadow-xl flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
        <span className="text-[11px] text-blue-300 font-medium whitespace-nowrap">Next.js · TypeScript · Prisma</span>
      </div>

      {/* Glass browser card */}
      <div className="relative backdrop-blur-xl bg-white/[0.05] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-blue-950/60">
        {/* Browser chrome */}
        <div className="bg-white/[0.04] px-4 py-2.5 border-b border-white/8 flex items-center gap-2.5">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          </div>
          <div className="flex-1 bg-black/30 rounded-md px-2.5 py-1 text-[11px] text-slate-500 font-mono">
            projaska.com
          </div>
        </div>
        {/* Screenshot */}
        <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
          <Image
            src="/screenshots/projaska.png"
            alt="Projaska — e-commerce de tecnología y seguridad"
            fill
            className="object-cover object-top"
            sizes="420px"
          />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#050d1a]/80 to-transparent" />
        </div>
      </div>

      {/* Live chip — bottom right */}
      <div className="absolute -bottom-4 -right-5 z-10 backdrop-blur-xl bg-[#0a1628]/85 border border-white/12 rounded-xl px-4 py-2.5 shadow-xl flex items-center gap-2.5">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
        <div>
          <p className="text-white text-xs font-semibold leading-tight">En producción</p>
          <p className="text-slate-500 text-[10px]">Projaska · E-commerce</p>
        </div>
      </div>
    </div>
  );
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] rounded-2xl shadow-xl shadow-blue-950/30 hover:bg-white/[0.06] hover:border-blue-500/20 hover:shadow-blue-500/10 transition-all duration-400 ${className}`}
    >
      {children}
    </div>
  );
}

function BrowserMockup({ screenshot, url, title }: { screenshot: string; url: string; title: string }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-blue-950/60 group-hover:border-blue-500/25 group-hover:shadow-blue-600/10 transition-all duration-500">
      <div className="bg-white/[0.04] px-3 md:px-4 py-3 flex items-center gap-2 md:gap-3 border-b border-white/6">
        <div className="flex gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500/60" />
          <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-400/60" />
          <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500/60" />
        </div>
        <div className="flex-1 bg-black/25 rounded-md px-3 py-1.5 text-xs text-slate-500 font-mono truncate min-w-0">
          {new URL(url).hostname}
        </div>
        <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
      <div className="relative w-full overflow-hidden bg-[#050d1a]" style={{ aspectRatio: "16/10" }}>
        <Image
          src={screenshot}
          alt={`${title} — previsualización del sitio`}
          fill
          className="object-cover object-top"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 58vw"
        />
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      <main>
        {/* ── Hero ── */}
        <section className="relative min-h-screen flex items-center bg-[#050d1a] overflow-hidden pt-16">
          <HeroBackground />

          <div className="relative w-full max-w-6xl mx-auto px-6 py-20 md:py-28 flex flex-col lg:flex-row items-center gap-14 lg:gap-16">
            {/* Left: text */}
            <div className="flex-1 min-w-0">
              {/* Availability badge */}
              <div className="inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 mb-8 border border-blue-500/20 bg-blue-500/8 text-xs text-blue-300 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shrink-0" />
                Disponible para nuevos proyectos
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6 md:mb-8">
                Tu negocio,{" "}
                <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-[linear-gradient(135deg,#93c5fd_0%,#3b82f6_50%,#1d4ed8_100%)]">
                  digitalizado
                </span>{" "}
                con elegancia.
              </h1>

              <p className="text-base md:text-lg text-slate-400 max-w-xl mb-10 leading-relaxed">
                Desarrollo web y diseño de marca a medida para pequeños negocios que
                quieren destacar en el mundo digital.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#contacto"
                  className="px-8 py-4 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-500 transition-all hover:shadow-xl hover:shadow-blue-600/30 text-center text-sm"
                >
                  Empezar un proyecto
                </a>
                <a
                  href="#trabajos"
                  className="px-8 py-4 backdrop-blur-sm bg-white/5 border border-white/10 text-white rounded-full font-medium hover:border-white/20 hover:bg-white/8 transition-all text-center text-sm"
                >
                  Ver trabajos
                </a>
              </div>
            </div>

            {/* Right: floating glass visual */}
            <HeroVisual />
          </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#050d1a] to-transparent pointer-events-none" />
        </section>

        {/* ── Services ── */}
        <section id="servicios" className="bg-[#050d1a] py-16 md:py-28">
          {/* Subtle ambient blob */}
          <div className="relative max-w-6xl mx-auto px-6">
            <div className="mb-10 md:mb-16">
              <SectionHeader label="Servicios" title="Lo que ofrezco" />
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {services.map((s) => (
                <GlassCard key={s.title} className="group p-6 md:p-8">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/15 flex items-center justify-center mb-6 group-hover:bg-blue-600/25 group-hover:border-blue-500/30 transition-all duration-300">
                    {s.icon()}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{s.title}</h3>
                  <p className="text-slate-400 leading-relaxed mb-6 text-sm">{s.description}</p>
                  <ul className="space-y-2.5">
                    {s.items.map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm text-slate-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500/70 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* Gradient separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-blue-700/35 to-transparent mx-6 md:mx-0" />

        {/* ── Portfolio ── */}
        <section id="trabajos" className="bg-[#050d1a] py-16 md:py-28">
          <div className="max-w-6xl mx-auto px-6">
            <div className="mb-12 md:mb-20">
              <SectionHeader
                label="Trabajos"
                title="Proyectos realizados"
                subtitle="Cada proyecto es una solución pensada desde cero para las necesidades reales del cliente."
              />
            </div>
            <div className="space-y-16 md:space-y-32">
              {projects.map((p, i) => (
                <article
                  key={p.name}
                  className={`group flex flex-col gap-10 md:gap-14 items-center ${p.reversed ? "lg:flex-row-reverse" : "lg:flex-row"}`}
                >
                  {/* Browser mockup */}
                  <div className="w-full lg:w-[58%] shrink-0">
                    <BrowserMockup screenshot={p.screenshot} url={p.url} title={p.name} />
                  </div>

                  {/* Project info */}
                  <div className="w-full lg:w-[42%]">
                    <span className="block text-[3.5rem] md:text-[4.5rem] font-bold leading-none tabular-nums select-none mb-3 text-transparent bg-clip-text bg-[linear-gradient(135deg,#1e3a6e,#1d4ed8)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-blue-400 text-xs font-medium tracking-[0.2em] uppercase">{p.category}</span>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mt-2 mb-2 tracking-tight">{p.name}</h3>
                    <p className="text-slate-500 text-sm mb-5 italic">{p.tagline}</p>
                    <p className="text-slate-400 leading-relaxed mb-7 text-sm">{p.description}</p>
                    <ul className="space-y-3 mb-7">
                      {p.highlights.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-sm text-slate-400">
                          <CheckIcon />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-2 mb-8">
                      {p.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-3 py-1.5 rounded-full backdrop-blur-sm bg-blue-600/8 text-blue-400 border border-blue-600/15 font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors group/link"
                    >
                      Ver sitio en vivo
                      <span className="group-hover/link:translate-x-0.5 transition-transform">
                        <ExternalLinkIcon />
                      </span>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Gradient separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-blue-700/35 to-transparent mx-6 md:mx-0" />

        {/* ── Value props ── */}
        <section className="bg-[#050d1a] py-12 md:py-20">
          <div className="max-w-6xl mx-auto px-6">
            <GlassCard className="p-6 md:p-10">
              <div className="grid grid-cols-1 sm:grid-cols-3">
                {stats.map((s, i) => (
                  <div
                    key={s.label}
                    className={`py-6 sm:py-0 text-center sm:text-left ${
                      i > 0
                        ? "border-t sm:border-t-0 sm:border-l border-white/8 sm:pl-10 md:pl-14"
                        : "sm:pr-10 md:pr-14"
                    }`}
                  >
                    <div className="text-4xl md:text-5xl font-bold mb-2 tabular-nums tracking-tight text-transparent bg-clip-text bg-[linear-gradient(135deg,#93c5fd,#3b82f6)]">
                      {s.value}
                    </div>
                    <div className="text-white font-semibold mb-2">{s.label}</div>
                    <div className="text-slate-500 text-sm leading-relaxed">{s.sub}</div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </section>

        {/* ── CTA ── */}
        <section id="contacto" className="bg-[#050d1a] py-16 md:py-28 relative overflow-hidden">
          {/* Central glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[600px] bg-blue-700/8 rounded-full blur-[100px]" />
          </div>
          {/* Crystal watermark */}
          <div className="absolute right-10 top-10 opacity-[0.04] pointer-events-none hidden xl:block">
            <svg width="100" height="133" viewBox="0 0 18 24" fill="none" stroke="white" strokeLinejoin="round" strokeLinecap="round">
              <path d="M9,1 L17,7 L17,23 L1,23 L1,7 Z" strokeWidth="1.5" />
              <line x1="1" y1="7" x2="17" y2="7" strokeWidth="1" />
              <line x1="9" y1="1" x2="5" y2="7" strokeWidth="0.75" />
              <line x1="9" y1="1" x2="13" y2="7" strokeWidth="0.75" />
              <line x1="1" y1="13" x2="17" y2="13" strokeWidth="0.4" />
              <line x1="1" y1="18" x2="17" y2="18" strokeWidth="0.4" />
            </svg>
          </div>

          <div className="relative max-w-6xl mx-auto px-6">
            <div className="max-w-2xl mx-auto">
              {/* Heading */}
              <div className="text-center mb-8 md:mb-10">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <CrystalMark className="w-3 h-[15px] text-blue-500" />
                  <p className="text-blue-400 text-xs font-medium tracking-[0.3em] uppercase">Contacto</p>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                  ¿Listo para dar el salto?
                </h2>
                <p className="text-slate-400 text-base md:text-lg leading-relaxed">
                  Contame sobre tu proyecto y te preparo una propuesta sin compromiso.
                </p>
              </div>

              {/* Glass form container */}
              <GlassCard className="p-6 md:p-8">
                <LeadForm />
              </GlassCard>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-[#030710] border-t border-white/[0.05]">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-5">
          <a href="#" className="flex items-center gap-2.5 group">
            <svg
              className="w-3 h-4 text-blue-600 group-hover:text-blue-500 transition-colors shrink-0"
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
            </svg>
            <span className="text-slate-500 text-sm font-medium">Cuarzo</span>
          </a>
          <p className="text-slate-700 text-xs hidden md:block">
            Desarrollo web & diseño de marca · Argentina · © 2025
          </p>
          <a
            href="https://www.linkedin.com/in/pablo-cavillon/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-blue-400 transition-colors flex items-center gap-2 text-sm"
          >
            <LinkedInIcon />
            LinkedIn
          </a>
        </div>
      </footer>
    </>
  );
}
