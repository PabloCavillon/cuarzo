import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { Providers } from "./components/Providers";
import type { Locale } from "@/lib/i18n";
import { locales } from "@/lib/i18n";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const META: Record<Locale, { title: string; description: string }> = {
  es: {
    title:       "CUARZO — Software a medida para tu negocio",
    description: "Tiendas online, sistemas de gestión, integraciones y automatizaciones para PYMEs argentinas.",
  },
  en: {
    title:       "CUARZO — Custom software for your business",
    description: "Online stores, management systems, integrations and automation for small businesses in Argentina.",
  },
  pt: {
    title:       "CUARZO — Software sob medida para o seu negócio",
    description: "Lojas online, sistemas de gestão, integrações e automações para pequenas empresas na Argentina.",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("locale")?.value ?? "es";
  const locale: Locale = locales.includes(raw as Locale) ? (raw as Locale) : "es";
  return META[locale];
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const raw = cookieStore.get("locale")?.value ?? "es";
  const locale: Locale = locales.includes(raw as Locale) ? (raw as Locale) : "es";
  const htmlLang = locale === "pt" ? "pt-BR" : locale;

  return (
    <html lang={htmlLang} data-scroll-behavior="smooth" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Cuarzo" />
        <meta name="theme-color" content="#0a1628" />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
