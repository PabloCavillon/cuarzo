"use client";

import { Check } from "lucide-react";
import { useT } from "@/lib/i18n/provider";

// One small working picture per service. Illustrative only: no real client data.
const pulse = (delay: string) => ({ animationDelay: delay });

export function CommerceDemo() {
  const t = useT();

  return (
    <div className="space-y-2.5">
      {t.demos.commerce.map((step, i) => (
        <div key={step} className="grid grid-cols-[minmax(0,6.5rem)_1fr_auto] items-center gap-3">
          <span className="ink-2">{step}</span>
          <span className="track"><span className="track-fill" style={pulse(`${i * 0.5}s`)} /></span>
          <span className="beacon" style={pulse(`${i * 0.5}s`)} />
        </div>
      ))}
    </div>
  );
}

export function ManagementDemo() {
  return (
    <div className="flex items-end gap-1.5 h-24">
      {[46, 72, 58, 90, 38, 66, 82, 54, 96, 44].map((height, i) => (
        <span key={i} className="bar" style={{ height: `${height}%`, animationDelay: `${i * 0.12}s` }} />
      ))}
    </div>
  );
}

export function ApiDemo() {
  return (
    <svg aria-hidden viewBox="0 0 300 96" fill="none" className="w-full h-24">
      <path d="M58 48H130M170 48C200 48 205 18 238 18M170 48C200 48 205 78 238 78" pathLength={1000} stroke="var(--wire)" />
      <path d="M58 48H130M170 48C200 48 205 18 238 18M170 48C200 48 205 78 238 78" pathLength={1000} stroke="var(--accent)" strokeWidth={1.5} className="wire-pulse" />
      <circle cx="44" cy="48" r="14" stroke="var(--ink-2)" />
      <rect x="130" y="28" width="40" height="40" rx="4" stroke="var(--accent)" />
      <circle cx="252" cy="18" r="14" stroke="var(--ink-2)" />
      <circle cx="252" cy="78" r="14" stroke="var(--ink-2)" />
    </svg>
  );
}

export function AutomationDemo() {
  const t = useT();

  return (
    <ul className="space-y-2">
      {t.demos.automation.map((task, i) => (
        <li key={task} className="flex items-center justify-between gap-3 border-b border-(--line) pb-2">
          <span className="ink-2">{task}</span>
          <Check className="task-ok accent w-4 h-4" style={pulse(`${i * 0.8}s`)} />
        </li>
      ))}
    </ul>
  );
}

export function DesignDemo() {
  return (
    <svg aria-hidden viewBox="0 0 300 96" fill="none" className="w-full h-24">
      <path d="M16 80C80 80 90 16 150 16S220 80 284 80" pathLength={1000} stroke="var(--violet)" strokeWidth={1.5} className="curve" />
      <path d="M16 80H80M284 80H220M150 16H96M150 16H204" stroke="var(--wire)" />
      {[[16, 80], [150, 16], [284, 80]].map(([x, y]) => (
        <rect key={x} x={x - 4} y={y - 4} width="8" height="8" fill="var(--canvas)" stroke="var(--accent)" />
      ))}
    </svg>
  );
}
