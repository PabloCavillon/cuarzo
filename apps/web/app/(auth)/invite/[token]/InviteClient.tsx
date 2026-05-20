"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Users2, ShieldCheck, User } from "lucide-react";

const inputCls =
  "bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#4f8ef7]/50 focus:ring-1 focus:ring-[#4f8ef7]/30 transition";

const ROLE_LABEL: Record<string, string> = { admin: "Admin", staff: "Staff", owner: "Owner" };
const ROLE_ICON:  Record<string, React.ComponentType<{ className?: string }>> = {
  admin: ShieldCheck,
  staff: User,
};

export function InviteClient({
  token,
  email,
  role,
  tenantName,
}: {
  token:      string;
  email:      string;
  role:       string;
  tenantName: string;
}) {
  const [name,     setName]     = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const RoleIcon = ROLE_ICON[role] ?? User;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) { setError("Las contraseñas no coinciden"); return; }
    if (password.length < 8)  { setError("La contraseña debe tener al menos 8 caracteres"); return; }

    setLoading(true);

    const res = await fetch("/api/auth/accept-invite", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ token, name, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? "Error al aceptar la invitación");
      return;
    }

    const login = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (login?.error) {
      setError("Cuenta creada, pero no se pudo iniciar sesión. Intentá desde /login.");
    } else {
      window.location.href = "/admin";
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Header */}
      <div className="text-center mb-2">
        <div className="w-12 h-12 rounded-2xl bg-white/8 flex items-center justify-center mx-auto mb-3">
          <Users2 className="w-5 h-5 text-white/50" />
        </div>
        <h1 className="text-xl font-semibold text-white">Unirte a {tenantName}</h1>
        <div className="flex items-center justify-center gap-1.5 mt-1.5">
          <RoleIcon className="w-3.5 h-3.5 text-white/40" />
          <span className="text-xs text-white/40">{ROLE_LABEL[role] ?? role} · {email}</span>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-xs text-white/60 font-medium">Tu nombre</label>
        <input
          type="text" required minLength={2} maxLength={100}
          value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Nombre completo" className={inputCls}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-white/60 font-medium">Email</label>
        <input
          type="email" value={email} readOnly
          className={inputCls + " opacity-50 cursor-not-allowed"}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-white/60 font-medium">Contraseña</label>
        <input
          type="password" required minLength={8} maxLength={128}
          value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 8 caracteres" className={inputCls}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-white/60 font-medium">Confirmar contraseña</label>
        <input
          type="password" required maxLength={128}
          value={confirm} onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repetí la contraseña" className={inputCls}
        />
      </div>

      <button
        type="submit" disabled={loading}
        className="mt-2 bg-[#4f8ef7] hover:bg-[#3a7ae0] disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-2.5 text-sm transition"
      >
        {loading ? "Creando cuenta…" : "Crear cuenta y entrar"}
      </button>
    </form>
  );
}
