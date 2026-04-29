import Image from "next/image";
import { LeadForm } from "@/components/LeadForm";
import { Navbar } from "@/components/Navbar";

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
      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    items: [
      "Landing pages de alta conversión",
      "Tiendas online y catálogos",
      "Sitios institucionales",
    ],
  },
  {
    title: "Diseño de Marca",
    description:
      "Identidad visual profesional que refleja la esencia de tu negocio. Logos, paletas de color, tipografías y guías de estilo.",
    icon: () => (
      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    items: [
      "Diseño de logotipo",
      "Identidad visual completa",
      "Material gráfico digital",
    ],
  },
];

const stats = [
  { value: "100%", label: "A medida", sub: "Sin templates genéricos. Cada proyecto es único y pensado desde cero." },
  { value: "Ágil", label: "Entrega rápida", sub: "Plazos acordados, comunicación fluida y sin sorpresas." },
  { value: "∞", label: "Soporte continuo", sub: "Acompaño a mi cliente más allá del lanzamiento." },
];

// ── Components ───────────────────────────────────────────────────────────────

function CrystalMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 18 22"
      fill="none"
      stroke="currentColor"
      strokeLinejoin="round"
    >
      <polygon points="9,1 17,6 17,16 9,21 1,16 1,6" strokeWidth="1.5" />
      <line x1="1" y1="6" x2="17" y2="6" strokeWidth="1" />
      <line x1="9" y1="1" x2="5" y2="6" strokeWidth="0.75" />
      <line x1="9" y1="1" x2="13" y2="6" strokeWidth="0.75" />
      <line x1="1" y1="11" x2="17" y2="11" strokeWidth="0.4" strokeDasharray="1.5 2.5" />
    </svg>
  );
}

function SectionHeader({
  label,
  title,
  subtitle,
}: {
  label: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <CrystalMark className="w-3 h-[15px] text-blue-500 shrink-0" />
        <p className="text-blue-400 text-xs font-medium tracking-[0.3em] uppercase">{label}</p>
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{title}</h2>
      {subtitle && <p className="text-slate-500 mt-3 max-w-xl leading-relaxed">{subtitle}</p>}
    </>
  );
}

function HeroCrystal() {
  return (
    <div className="hidden xl:block absolute right-0 inset-y-0 w-[620px] pointer-events-none select-none overflow-hidden">
      <svg
        className="absolute right-[-110px] top-1/2 -translate-y-[48%] opacity-[0.055]"
        width="560"
        height="680"
        viewBox="0 0 560 680"
        fill="none"
        stroke="white"
        strokeLinejoin="round"
      >
        {/* Primary crystal */}
        <polygon points="240,20 460,130 460,540 240,650 20,540 20,130" strokeWidth="0.8" />
        <line x1="20" y1="130" x2="460" y2="130" strokeWidth="0.65" />
        <line x1="240" y1="20" x2="130" y2="130" strokeWidth="0.5" />
        <line x1="240" y1="20" x2="350" y2="130" strokeWidth="0.5" />
        <line x1="20" y1="290" x2="460" y2="290" strokeWidth="0.3" />
        <line x1="20" y1="420" x2="460" y2="420" strokeWidth="0.3" />
        <line x1="20" y1="510" x2="460" y2="510" strokeWidth="0.2" />
        <line x1="240" y1="20" x2="240" y2="650" strokeWidth="0.2" />
        {/* Secondary crystal (right) */}
        <polygon points="430,55 540,115 540,380 430,440 320,380 320,115" strokeWidth="0.5" opacity="0.45" />
        <line x1="320" y1="115" x2="540" y2="115" strokeWidth="0.4" opacity="0.45" />
        <line x1="430" y1="55" x2="375" y2="115" strokeWidth="0.3" opacity="0.45" />
        <line x1="430" y1="55" x2="485" y2="115" strokeWidth="0.3" opacity="0.45" />
        <line x1="320" y1="240" x2="540" y2="240" strokeWidth="0.25" opacity="0.35" />
        <line x1="320" y1="320" x2="540" y2="320" strokeWidth="0.2" opacity="0.3" />
        {/* Accent crystal (small, left) */}
        <polygon points="80,140 155,180 155,300 80,340 5,300 5,180" strokeWidth="0.4" opacity="0.25" />
        <line x1="5" y1="180" x2="155" y2="180" strokeWidth="0.3" opacity="0.25" />
        <line x1="80" y1="140" x2="42" y2="180" strokeWidth="0.25" opacity="0.25" />
        <line x1="80" y1="140" x2="118" y2="180" strokeWidth="0.25" opacity="0.25" />
      </svg>
    </div>
  );
}

