"use client";

import { useEffect, useRef } from "react";

export function HeroBackground() {
  const blob1 = useRef<HTMLDivElement>(null);
  const blob2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (blob1.current) blob1.current.style.transform = `translateY(${y * 0.22}px)`;
      if (blob2.current) blob2.current.style.transform = `translateY(${y * -0.12}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        ref={blob1}
        className="absolute -top-40 -left-32 w-[750px] h-[750px] rounded-full bg-blue-700/12 blur-[130px]"
        style={{ animation: "blob-drift-1 16s ease-in-out infinite" }}
      />
      <div
        ref={blob2}
        className="absolute top-1/3 -right-40 w-[650px] h-[650px] rounded-full bg-blue-500/8 blur-[110px]"
        style={{ animation: "blob-drift-2 20s ease-in-out infinite" }}
      />
      <div
        className="absolute -bottom-24 left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-800/10 blur-[90px] pointer-events-none"
        style={{ animation: "blob-drift-3 13s ease-in-out infinite 3s" }}
      />
      {/* Fine grid */}
      <div
        className="absolute inset-0 opacity-[0.022]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.6) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
    </div>
  );
}
