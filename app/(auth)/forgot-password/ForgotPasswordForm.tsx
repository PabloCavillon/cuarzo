"use client";

import { useState } from "react";
import Link from "next/link";

const inputCls =
  "bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#4f8ef7]/50 focus:ring-1 focus:ring-[#4f8ef7]/30 transition";

export default function ForgotPasswordForm() {
  const [email,   setEmail]   = useState("");
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res  = await fetch("/api/auth/forgot-password", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Error al enviar el email.");
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="text-4xl">📬</div>
        <h1 className="text-xl font-semibold text-white">Email enviado</h1>
        <p className="text-sm text-white/50 leading-relaxed">
          Si el email está registrado, vas a recibir un enlace para restablecer tu contraseña en los próximos minutos.
        </p>
        <Link href="/login" className="block text-xs text-[#4f8ef7] hover:underline mt-4">
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="text-center mb-2">
        <h1 className="text-xl font-semibold text-white">¿Olvidaste tu contraseña?</h1>
        <p className="text-xs text-white/40 mt-1 leading-relaxed">
          Ingresá tu email y te enviamos un enlace para restablecerla.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-xs text-white/60 font-medium" htmlFor="email">Email</label>
        <input
          id="email" type="email" autoComplete="email" required maxLength={254}
          value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com" className={inputCls}
        />
      </div>

      <button
        type="submit" disabled={loading}
        className="mt-2 bg-[#4f8ef7] hover:bg-[#3a7ae0] disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-2.5 text-sm transition"
      >
        {loading ? "Enviando…" : "Enviar enlace"}
      </button>

      <p className="text-center text-xs text-white/40 mt-2">
        <Link href="/login" className="text-[#4f8ef7] hover:underline">
          Volver al inicio de sesión
        </Link>
      </p>
    </form>
  );
}
