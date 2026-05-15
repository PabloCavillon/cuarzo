"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Shield, Smartphone, AlertCircle } from "lucide-react";
import { CuarzoIsotype } from "@/app/components/CuarzoLogo";
import Link from "next/link";

export default function SuperAdminLogin() {
  const router = useRouter();
  const [code,    setCode]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res  = await fetch("/api/super-admin/auth", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ code }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Error de autenticación.");
      setCode("");
      return;
    }
    router.push("/super-admin");
  }

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <CuarzoIsotype height={32} />
          <div className="flex items-center gap-2 mt-4">
            <Shield className="w-4 h-4 text-amber-400" />
            <h1 className="text-sm font-bold tracking-widest text-white/80 uppercase">Panel Restringido</h1>
          </div>
          <p className="text-xs text-white/30 mt-1">Verificación con autenticador</p>
        </div>

        <div className="bg-white/4 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs text-white/40 bg-white/5 rounded-xl px-3 py-2">
            <Smartphone className="w-3.5 h-3.5 shrink-0" />
            Ingresá el código de Google Authenticator / Authy
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-3">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              required
              autoFocus
              autoComplete="one-time-code"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xl text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/40 transition-colors text-center tracking-[0.5em] font-mono"
            />
            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-400 text-sm font-semibold rounded-xl transition-colors disabled:opacity-40"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              Verificar acceso
            </button>
          </form>

          <p className="text-center text-[10px] text-white/20">
            Primera vez?{" "}
            <Link href="/super-admin/setup" className="text-amber-400/60 hover:text-amber-400 transition-colors">
              Configurar autenticador →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
