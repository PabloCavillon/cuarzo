"use client";

import { useT } from "@/lib/i18n/provider";

function Run({ items, hidden }: { items: string[]; hidden?: boolean }) {
  return (
    <ul aria-hidden={hidden} className="flex shrink-0">
      {items.map((item) => <li key={item} className="ticker-item">{item}</li>)}
    </ul>
  );
}

export default function Ticker() {
  const t = useT();

  return (
    <div className="ticker loops">
      <div className="ticker-track">
        <Run items={t.ticker} />
        <Run items={t.ticker} hidden />
      </div>
    </div>
  );
}
