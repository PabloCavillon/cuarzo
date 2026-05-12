"use client";

import { useRef, useState, useTransition } from "react";
import { Loader2, CheckCircle2, WifiOff, Wifi } from "lucide-react";
import { saveFiscalConfig, testAfipConnection } from "../actions";

type FiscalCfg = {
  cuit: string;
  ivaCondition: string;
  puntoVenta: number;
  production: boolean;
  afipCert: string | null;
  afipKey: string | null;
};

export function SettingsForm({ config }: { config: FiscalCfg | null }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending,  startTransition]  = useTransition();
  const [isTesting,  setTesting]       = useState(false);
  const [saved,      setSaved]         = useState(false);
  const [error,      setError]         = useState<string | null>(null);
  const [testResult, setTestResult]    = useState<{ ok: boolean; msg: string } | null>(null);
  const [production, setProduction]    = useState(config?.production ?? false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    fd.set("production", String(production));
    setError(null);
    setSaved(false);

    startTransition(async () => {
      const res = await saveFiscalConfig(fd);
      if (!res.ok) setError(res.error);
      else setSaved(true);
    });
  }

  function handleTest() {
    setTesting(true);
    setTestResult(null);
    testAfipConnection().then((res) => {
      setTestResult(res.ok
        ? { ok: true, msg: "Conexión AFIP exitosa — Ticket de Acceso obtenido" }
        : { ok: false, msg: res.error });
      setTesting(false);
    });
  }

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25";

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
          {error}
        </p>
      )}
      {saved && (
        <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Configuración guardada
        </p>
      )}

      {/* Basic */}
      <div className="bg-white/5 border border-white/8 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Datos fiscales</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">
              CUIT <span className="text-red-400/70">*</span>
            </label>
            <input name="cuit" defaultValue={config?.cuit ?? ""} required placeholder="20-12345678-1"
              className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">
              Punto de venta <span className="text-red-400/70">*</span>
            </label>
            <input name="puntoVenta" type="number" min={1} max={99999}
              defaultValue={config?.puntoVenta ?? 1} required className={inputCls} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5">
            Condición IVA <span className="text-red-400/70">*</span>
          </label>
          <select name="ivaCondition" defaultValue={config?.ivaCondition ?? "RI"}
            className={inputCls + " cursor-pointer"}>
            <option value="RI">Responsable Inscripto</option>
            <option value="MO">Monotributista</option>
            <option value="EX">Exento</option>
            <option value="CF">Consumidor Final</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-white/50 mb-2">Entorno</label>
          <div className="flex gap-3">
            {([false, true] as const).map((prod) => (
              <button
                key={String(prod)}
                type="button"
                onClick={() => setProduction(prod)}
                className={`flex-1 py-2.5 rounded-xl text-sm border transition-colors ${
                  production === prod
                    ? prod
                      ? "bg-red-500/15 border-red-500/30 text-red-300"
                      : "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                    : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                }`}
              >
                {prod ? "Producción" : "Homologación (test)"}
              </button>
            ))}
          </div>
          {production && (
            <p className="mt-2 text-xs text-red-400/70">
              En producción los comprobantes son reales y se emiten ante AFIP.
            </p>
          )}
        </div>
      </div>

      {/* Certificates */}
      <div className="bg-white/5 border border-white/8 rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Certificados AFIP</h3>
          <p className="text-xs text-white/35 mt-0.5">
            Pegue el contenido del archivo .crt y .key generado en el portal AFIP.
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5">Certificado (.crt)</label>
          <textarea name="afipCert" rows={5} defaultValue={config?.afipCert ?? ""}
            placeholder={"-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"}
            className={inputCls + " resize-none font-mono text-xs"} />
        </div>

        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5">Clave privada (.key)</label>
          <textarea name="afipKey" rows={5} defaultValue={config?.afipKey ?? ""}
            placeholder={"-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"}
            className={inputCls + " resize-none font-mono text-xs"} />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleTest}
          disabled={isTesting}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/8 hover:bg-white/12 text-white/60 hover:text-white text-sm rounded-xl transition-colors disabled:opacity-50"
        >
          {isTesting
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Wifi className="w-3.5 h-3.5" />}
          Probar conexión AFIP
        </button>

        <button
          type="submit"
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/20 text-white text-sm rounded-xl transition-colors disabled:opacity-50"
        >
          {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Guardar configuración
        </button>
      </div>

      {testResult && (
        <p className={`text-xs rounded-xl px-3 py-2 flex items-center gap-1.5 ${
          testResult.ok
            ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
            : "text-red-400 bg-red-500/10 border border-red-500/20"
        }`}>
          {testResult.ok ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          {testResult.msg}
        </p>
      )}
    </form>
  );
}
