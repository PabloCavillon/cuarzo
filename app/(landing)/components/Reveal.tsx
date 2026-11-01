"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n/provider";

// Content starts visible: the class that hides it only arrives with this script.
export default function Reveal() {
  const pathname = usePathname();
  // Translated lists remount under new keys, so they have to be observed again.
  const locale = useLocale();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.documentElement.classList.add("reveal");

    const reveal = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("in");
        reveal.unobserve(entry.target);
      }
    }, { rootMargin: "0px 0px -8% 0px" });

    // Loops only run while they are on screen.
    const loops = new IntersectionObserver((entries) => {
      for (const entry of entries) entry.target.classList.toggle("on", entry.isIntersecting);
    });

    document.querySelectorAll("[data-reveal]").forEach((el) => reveal.observe(el));
    document.querySelectorAll(".loops").forEach((el) => loops.observe(el));
    return () => { reveal.disconnect(); loops.disconnect(); };
  }, [pathname, locale]);

  return null;
}
