import type { Metadata } from "next";
import { Geist, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/provider";
import { getLocale } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n";

const body = Geist({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
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
  return META[await getLocale()];
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const htmlLang = locale === "pt" ? "pt-BR" : locale;

  return (
    <html lang={htmlLang} data-scroll-behavior="smooth" className={`${body.variable} ${display.variable} ${mono.variable} h-full antialiased`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Cuarzo" />
        <meta name="theme-color" content="#090b10" />
      </head>
      <body className="min-h-full flex flex-col">
        <I18nProvider initialLocale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
