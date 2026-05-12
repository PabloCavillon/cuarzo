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

export const metadata: Metadata = {
  title: "CUARZO — Soluciones Digitales Inteligentes para Emprendedores",
  description:
    "Potenciamos PYMEs y startups argentinas con tecnología de vanguardia. Control de stock, turneras, facturación ARCA, e-commerce y más.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const raw = cookieStore.get("locale")?.value ?? "es";
  const locale: Locale = locales.includes(raw as Locale) ? (raw as Locale) : "es";
  const htmlLang = locale === "pt" ? "pt-BR" : locale;

  return (
    <html lang={htmlLang} data-scroll-behavior="smooth" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
