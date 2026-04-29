"use client";

import { useActionState } from "react";
import { registerLead, type LeadState } from "@/actions";

const SERVICES = [
  { value: "WEB", label: "Desarrollo Web" },
  { value: "BRAND", label: "Diseño de Marca" },
  { value: "BOTH", label: "Ambos" },
] as const;

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm text-slate-400 mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

const inputClass =
  "w-full bg-white/4 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 focus:bg-white/6 transition-all";

export function LeadForm() {
  const [state, action, pending] = useActionState<LeadState, FormData>(
    registerLead,
    null
  );

  if (state?.success) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-blue-700/30 flex items-center justify-center mx-auto mb-5">
          <svg
            className="w-8 h-8 text-blue-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">¡Listo!</h3>
        <p className="text-slate-400">
          Recibí tu mensaje. Te contacto en las próximas 24 hs.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4 text-left">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Nombre *" error={state?.fieldErrors?.name}>
          <input
            name="name"
            type="text"
            placeholder="Juan García"
            required
            className={inputClass}
          />
        </Field>
        <Field label="Email *" error={state?.fieldErrors?.email}>
          <input
            name="email"
            type="email"
            placeholder="juan@negocio.com"
            required
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Nombre del negocio" error={state?.fieldErrors?.business}>
          <input
            name="business"
            type="text"
            placeholder="Mi Emprendimiento"
            className={inputClass}
          />
        </Field>
        <Field label="¿Qué necesitás? *" error={state?.fieldErrors?.service}>
          <select name="service" required className={inputClass} defaultValue="">
            <option value="" disabled className="bg-[#070e1f]">
              Elegí una opción
            </option>
            {SERVICES.map((s) => (
              <option key={s.value} value={s.value} className="bg-[#070e1f]">
                {s.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Contame tu proyecto" error={state?.fieldErrors?.message}>
        <textarea
          name="message"
          placeholder="¿Qué querés lograr? ¿Tenés alguna fecha límite?"
          rows={4}
          className={`${inputClass} resize-none`}
        />
      </Field>

      {state?.error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-4 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-500 transition-all hover:shadow-lg hover:shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {pending ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Enviando...
          </>
        ) : (
          "Enviar mensaje"
        )}
      </button>

      <p className="text-center text-xs text-slate-600">
        Sin compromiso · Te respondo en menos de 24 hs
      </p>
    </form>
  );
}
