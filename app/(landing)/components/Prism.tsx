import type { ReactNode } from "react";
import Crystal from "./Crystal";

const IN = "M-140 640 L500 520";
const RAYS = [
  { d: "M500 520 L1500 150", color: "var(--violet)" },
  { d: "M500 520 L1500 470", color: "var(--accent)" },
  { d: "M500 520 L1500 830", color: "var(--beacon)" },
];

// The signature moment: one beam enters the crystal and leaves split into three colors.
export default function Prism({ className, children }: { className: string; children?: ReactNode }) {
  return (
    <div className={`prism loops relative ${className}`}>
      {/* A panel below keeps the crystal whole on narrow screens. */}
      <div className={`relative ${children ? "h-[calc(100%-11rem)] lg:h-full" : "h-full"}`}>
      <svg aria-hidden viewBox="0 0 1000 1000" preserveAspectRatio="none" fill="none" className="absolute inset-0 w-full h-full overflow-visible">
        <defs>
          {/* Fades in from nothing, so the beam never starts on top of the copy. */}
          <linearGradient id="beam-in" gradientUnits="userSpaceOnUse" x1="-140" y1="640" x2="500" y2="520">
            <stop offset="0" stopColor="#f8fafc" stopOpacity="0" />
            <stop offset="1" stopColor="#f8fafc" />
          </linearGradient>
        </defs>
        <path d={IN} pathLength={1000} stroke="url(#beam-in)" className="beam" />
        <path d={IN} pathLength={1000} stroke="url(#beam-in)" className="beam-pulse" />
        {RAYS.map((ray, i) => (
          <g key={ray.color}>
            <path d={ray.d} pathLength={1000} stroke={ray.color} className="beam" />
            <path d={ray.d} pathLength={1000} stroke={ray.color} className="beam-pulse" style={{ animationDelay: `${1.4 + i * 0.25}s` }} />
          </g>
        ))}
      </svg>
      <div className="relative h-full"><Crystal /></div>
      </div>
      {children}
    </div>
  );
}
