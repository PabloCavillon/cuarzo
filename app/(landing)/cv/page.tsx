import type { Metadata } from "next";
import { Boxes, Code2, Database, FileCode2, Globe, Layers, MessageCircle, Plug, Server, ShoppingCart, Workflow } from "lucide-react";
import { ApiDemo, CommerceDemo, ManagementDemo } from "../components/ServiceDemos";
import { CVAbout, CVContact, CVFooter, CVHero, CVNav, CVPath, CVSkills, CVWork, CVWorkCard } from "./parts";
import { WHATSAPP_URL } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Pablo Cavillon — Desarrollador Full Stack",
  description: "Desarrollador Full Stack freelance. Sistemas web a medida para pymes y emprendedores: e-commerce, sistemas de gestión, APIs y automatizaciones.",
};

const SERVICES = [
  { name: "E-commerce", Icon: ShoppingCart, description: "Catálogo, carrito, checkout con Mercado Pago y envíos con Andreani." },
  { name: "Sistemas de gestión a medida", Icon: Layers, description: "Stock, clientes, órdenes de trabajo, logística, roles y permisos." },
  { name: "APIs e integraciones", Icon: Plug, description: "Backend con Spring Boot o Node.js y conexión con sistemas existentes." },
  { name: "Automatizaciones", Icon: Workflow, description: "Carga automática de datos, por ejemplo de adjuntos de correo a base de datos, controles y reportes." },
];

const STACK = [
  { label: "Backend", Icon: Server, items: ["Java (Spring Boot)", "Node.js (Express)", "PHP", "C#"] },
  { label: "Frontend", Icon: Globe, items: ["JavaScript", "React", "Next.js", "HTML", "CSS"] },
  { label: "Bases de datos", Icon: Database, items: ["MySQL", "PostgreSQL (Neon)", "MongoDB", "Prisma ORM"] },
  { label: "Integraciones", Icon: Plug, items: ["Mercado Pago", "Andreani", "Auth.js / Google OAuth"] },
  { label: "Infraestructura", Icon: Boxes, items: ["Docker", "Vercel"] },
  { label: "Otros", Icon: Code2, items: ["Python"] },
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

const PROJECTS = [
  {
    name: "Sistema de gestión logística",
    description: "Cinco módulos: entidades y legales, operativa logística, trazabilidad y calidad, administración y rentabilidad, y seguridad y roles. Incluye un portal para que los propietarios de camiones vean sus unidades e ingresos.",
    tags: ["CuarzoStudio"],
    Demo: ManagementDemo,
  },
  {
    name: "GLEEKCH",
    description: "E-commerce propio de remeras print-on-demand (DTF): catálogo, carrito, login con Google, checkout con Mercado Pago y envíos con Andreani.",
    href: "https://gleekch.vercel.app",
    tags: ["Next.js", "Prisma", "Neon", "Auth.js", "Zustand", "Vercel"],
    Demo: CommerceDemo,
  },
  {
    name: "API de control de archivos bancarios",
    description: "Control y conciliación de archivos bancarios, con un modelo MySQL de 57 tablas y un generador de datos de prueba en Python.",
    tags: ["MySQL", "Python"],
    Demo: ApiDemo,
  },
];

const PARTNER = { name: "Laura", href: "/cv/laura" };

const NAV_LINKS = [
  { label: "Sobre mí", href: "#sobre-mi" },
  { label: "Tecnologías", href: "#herramientas" },
  { label: "Proyectos", href: "#proyectos" },
  { label: "Servicios", href: "#servicios" },
  { label: "Trayectoria", href: "#trayectoria" },
  { label: "Contacto", href: "#contacto" },
];

const OTHER_PROJECTS = [
  "Lector de correos de Outlook que carga los adjuntos en una base de datos (Java).",
  "Backend con Spring Boot, MySQL y Docker, con autenticación JWT.",
  "Sistema de gestión de stock, técnicos y órdenes de trabajo (MySQL).",
  "Zenda, un explorador educativo de animales (Node.js, Express, MongoDB).",
];

export default function CVPage() {
  return (
    <>
      <CVNav name="Pablo Cavillon" links={NAV_LINKS} partner={PARTNER} />
      <main id="contenido">
      <CVHero
        role="Desarrollador Full Stack freelance"
        detail="Java (Spring Boot) · Node.js · React / Next.js"
        location="Mendoza, Argentina · Trabajo remoto"
        links={[
          { label: "LinkedIn", href: "https://linkedin.com/in/pablo-cavillon/" },
          { label: "GitHub", href: "https://github.com/PabloCavillon" },
        ]}
      >
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn">
          <MessageCircle className="w-4 h-4" aria-hidden />
          Escribir por WhatsApp
        </a>
      </CVHero>

      <CVAbout
        eyebrow="Sobre mí"
        title="Del relevamiento al deploy."
        stats={[
          { value: "2018", label: "En Prisma" },
          { value: "2020", label: "Ingeniero" },
          { value: String(STACK.length), label: "Áreas técnicas" },
        ]}
      >
        <p>
          Desarrollo sistemas web a medida para pymes y emprendedores: tiendas online con cobro por
          Mercado Pago, sistemas de gestión con roles y permisos, APIs e integraciones, y automatizaciones
          de procesos. Me encargo del proyecto completo, desde el relevamiento y la cotización hasta el deploy.
        </p>
        <p>
          Además, desde diciembre de 2018 trabajo como desarrollador en Prisma Medios de Pago, en sistemas
          que procesan la operación diaria con bancos.
        </p>
      </CVAbout>

      <CVSkills eyebrow="Herramientas" title="Tecnologías" groups={STACK} />

      <CVWork id="proyectos" eyebrow="Trabajos selectos" title="Proyectos">
        {PROJECTS.map(({ name, description, href, tags, Demo }) => (
          <CVWorkCard key={name} title={name} description={description} href={href} tag={tags[0]}>
            <div><Demo /></div>
          </CVWorkCard>
        ))}
        <article data-reveal className="glass p-6">
          <div className="flex items-center gap-3 mb-3">
            <FileCode2 className="w-6 h-6 accent" aria-hidden />
            <h3 className="subtitle">Otros proyectos</h3>
          </div>
          <ul className="ink-2 space-y-2">
            {OTHER_PROJECTS.map((project) => <li key={project}>{project}</li>)}
          </ul>
        </article>
      </CVWork>

      <CVWork id="servicios" eyebrow="Qué hago" title="Servicios">
        {SERVICES.map(({ name, description, Icon }) => (
          <CVWorkCard key={name} title={name} description={description}>
            <Icon aria-hidden />
          </CVWorkCard>
        ))}
      </CVWork>

      <CVPath
        education={[
          { title: "Ingeniero en Informática", meta: "Universidad de Belgrano, Buenos Aires · 2020" },
          { title: "Idiomas", meta: "Español nativo · Inglés B1 (en curso)" },
        ]}
        experience={EXPERIENCE.map((e) => ({ title: e.role, meta: `${e.company} · ${e.period}`, points: e.points }))}
      />

      <CVContact note="Respondo en menos de 24 hs hábiles." location="Mendoza, Argentina" whatsapp />
      </main>
      <CVFooter name="Pablo Cavillon" partner={PARTNER} />
    </>
  );
}
