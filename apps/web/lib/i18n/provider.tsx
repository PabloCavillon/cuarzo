"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { translations, locales, type Locale, type T } from "./index";

interface I18nContextValue {
  t: T;
  locale: Locale;
  setLocale: (l: Locale) => void;
}

const I18nContext = createContext<I18nContextValue>({
  t: translations.es,
  locale: "es",
  setLocale: () => {},
});

export function I18nProvider({
  children,
  initialLocale = "es",
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const safeLocale = locales.includes(initialLocale as Locale) ? initialLocale : "es";
  const [locale, setLocaleState] = useState<Locale>(safeLocale);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    document.cookie = `locale=${l}; path=/; max-age=31536000; SameSite=Lax`;
    // Update <html lang> for accessibility
    document.documentElement.lang = l === "pt" ? "pt-BR" : l;
  }, []);

  return (
    <I18nContext.Provider value={{ t: translations[locale], locale, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useT(): T {
  return useContext(I18nContext).t;
}

export function useLocale(): Locale {
  return useContext(I18nContext).locale;
}

export function useSetLocale(): (l: Locale) => void {
  return useContext(I18nContext).setLocale;
}
