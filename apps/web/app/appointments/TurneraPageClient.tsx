"use client";

import BookingWizard from "../components/appointments/BookingWizard";
import { useT } from "@/lib/i18n/provider";

export default function TurneraPageClient() {
  const t = useT();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight">
          {t.turnera.page.title}
        </h1>
        <p className="text-gray-400 text-sm mt-1.5">{t.turnera.page.description}</p>
      </div>
      <BookingWizard />
    </div>
  );
}
