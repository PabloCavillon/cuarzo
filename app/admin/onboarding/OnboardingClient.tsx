"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle } from "lucide-react";
import { FREE_MODULE_INFO, FREE_MODULE_MAX } from "@/lib/utils/module-catalog";

type Step = 1 | 2 | 3;

const STEP_LABELS: Record<Step, string> = {
  1: "Bienvenida",
  2: "Módulos",
  3: "Listo",
};

function StepDot({ n, current, isFree }: { n: Step; current: Step; isFree: boolean }) {
  if (!isFree && n === 2) return null;
  const done   = current > n;
  const active = current === n;
  return (
    <div className="flex items-center gap-2">
      {done
        ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        : <Circle className={`w-5 h-5 shrink-0 ${active ? "text-[#4f8ef7]" : "text-white/20"}`} />}
      <span className={`text-xs font-medium ${active ? "text-white" : done ? "text-white/60" : "text-white/25"}`}>
        {STEP_LABELS[n]}
      </span>
    </div>
  );
}

export default function OnboardingClient({ plan }: { plan: string }) {
  const router  = useRouter();
  const isFree  = plan === "free";

  const [step,    setStep]    = useState<Step>(1);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  function toggleModule(slug: string) {
    setSelected((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= FREE_MODULE_MAX) return prev;
      return [...prev, slug];
    });
  }

  async function completeOnboarding() {
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/onboarding-complete", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ modules: selected }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { error?: string }).error ?? "Error al guardar.");
      setSaving(false);
      return;
    }
    router.push("/admin");
  }

  const totalSteps: Step[] = isFree ? [1, 2, 3] : [1, 3];

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
          <StepDot n={1} current={step} isFree={isFree} />
          {isFree && (
            <>
              <div className="flex-1 h-px bg-white/10 max-w-12" />
              <StepDot n={2} current={step} isFree={isFree} />
            </>
          )}
          <div className="flex-1 h-px bg-white/10 max-w-12" />
          <StepDot n={3} current={step} isFree={isFree} />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-xl font-bold text-white">¡Bienvenido a Cuarzo! 🎉</h1>
                <p className="text-sm text-white/50 mt-2 leading-relaxed">
                  Tu workspace está listo.{" "}
                  {isFree
                    ? "En el siguiente paso elegís los módulos que mejor se adaptan a tu negocio."
                    : "Tu cuenta ya tiene todos los módulos de tu plan activos."}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 space-y-2">
                {[
                  "Panel de administración completo",
                  "Notificaciones por email automáticas",
                  isFree ? "Plan gratuito sin límite de tiempo" : `Plan ${plan} con todos los módulos incluidos`,
                  "Soporte técnico directo",
                ].map((feat) => (
                  <div key={feat} className="flex items-start gap-2 text-sm text-white/60">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    {feat}
                  </div>
                ))}
              </div>
              <button
                onClick={() => isFree ? setStep(2) : setStep(3)}
                className="w-full bg-[#4f8ef7] hover:bg-[#3a7ae0] text-white font-semibold rounded-lg px-4 py-2.5 text-sm transition"
              >
                {isFree ? "Elegir módulos →" : "Ir al panel →"}
              </button>
            </div>
          )}

          {/* Step 2: Module picker (free only) */}
          {step === 2 && isFree && (
            <div className="space-y-5">
              <div>
                <h1 className="text-xl font-bold text-white">Elegí tus módulos</h1>
                <p className="text-sm text-white/50 mt-2 leading-relaxed">
                  Con el plan gratuito podés activar hasta{" "}
                  <span className="text-white font-semibold">{FREE_MODULE_MAX} módulos</span>.
                  Podés cambiarlos más adelante desde Configuración.
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div className="space-y-2">
                {Object.entries(FREE_MODULE_INFO).map(([slug, info]) => {
                  const active = selected.includes(slug);
                  const maxed  = !active && selected.length >= FREE_MODULE_MAX;
                  return (
                    <button
                      key={slug}
                      onClick={() => !maxed && toggleModule(slug)}
                      disabled={maxed}
                      className={`w-full text-left flex items-start gap-3 p-4 rounded-xl border transition-all ${
                        active
                          ? "bg-[#4f8ef7]/15 border-[#4f8ef7]/40"
                          : maxed
                            ? "bg-white/2 border-white/5 opacity-40 cursor-not-allowed"
                            : "bg-white/4 border-white/10 hover:bg-white/8 hover:border-white/20"
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        active ? "bg-[#4f8ef7] border-[#4f8ef7]" : "border-white/20"
                      }`}>
                        {active && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8">
                            <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-white">{info.label}</p>
                          <span className="text-[10px] text-white/30 font-mono shrink-0">{info.limitNote}</span>
                        </div>
                        <p className="text-xs text-white/45 mt-0.5">{info.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-white/30">
                  {selected.length}/{FREE_MODULE_MAX} seleccionados
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="text-white/40 hover:text-white border border-white/10 hover:border-white/20 rounded-lg px-4 py-2.5 text-sm transition"
                  >
                    Atrás
                  </button>
                  <button
                    onClick={() => {
                      if (selected.length === 0) {
                        setError("Elegí al menos un módulo para continuar.");
                        return;
                      }
                      setError("");
                      setStep(3);
                    }}
                    className="bg-[#4f8ef7] hover:bg-[#3a7ae0] text-white font-semibold rounded-lg px-4 py-2.5 text-sm transition"
                  >
                    Continuar →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Done */}
          {step === 3 && (
            <div className="space-y-6 text-center">
              <div className="text-6xl">🚀</div>
              <div>
                <h1 className="text-xl font-bold text-white">¡Todo listo!</h1>
                <p className="text-sm text-white/50 mt-2 leading-relaxed">
                  {selected.length > 0
                    ? `Activamos: ${selected.map((s) => FREE_MODULE_INFO[s]?.label ?? s).join(" · ")}.`
                    : "Tu workspace está configurado."}
                  {" "}Podés ajustar todo desde la configuración.
                </p>
              </div>
              {error && (
                <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <div className="flex gap-3">
                {isFree && (
                  <button
                    onClick={() => { setError(""); setStep(2); }}
                    className="flex-1 text-white/40 hover:text-white border border-white/10 hover:border-white/20 rounded-lg px-4 py-2.5 text-sm transition"
                  >
                    Atrás
                  </button>
                )}
                <button
                  onClick={completeOnboarding}
                  disabled={saving}
                  className="flex-1 bg-[#4f8ef7] hover:bg-[#3a7ae0] disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-2.5 text-sm transition"
                >
                  {saving ? "Ingresando…" : "Ir al panel →"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