function BrowserMockup({
  screenshot,
  url,
  title,
}: {
  screenshot: string;
  url: string;
  title: string;
}) {
  return (
    <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-black/70 group-hover:border-blue-500/30 transition-colors duration-300">
      <div className="bg-[#0f1629] px-3 md:px-4 py-3 flex items-center gap-2 md:gap-3 border-b border-white/6">
        <div className="flex gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500/60" />
          <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-400/60" />
          <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500/60" />
        </div>
        <div className="flex-1 bg-[#070e1f] rounded-md px-3 py-1.5 text-xs text-slate-500 truncate min-w-0">
          {new URL(url).hostname}
        </div>
        <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
      <div className="relative w-full overflow-hidden bg-[#070e1f]" style={{ aspectRatio: "16/10" }}>
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
          {/* Ambient blobs */}
          <div className="absolute top-1/4 -left-12 w-72 h-72 md:w-125 md:h-125 bg-blue-700/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-0 w-60 h-60 md:w-80 md:h-80 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />
          {/* Subtle grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.025]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
          {/* Decorative crystal cluster */}
          <HeroCrystal />

          <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-32">
            {/* Availability badge */}
            <div className="inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 mb-8 border border-blue-500/20 bg-blue-500/8 text-xs text-blue-300 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shrink-0" />
              Disponible para nuevos proyectos
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-[4.5rem] lg:text-7xl font-bold text-white leading-[1.06] tracking-tight mb-8 max-w-4xl">
              Tu negocio,{" "}
              <span className="text-transparent bg-clip-text bg-[linear-gradient(135deg,#93c5fd,#3b82f6,#1d4ed8)]">
                digitalizado
              </span>{" "}
              con elegancia.
            </h1>

            <p className="text-base md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
              Desarrollo web y diseño de marca a medida para pequeños negocios que
              quieren destacar en el mundo digital.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#contacto"
                className="px-8 py-4 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-500 transition-all hover:shadow-xl hover:shadow-blue-600/30 text-center"
              >
                Empezar un proyecto
              </a>
              <a
                href="#trabajos"
                className="px-8 py-4 border border-white/10 text-white rounded-full font-medium hover:border-white/25 hover:bg-white/4 transition-all text-center"
              >
                Ver trabajos
              </a>
            </div>
          </div>
        </section>

        {/* Section separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-blue-800/50 to-transparent" />

        {/* ── Services ── */}
        <section id="servicios" className="bg-[#070e1f] py-16 md:py-28">
          <div className="max-w-6xl mx-auto px-6">
            <div className="mb-10 md:mb-16">
              <SectionHeader label="Servicios" title="Lo que ofrezco" />
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {services.map((s) => (
                /* Gradient border card */
                <div
                  key={s.title}
                  className="group relative p-px rounded-2xl bg-gradient-to-br from-blue-600/20 via-blue-900/5 to-transparent hover:from-blue-500/35 transition-all duration-300"
                >
                  <article className="p-6 md:p-8 rounded-2xl bg-[#070e1f] h-full">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/15 flex items-center justify-center mb-6 group-hover:bg-blue-600/25 transition-colors">
                      {s.icon()}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">{s.title}</h3>
                    <p className="text-slate-400 leading-relaxed mb-6">{s.description}</p>
                    <ul className="space-y-2.5">
                      {s.items.map((item) => (
                        <li key={item} className="flex items-center gap-3 text-sm text-slate-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-blue-900/40 to-transparent" />

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
                  className={`group flex flex-col gap-10 md:gap-12 items-center ${p.reversed ? "lg:flex-row-reverse" : "lg:flex-row"}`}
                >
                  <div className="w-full lg:w-[58%] shrink-0">
                    <BrowserMockup screenshot={p.screenshot} url={p.url} title={p.name} />
                  </div>
                  <div className="w-full lg:w-[42%]">
                    {/* Project index */}
                    <span className="block text-[4rem] font-bold leading-none text-blue-900/50 select-none mb-2 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-blue-400 text-xs font-medium tracking-[0.2em] uppercase">{p.category}</span>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mt-2 mb-3 tracking-tight">{p.name}</h3>
                    <p className="text-slate-500 text-sm mb-4 italic">{p.tagline}</p>
                    <p className="text-slate-400 leading-relaxed mb-7">{p.description}</p>
                    <ul className="space-y-3 mb-8">
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
                          className="text-xs px-3 py-1.5 rounded-full bg-blue-600/10 text-blue-400 border border-blue-600/20"
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

        {/* ── Value props ── */}
        <section className="bg-[#070e1f] py-12 md:py-20 border-y border-white/5">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className={`py-8 sm:py-0 text-center sm:text-left ${
                    i > 0
                      ? "border-t sm:border-t-0 sm:border-l border-white/8 sm:pl-10 md:pl-14"
                      : "sm:pr-10 md:pr-14"
                  }`}
                >
                  <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2 tabular-nums tracking-tight">
                    {s.value}
                  </div>
                  <div className="text-white font-semibold mb-2">{s.label}</div>
                  <div className="text-slate-500 text-sm leading-relaxed">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section id="contacto" className="bg-[#050d1a] py-16 md:py-28 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-150 h-150 bg-blue-700/8 rounded-full blur-3xl" />
          </div>
          {/* Decorative crystal mark watermark */}
          <div className="absolute right-8 top-8 opacity-[0.04] pointer-events-none hidden lg:block">
            <svg width="120" height="148" viewBox="0 0 18 22" fill="none" stroke="white" strokeLinejoin="round">
              <polygon points="9,1 17,6 17,16 9,21 1,16 1,6" strokeWidth="1.5" />
              <line x1="1" y1="6" x2="17" y2="6" strokeWidth="1" />
              <line x1="9" y1="1" x2="5" y2="6" strokeWidth="0.75" />
              <line x1="9" y1="1" x2="13" y2="6" strokeWidth="0.75" />
              <line x1="1" y1="11" x2="17" y2="11" strokeWidth="0.5" strokeDasharray="1.5 2.5" />
            </svg>
          </div>
          <div className="relative max-w-6xl mx-auto px-6">
            <div className="max-w-2xl mx-auto">
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
              <LeadForm />
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-[#030710] border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <svg
              className="w-[14px] h-[17px] text-blue-600 shrink-0"
              viewBox="0 0 18 22"
              fill="none"
              stroke="currentColor"
              strokeLinejoin="round"
            >
              <polygon points="9,1 17,6 17,16 9,21 1,16 1,6" strokeWidth="1.5" />
              <line x1="1" y1="6" x2="17" y2="6" strokeWidth="1" />
              <line x1="9" y1="1" x2="5" y2="6" strokeWidth="0.75" />
              <line x1="9" y1="1" x2="13" y2="6" strokeWidth="0.75" />
            </svg>
            <div>
              <span className="text-slate-400 text-sm font-medium">Cuarzo</span>
              <span className="text-slate-700 text-sm"> · Pablo Cavillon</span>
            </div>
          </div>
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
