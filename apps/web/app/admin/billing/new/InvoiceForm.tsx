"use client";

import { useRef, useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Receipt } from "lucide-react";
import { createInvoice } from "../actions";

const IVA_RATES = [
  { label: "21%",    factor: 0.21 },
  { label: "10.5%",  factor: 0.105 },
  { label: "27%",    factor: 0.27 },
  { label: "0%",     factor: 0 },
];

const TIPOS = [
  { value: "A", label: "Factura A — Responsable Inscripto" },
  { value: "B", label: "Factura B — Consumidor Final" },
  { value: "C", label: "Factura C — Monotributista" },
];

const DOC_TIPOS = [
  { value: "99", label: "Consumidor Final" },
  { value: "80", label: "CUIT" },
  { value: "86", label: "CUIL" },
  { value: "96", label: "DNI" },
];

type Props = {
  puntoVenta: number;
  production: boolean;
};

export function InvoiceForm({ puntoVenta, production }: Props) {
  const router   = useRouter();
  const formRef  = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error,  setError]  = useState<string | null>(null);

  const [tipo,          setTipo]          = useState("B");
  const [docTipo,       setDocTipo]       = useState("99");
  const [ivaIdx,        setIvaIdx]        = useState(0);
  const [importeNeto,   setImporteNeto]   = useState("");
  const [importeIVA,    setImporteIVA]    = useState("0.00");
  const [importeTotal,  setImporteTotal]  = useState("0.00");

  useEffect(() => {
    const neto    = parseFloat(importeNeto) || 0;
    const iva     = parseFloat((neto * IVA_RATES[ivaIdx].factor).toFixed(2));
    setImporteIVA(iva.toFixed(2));
    setImporteTotal((neto + iva).toFixed(2));
  }, [importeNeto, ivaIdx]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    fd.set("importeIVA",   importeIVA);
    setError(null);

    startTransition(async () => {
      const res = await createInvoice(fd);
      if (!res.ok) setError(res.error);
      else router.push("/admin/billing");
    });
  }

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25";

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      {!production && (
        <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
          Modo homologación — los comprobantes no tienen validez fiscal real.
        </p>
      )}
      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <div className="bg-white/5 border border-white/8 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Comprobante</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Tipo</label>
            <select name="tipoComprobante" value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className={inputCls + " cursor-pointer"}>
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Concepto</label>
            <select name="concepto" defaultValue="1" className={inputCls + " cursor-pointer"}>
              <option value="1">Productos</option>
              <option value="2">Servicios</option>
              <option value="3">Productos y Servicios</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-white/30">
          <Receipt className="w-3.5 h-3.5" />
          Punto de venta {String(puntoVenta).padStart(4, "0")}
        </div>
      </div>

      <div className="bg-white/5 border border-white/8 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Receptor</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Tipo documento</label>
            <select name="receptorDocTipo" value={docTipo}
              onChange={(e) => setDocTipo(e.target.value)}
              className={inputCls + " cursor-pointer"}>
              {DOC_TIPOS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Número</label>
            <input name="receptorDocNro"
              defaultValue={docTipo === "99" ? "0" : ""}
              placeholder={docTipo === "99" ? "0" : "ej. 20-12345678-9"}
              className={inputCls} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5">Nombre / Razón social</label>
          <input name="receptorNombre"
            placeholder="e.g. Juan García"
            className={inputCls} />
        </div>
      </div>

      <div className="bg-white/5 border border-white/8 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Importes</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">
              Importe neto <span className="text-red-400/70">*</span>
            </label>
            <input
              name="importeNeto"
              type="number"
              min="0"
              step="0.01"
              value={importeNeto}
              onChange={(e) => setImporteNeto(e.target.value)}
              required
              placeholder="0.00"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Alícuota IVA</label>
            <select
              value={ivaIdx}
              onChange={(e) => setIvaIdx(Number(e.target.value))}
              className={inputCls + " cursor-pointer"}>
              {IVA_RATES.map((r, i) => (
                <option key={i} value={i}>{r.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-1 border-t border-white/8">
          <div>
            <p className="text-xs text-white/40 mb-0.5">IVA</p>
            <p className="text-sm text-white font-medium">$ {importeIVA}</p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-0.5">Total</p>
            <p className="text-lg text-white font-bold">$ {importeTotal}</p>
          </div>
        </div>

        <input type="hidden" name="importeIVA" value={importeIVA} />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2.5 bg-white/5 hover:bg-white/8 text-white/60 hover:text-white text-sm rounded-xl transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/20 text-white text-sm rounded-xl transition-colors disabled:opacity-50"
        >
          {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Emitir comprobante
        </button>
      </div>
    </form>
  );
}
