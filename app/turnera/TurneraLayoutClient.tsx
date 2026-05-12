"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { CuarzoIsotype } from "../components/CuarzoLogo";
import { useT } from "@/lib/i18n/provider";

export default function TurneraLayoutClient({ children }: { children: ReactNode }) {
  const t = useT();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <CuarzoIsotype height={24} />
            <span className="font-bold tracking-[0.18em] text-navy-900 text-sm">CUARZO</span>
            <span className="text-gray-300 mx-1.5 text-sm select-none">/</span>
            <span className="text-gray-500 text-sm font-medium group-hover:text-navy-700 transition-colors">
              Turnera
            </span>
          </Link>

          <Link
            href="/turnera/mis-reservas"
            className="text-xs font-medium text-navy-600 hover:text-navy-900 transition-colors"
          >
            {t.turnera.layout.myBookings}
          </Link>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="py-6 border-t border-gray-100 bg-white">
        <p className="text-center text-xs text-gray-300">
          © {new Date().getFullYear()} Cuarzo · Buenos Aires, Argentina
        </p>
      </footer>
    </div>
  );
}
