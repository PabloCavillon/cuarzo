"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle } from "lucide-react";

const inputCls =
  "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#4f8ef7]/50 focus:ring-1 focus:ring-[#4f8ef7]/30 transition";

type Step = 1 | 2 | 3;

function StepDot({ n, current }: { n: Step; current: Step }) {
  const done   = current > n;
  const active = current === n;
  return (
    <div className="flex items-center gap-2">
      {done
        ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        : <Circle className={`w-5 h-5 shrink-0 ${active ? "text-[#4f8ef7]" : "text-white/20"}`} />}
      <span className={`text-xs font-medium ${active ? "text-white" : done ? "text-white/60" : "text-white/25"}`}>
        {n === 1 && "Bienvenida"}
        {n === 2 && "Primer servicio"}
        {n === 3 && "Listo"}
      </span>
    </div>
  );
}

export default function OnboardingClient() {
  const router   = useRouter();
  const [step,   setStep]   = useState<Step>(1);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const [serviceName,     setServiceName]     = useState("");
  const [serviceDuration, setServiceDuration] = useState("30");
  const [servicePrice,    setServicePrice]    = useState("0");

  async function createService() {
    if (!serviceName.trim()) { setError("El nombre del servicio es requerido."); return; }
    setSaving(true);
    setError("");
    const fd = new FormData();
    fd.set("name",        serviceName.trim());
    fd.set("durationMin", serviceDuration);
    fd.set("price",       servicePrice);

    const res = await fetch("/api/admin/services", { method: "POST", body: fd });
    setSaving(false);
    if (res.ok) {
      setStep(3);
    } else {
      const data = await res.json().catch(() => ({}));
      setError((data as { error?: string }).error ?? "Error al crear el servicio.");
    }
  }

  async function completeOnboarding() {
    setSaving(true);
    await fetch("/api/admin/onboarding-complete", { method: "POST" });
    router.push("/admin");
  }

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <span className="text-2xl font-bold tracking-tight text-white">
            cuarzo<span className="text-[#4f8ef7]">.</span>
          </span>
          <p className="text-sm text-white/40 mt-2">Configuración inicial</p>
        </div>

        <div className="flex items-center gap-4 justify-center mb-8">
          <StepDot n={1} current={step} />
          <div className="flex-1 h-px bg-white/10 max-w-12" />
          <StepDot n={2} current={step} />
          <div className="flex-1 h-px bg-white/10 max-w-12" />
          <StepDot n={3} current={step} />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-xl font-bold text-white">¡Bienvenido a Cuarzo! 🎉</h1>
                <p className="text-sm text-white/50 mt-2 leading-relaxed">
                  Tu workspace está listo. En los próximos pasos vamos a configurar lo básico
                  para que puedas empezar a tomar turnos.
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 space-y-2">
                {[
                  "Turnera digital para que tus clientes reserven online",
                  "Panel de administración completo",
                  "Notificaciones por email automáticas",
                  "Sin límite de tiempo en el plan gratuito",
                ].map((feat) => (
                  <div key={feat} className="flex items-start gap-2 text-sm text-white/60">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    {feat}
                  </div>
                ))}
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full bg-[#4f8ef7] hover:bg-[#3a7ae0] text-white font-semibold rounded-lg px-4 py-2.5 text-sm transition"
              >
                Empezar configuración →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-xl font-bold text-white">Creá tu primer servicio</h1>
                <p className="text-sm text-white/50 mt-2 leading-relaxed">
                  Los servicios son lo que van a reservar tus clientes. Podés agregar más desde el panel.
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/60 font-medium">Nombre del servicio</label>
                  <input
                    type="text" required maxLength={80}
                    value={serviceName} onChange={(e) => setServiceName(e.target.value)}
                    placeholder="Ej: Corte de cabello" className={inputCls}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-white/60 font-medium">Duración (minutos)</label>
                    <select
                      value={serviceDuration} onChange={(e) => setServiceDuration(e.target.value)}
                      className={inputCls}
                    >
                      {[15, 20, 30, 45, 60, 90, 120].map((m) => (
                        <option key={m} value={m}>{m} min</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-white/60 font-medium">Precio (ARS)</label>
                    <input
                      type="number" min="0" step="100"
                      value={servicePrice} onChange={(e) => setServicePrice(e.target.value)}
                      placeholder="0 = gratis" className={inputCls}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 text-white/40 hover:text-white border border-white/10 hover:border-white/20 rounded-lg px-4 py-2.5 text-sm transition"
                >
                  Saltar
                </button>
                <button
                  onClick={createService}
                  disabled={saving}
                  className="flex-1 bg-[#4f8ef7] hover:bg-[#3a7ae0] disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-2.5 text-sm transition"
                >
                  {saving ? "Creando…" : "Crear servicio →"}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 text-center">
              <div className="text-6xl">🚀</div>
              <div>
                <h1 className="text-xl font-bold text-white">¡Todo listo!</h1>
                <p className="text-sm text-white/50 mt-2 leading-relaxed">
                  Tu turnera ya está configurada. Compartí el enlace público con tus clientes
                  para que puedan reservar.
                </p>
              </div>
              <button
                onClick={completeOnboarding}
                disabled={saving}
                className="w-full bg-[#4f8ef7] hover:bg-[#3a7ae0] disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-2.5 text-sm transition"
              >
                {saving ? "Ingresando…" : "Ir al panel →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
