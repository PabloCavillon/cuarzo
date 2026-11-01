import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { translations } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: `${translations[await getLocale()].pages.notFound.title} — CUARZO` };
}

export default async function NotFound() {
  const { home, notFound } = translations[await getLocale()].pages;

  return (
    <main className="flex-1 bg-(--canvas) text-(--ink) flex flex-col justify-center px-6 lg:px-14 py-24">
      <p className="font-[family-name:var(--font-display)] font-medium text-(--accent) text-8xl leading-none tracking-tight">404</p>
      <h1 className="font-[family-name:var(--font-display)] font-medium text-2xl mt-4">{notFound.title}</h1>
      <p className="text-(--ink-2) text-lg mt-3 max-w-[46ch]">{notFound.description}</p>
      <Link href="/" className="inline-flex items-center gap-2 self-start mt-8 min-h-11 px-5 bg-(--ink) rounded text-(--canvas) font-semibold hover:bg-slate-300 transition-colors">
        {home}
        <ArrowRight className="w-4 h-4" aria-hidden />
      </Link>
    </main>
  );
}
