import type { Metadata } from "next";
import { BookOpen, Clapperboard, FileStack, Image, LayoutTemplate, Mail, PenTool, Scissors, Sparkles, Table } from "lucide-react";
import { CVAbout, CVContact, CVFooter, CVHero, CVNav, CVPath, CVSkills, CVWork, CVWorkCard } from "../parts";
import { EMAIL } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Laura Coreico — Diseñadora Multimedial",
  description: "Diseñadora multimedial e ilustradora en Mendoza. Ilustración, contenido digital, video y motion.",
};

const SERVICES = [
  { name: "Ilustración y diseño gráfico", Icon: PenTool, description: "Gráficas para indumentaria, etiquetas, cartelería y piezas para venta." },
  { name: "Contenido digital", Icon: Image, description: "Imágenes para productos y redes, edición en Photoshop." },
  { name: "Video y motion", Icon: Clapperboard, description: "Edición en Premiere y animación en After Effects." },
  { name: "Interfaces", Icon: LayoutTemplate, description: "Maquetado visual en Figma." },
  { name: "Archivos para producción", Icon: FileStack, description: "Preparación de planchas para estampado DTF y fichas técnicas textiles." },
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

const PARTNER = { name: "Pablo", href: "/cv" };

const NAV_LINKS = [
  { label: "Sobre mí", href: "#sobre-mi" },
  { label: "Herramientas", href: "#herramientas" },
  { label: "Qué hago", href: "#servicios" },
  { label: "Trayectoria", href: "#trayectoria" },
  { label: "Contacto", href: "#contacto" },
];

const TOOLS = [
  { label: "Avanzado", Icon: PenTool, items: ["Adobe Illustrator"] },
  { label: "Intermedio", Icon: Sparkles, items: ["Adobe Photoshop", "Adobe Premiere", "Adobe After Effects", "Figma"] },
  { label: "Inicial", Icon: BookOpen, items: ["Adobe InDesign"] },
  { label: "Diseño técnico textil", Icon: Scissors, items: ["Audaces", "Optitex"] },
  { label: "Gestión", Icon: Table, items: ["Excel", "Word"] },
];

export default function LauraCVPage() {
  return (
    <>
      <CVNav name="Laura Coreico" links={NAV_LINKS} partner={PARTNER} />
      <main id="contenido">
      <CVHero
        role="Diseñadora Multimedial"
        detail="Ilustración · Contenido digital"
        location="Mendoza, Argentina"
        links={[{ label: "mendog33k.shop", href: "https://mendog33k.shop" }]}
      >
        <a href={`mailto:${EMAIL}`} className="btn">
          <Mail className="w-4 h-4" aria-hidden />
          Escribir email
        </a>
      </CVHero>

      <CVAbout
        eyebrow="Sobre mí"
        title="Del diseño textil a lo digital."
        stats={[
          { value: "2023", label: "MendoGeek" },
          { value: String(EXPERIENCE.length), label: "Experiencias" },
          { value: String(EDUCATION.length), label: "Formaciones" },
        ]}
      >
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
      </CVAbout>

      <CVSkills eyebrow="Herramientas" title="Con qué trabajo" groups={TOOLS} />

      <CVWork id="servicios" eyebrow="Qué hago" title="Servicios" link={{ label: "Ver mendog33k.shop", href: "https://mendog33k.shop" }}>
        {SERVICES.map(({ name, description, Icon }) => (
          <CVWorkCard key={name} title={name} description={description}>
            <Icon aria-hidden />
          </CVWorkCard>
        ))}
      </CVWork>

      <CVPath
        education={EDUCATION.map((e) => ({ title: e.title, meta: e.place }))}
        experience={EXPERIENCE.map((e) => ({ title: e.role, meta: e.period ? `${e.company} · ${e.period}` : e.company, points: e.points }))}
      />

      <CVContact location="Mendoza, Argentina" />
      </main>
      <CVFooter name="Laura Coreico" partner={PARTNER} />
    </>
  );
}
