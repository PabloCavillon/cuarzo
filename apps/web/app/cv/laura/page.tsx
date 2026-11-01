import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Laura Coreico — Diseñadora Multimedial",
  description: "Diseñadora multimedial e ilustradora en Mendoza. Ilustración, contenido digital, video y motion.",
};

const EMAIL = "contacto@cuarzostudio.com";

const SERVICES = [
  { name: "Ilustración y diseño gráfico", description: "Gráficas para indumentaria, etiquetas, cartelería y piezas para venta." },
  { name: "Contenido digital", description: "Imágenes para productos y redes, edición en Photoshop." },
  { name: "Video y motion", description: "Edición en Premiere y animación en After Effects." },
  { name: "Interfaces", description: "Maquetado visual en Figma." },
  { name: "Archivos para producción", description: "Preparación de planchas para estampado DTF y fichas técnicas textiles." },
];

const EXPERIENCE = [
  {
    role: "Diseñadora e ilustradora",
    company: "MendoGeek, emprendimiento propio · Mendoza",
    period: "2023 — Actualidad",
    points: [
      "Diseño gráficas, ilustraciones y composiciones visuales para indumentaria estampada en DTF.",
      "Preparo planchas y archivos para producción y controlo la calidad de cada tirada.",
      "Coordino el flujo entre diseño y producción, y gestiono el stock de insumos.",
    ],
  },
  {
    role: "Encargada del departamento de tizadas",
    company: "Anavana · Buenos Aires",
    period: "2022 — 2023",
    points: [
      "Lideré el equipo del área de tizadas, operando Optitex.",
      "Elaboré fichas técnicas de prendas y gestioné el inventario.",
      "Configuré máquinas de estampado.",
    ],
  },
  {
    role: "Encargada del sector modelista",
    company: "Top White · Buenos Aires",
    period: "2020 — 2022",
    points: [
      "Lideré el sector modelista, operando Audaces.",
      "Interpreté fichas técnicas, supervisé pruebas de calce y gestioné la digitalización de moldes.",
    ],
  },
  {
    role: "Gestión comercial y material visual",
    company: "FullMoon, cotillón y librería · Salta",
    period: "",
    points: [
      "Diseñé publicidades y material visual para la venta de productos.",
      "Controlé stock, organicé órdenes de instalación y presupuestos, y coordiné al personal.",
    ],
  },
];

const EDUCATION = [
  { title: "Técnica Superior en Diseño Multimedial", place: "Instituto Superior \"Manuel Belgrano\" IES 9-008, Mendoza · 2025 — en curso" },
  { title: "Certificación Profesional en Diseño Digital y Producción Audiovisual", place: "Da Vinci, Primera Escuela Multimedial, Buenos Aires · 2022 — 2023" },
  { title: "Técnica Superior en Diseño Textil e Indumentaria", place: "Escuela de Bellas Artes \"Tomás Cabrera\", Salta · 2015 — 2018" },
];

const TOOLS = [
  { label: "Avanzado", items: ["Adobe Illustrator"] },
  { label: "Intermedio", items: ["Adobe Photoshop", "Adobe Premiere", "Adobe After Effects", "Figma"] },
  { label: "Inicial", items: ["Adobe InDesign"] },
  { label: "Diseño técnico textil", items: ["Audaces", "Optitex"] },
  { label: "Gestión", items: ["Excel", "Word"] },
];

const sectionTitle = "text-xs font-semibold text-white/30 uppercase tracking-[0.2em] mb-6";
const contactLink = "flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors";

export default function LauraCVPage() {
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
                LC
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Laura Coreico</h1>
              <p className="text-white/60 text-lg mb-1">Diseñadora Multimedial</p>
              <p className="text-white/40 text-sm mb-2">Ilustración · Contenido digital</p>
              <div className="flex items-center gap-1.5 text-sm text-white/35">
                <MapPin className="w-3.5 h-3.5" />
                Mendoza, Argentina
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:items-end">
              <a href={`mailto:${EMAIL}`} className={contactLink}>
                <Mail className="w-3.5 h-3.5" />
                {EMAIL}
              </a>
              <a href="https://mendog33k.shop" target="_blank" rel="noopener noreferrer" className={contactLink}>
                <ExternalLink className="w-3.5 h-3.5" />
                mendog33k.shop
              </a>
            </div>
          </div>

          <div className="mt-8 space-y-4 text-white/55 leading-relaxed max-w-2xl">
            <p>
              Diseñadora multimedial e ilustradora en Mendoza. Vengo del diseño textil y hoy trabajo entre lo
              gráfico, lo digital y lo audiovisual: ilustro, diseño piezas para redes, edito video y armo
              gráficas listas para producción.
            </p>
            <p>
              Desde 2023 llevo adelante MendoGeek, mi marca de indumentaria estampada, donde diseño cada gráfica
              y acompaño todo el proceso hasta el producto terminado. Antes lideré equipos de moldería y
              producción en Buenos Aires, así que sé lo que es trabajar con plazos, fichas técnicas y precisión
              al milímetro.
            </p>
          </div>
        </section>

        {/* Services */}
        <section>
          <h2 className={sectionTitle}>Qué hago</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {SERVICES.map((s) => (
              <div key={s.name} className="bg-white/5 border border-white/8 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white mb-2">{s.name}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
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

        {/* Tools */}
        <section>
          <h2 className={sectionTitle}>Herramientas</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOOLS.map((t) => (
              <div key={t.label} className="bg-white/5 border border-white/8 rounded-2xl p-5">
                <p className="text-xs font-semibold text-white/50 mb-4">{t.label}</p>
                <ul className="space-y-1.5">
                  {t.items.map((item) => (
                    <li key={item} className="text-sm text-white/70">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section>
          <h2 className={sectionTitle}>Formación</h2>
          <div className="space-y-4">
            {EDUCATION.map((e) => (
              <div key={e.title}>
                <p className="text-sm font-bold text-white">{e.title}</p>
                <p className="text-sm text-white/50">{e.place}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="border-t border-white/8 pt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm font-semibold text-white">¿Tenés un proyecto en mente?</p>
          <a
            href={`mailto:${EMAIL}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-navy-900 text-sm font-semibold rounded-full hover:bg-navy-100 transition-colors shrink-0"
          >
            <Mail className="w-4 h-4" />
            Escribir email
          </a>
        </section>
      </main>
    </div>
  );
}
