import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ServiceWorker } from "@/components/ServiceWorker";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cuarzo.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Cuarzo · Desarrollo Web & Diseño de Marca",
    template: "%s · Cuarzo",
  },
  description:
    "Desarrollo web y diseño de marca a medida para pequeños negocios. Landing pages, tiendas online e identidad visual que hacen crecer tu negocio. Pablo Cavillon — Argentina.",
  keywords: [
    "desarrollo web",
    "diseño web",
    "diseño de marca",
    "identidad visual",
    "logo",
    "landing page",
    "tienda online",
    "e-commerce",
    "Next.js",
    "Argentina",
    "Córdoba",
    "freelance",
    "pequeños negocios",
    "emprendimientos",
  ],
  authors: [{ name: "Pablo Cavillon", url: "https://www.linkedin.com/in/pablo-cavillon/" }],
  creator: "Pablo Cavillon",
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: siteUrl,
    siteName: "Cuarzo",
    title: "Cuarzo · Desarrollo Web & Diseño de Marca",
    description:
      "Desarrollo web y diseño de marca a medida para pequeños negocios. Soluciones digitales elegantes que hacen crecer tu negocio.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cuarzo · Desarrollo Web & Diseño de Marca",
    description:
      "Desarrollo web y diseño de marca a medida para pequeños negocios. Soluciones digitales elegantes.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geist.variable} scroll-smooth`}>
      <body className="min-h-full flex flex-col antialiased">
        <ServiceWorker />
        {children}
      </body>
    </html>
  );
}
