"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const inputCls =
  "bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#4f8ef7]/50 focus:ring-1 focus:ring-[#4f8ef7]/30 transition";

export default function ResetPasswordForm() {
  const params  = useSearchParams();
  const token   = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState(false);
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) { setError("Las contraseñas no coinciden."); return; }
    if (password.length < 8)  { setError("Mínimo 8 caracteres."); return; }
    if (!token)                { setError("Token inválido. Solicitá un nuevo enlace."); return; }

    setLoading(true);
    const res  = await fetch("/api/auth/reset-password", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Error al restablecer la contraseña.");
    } else {
      setSuccess(true);
    }
  }

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <h1 className="text-xl font-semibold text-white">Enlace inválido</h1>
        <p className="text-sm text-white/50">Este enlace es inválido o ya fue utilizado.</p>
        <Link href="/forgot-password" className="text-xs text-[#4f8ef7] hover:underline block">
          Solicitar un nuevo enlace
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="text-4xl">✅</div>
        <h1 className="text-xl font-semibold text-white">Contraseña actualizada</h1>
        <p className="text-sm text-white/50">Tu contraseña fue restablecida correctamente.</p>
        <Link
          href="/login"
          className="block bg-[#4f8ef7] hover:bg-[#3a7ae0] text-white font-semibold rounded-lg px-4 py-2.5 text-sm transition text-center mt-4"
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-white text-center mb-2">Nueva contraseña</h1>

      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-xs text-white/60 font-medium" htmlFor="password">Nueva contraseña</label>
        <input
          id="password" type="password" autoComplete="new-password" required minLength={8} maxLength={128}
          value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 8 caracteres" className={inputCls}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-white/60 font-medium" htmlFor="confirm">Confirmar contraseña</label>
        <input
          id="confirm" type="password" autoComplete="new-password" required maxLength={128}
          value={confirm} onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repetí la contraseña" className={inputCls}
        />
      </div>

      <button
        type="submit" disabled={loading}
        className="mt-2 bg-[#4f8ef7] hover:bg-[#3a7ae0] disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-2.5 text-sm transition"
      >
        {loading ? "Guardando…" : "Guardar contraseña"}
      </button>
    </form>
  );
}
