"use client";

import { useEffect } from "react";

// The root layout never re-renders on client navigation, so <html lang> keeps the
// landing's language. The CVs only exist in Spanish.
export default function PageLang() {
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.lang;
    root.lang = "es";
    return () => { root.lang = previous; };
  }, []);

  return null;
}
