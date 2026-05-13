"use client";

import { useRef, useState, useCallback } from "react";
import QRCode from "react-qr-code";
import { Copy, Check, Download, ExternalLink, Store } from "lucide-react";

export function MiTiendaWidget({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const storeUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/tienda/${slug}`
      : `/tienda/${slug}`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/tienda/${slug}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select the text
    }
  }, [slug]);

  const handleDownload = useCallback(() => {
    const svgEl = qrRef.current?.querySelector("svg");
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement("canvas");
    const size = 512;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      const link = document.createElement("a");
      link.download = `qr-tienda-${slug}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  }, [slug]);

  return (
    <div className="bg-white/5 border border-white/8 rounded-2xl p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-white/40" />
          <p className="text-sm font-semibold text-white">Mi tienda pública</p>
        </div>
        <a
          href={`/tienda/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors"
        >
          Abrir
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="flex flex-col sm:flex-row gap-5 items-start">
        {/* QR code */}
        <div
          ref={qrRef}
          className="bg-white rounded-xl p-3 shrink-0"
        >
          <QRCode
            value={storeUrl}
            size={120}
            bgColor="#ffffff"
            fgColor="#0f172a"
            level="M"
          />
        </div>

        {/* URL + actions */}
        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1.5">
              Link de tu tienda
            </p>
            <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-3 py-2">
              <span className="text-xs text-white/60 truncate flex-1 font-mono">
                /tienda/{slug}
              </span>
              <button
                onClick={handleCopy}
                className="shrink-0 text-white/40 hover:text-white transition-colors"
                title="Copiar URL"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-2 bg-white/8 hover:bg-white/12 text-white/60 hover:text-white rounded-xl transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar QR (PNG)
            </button>
            <a
              href={`/tienda/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs px-3 py-2 bg-white/8 hover:bg-white/12 text-white/60 hover:text-white rounded-xl transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ver catálogo
            </a>
          </div>

          <p className="text-[10px] text-white/25 leading-relaxed">
            Compartí este link o QR con tus clientes para que puedan ver tu catálogo de productos.
          </p>
        </div>
      </div>
    </div>
  );
}
