"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useT } from "@/lib/i18n/provider";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const { home, error: copy } = useT().pages;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex-1 bg-(--canvas) text-(--ink) flex flex-col justify-center px-6 lg:px-14 py-24">
      <h1 className="font-[family-name:var(--font-display)] font-medium text-3xl sm:text-5xl">{copy.title}</h1>
      <p className="text-(--ink-2) text-lg mt-4 max-w-[46ch]">{copy.description}</p>
      {error.digest && <p className="text-(--ink-2) text-base mt-3">{copy.id}: {error.digest}</p>}
      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <button onClick={reset} className="min-h-11 px-5 bg-(--ink) rounded text-(--canvas) font-semibold hover:bg-slate-300 transition-colors">
          {copy.retry}
        </button>
        <Link href="/" className="inline-flex items-center justify-center min-h-11 px-5 border border-white/10 rounded font-semibold hover:bg-white/10 transition-colors">
          {home}
        </Link>
      </div>
    </main>
  );
}
