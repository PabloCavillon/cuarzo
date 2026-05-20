"use client";

import Link from "next/link";
import { FileText, Plus, Settings, Receipt, AlertTriangle } from "lucide-react";

const TIPO_LABEL: Record<string, string> = {
  A: "FA",
  B: "FB",
  C: "FC",
  M: "FM",
  X: "FX",
};

type InvoiceRow = {
  id: string;
  tipoComprobante: string;
  puntoVenta: number;
  numero: number;
  fecha: string;
  receptorNombre: string | null;
  receptorDocNro: string;
  amount: string;
  cae: string;
  caeVto: string;
  environment: string;
};

function formatPv(pv: number) { return String(pv).padStart(4, "0"); }
function formatNro(n: number) { return String(n).padStart(8, "0"); }

function isExpired(caeVto: string) {
  return new Date(caeVto) < new Date();
}

export function InvoiceListClient({
  invoices,
  hasConfig,
  production,
}: {
  invoices: InvoiceRow[];
  hasConfig: boolean;
  production: boolean;
}) {
  return (
    <div className="space-y-5">
      {!hasConfig && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl px-5 py-4 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="text-sm text-amber-300">
            Configurá los datos fiscales antes de emitir comprobantes.{" "}
            <Link href="/admin/billing/settings" className="underline underline-offset-2">
              Ir a configuración
            </Link>
          </p>
        </div>
      )}

      {!production && hasConfig && (
        <p className="text-xs text-white/30 bg-white/5 border border-white/8 rounded-xl px-3 py-2">
          Modo homologación — los comprobantes emitidos son de prueba y no tienen validez fiscal.
        </p>
      )}

      <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <h3 className="text-sm font-semibold text-white">
            Comprobantes
            <span className="ml-2 text-xs font-normal text-white/30">
              {invoices.length} registro{invoices.length !== 1 ? "s" : ""}
            </span>
          </h3>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/billing/settings"
              className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-colors"
              title="Configuración"
            >
              <Settings className="w-3.5 h-3.5" />
            </Link>
            {hasConfig && (
              <Link
                href="/admin/billing/new"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Emitir
              </Link>
            )}
          </div>
        </div>

        {invoices.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-8 h-8 text-white/15 mx-auto mb-3" />
            <p className="text-sm text-white/25 mb-4">Aún no hay comprobantes emitidos</p>
            {hasConfig && (
              <Link
                href="/admin/billing/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm rounded-xl transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Emitir primer comprobante
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {invoices.map((inv) => {
              const expired = isExpired(inv.caeVto);
              return (
                <div key={inv.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-9 h-9 rounded-xl bg-white/8 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-white/60">
                      {TIPO_LABEL[inv.tipoComprobante] ?? inv.tipoComprobante}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-white font-mono">
                        {formatPv(inv.puntoVenta)}-{formatNro(inv.numero)}
                      </p>
                      {inv.environment === "test" && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 shrink-0">
                          TEST
                        </span>
                      )}
                      {expired && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 shrink-0">
                          CAE VTO
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/35 flex-wrap">
                      {inv.receptorNombre && (
                        <span className="flex items-center gap-1">
                          <Receipt className="w-3 h-3" />
                          {inv.receptorNombre}
                        </span>
                      )}
                      <span className="font-mono text-white/25">{inv.cae}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-white">
                      $ {parseFloat(inv.amount).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-white/30">
                      {inv.fecha
                        ? `${inv.fecha.slice(6, 8)}/${inv.fecha.slice(4, 6)}/${inv.fecha.slice(0, 4)}`
                        : new Date(inv.caeVto).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
