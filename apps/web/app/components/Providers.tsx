"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { I18nProvider } from "@/lib/i18n/provider";
import type { Locale } from "@/lib/i18n";

export function Providers({
  children,
  locale,
}: {
  children: ReactNode;
  locale: Locale;
}) {
  return (
    <SessionProvider>
      <I18nProvider initialLocale={locale}>{children}</I18nProvider>
    </SessionProvider>
  );
}
