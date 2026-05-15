"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Loader2, RotateCcw, CheckCircle2, AlertCircle } from "lucide-react";
import { CuarzoIsotype } from "@/app/components/CuarzoLogo";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email,     setEmail]     = useState("");
  const [code,      setCode]      = useState("");
  const [loading,   setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [resent,    setResent]    = useState(false);
  const [error,     setError]     = useState("");
  const [done,      setDone]      = useState(false);

  useEffect(() => {
    fetch("/api/auth/session-email")
      .then((r) => r.json())
      .then((d) => { if (d.email) setEmail(d.email); })
      .catch(() => {});
  }, []);

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");

    const res  = await fetch("/api/auth/verify-email-code", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, code }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Código incorrecto.");
      return;
    }

    setDone(true);
    setTimeout(() => { router.push("/admin"); router.refresh(); }, 1500);
  }

  async function resendCode() {
    setResending(true);
    await fetch("/api/auth/resend-verify-code", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email }),
    });
    setResending(false);
    setResent(true);
    setTimeout(() => setResent(false), 5000);
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          <p className="text-white font-semibold">Email verificado. Redirigiendo…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <CuarzoIsotype height={28} />
          <div className="w-12 h-12 rounded-full bg-[#4f8ef7]/15 flex items-center justify-center mt-5">
            <Mail className="w-5 h-5 text-[#4f8ef7]" />
          </div>
          <h1 className="text-lg font-bold text-white mt-3">Verificá tu email</h1>
          <p className="text-xs text-white/40 mt-1 text-center">
            {email
              ? <>Ingresá el código que enviamos a <strong className="text-white/60">{email}</strong></>
              : "Ingresá tu email y el código de verificación"}
          </p>
        </div>

        <div className="bg-white/4 border border-white/10 rounded-2xl p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
            </div>
          )}
          {resent && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" /> Código reenviado
            </div>
          )}

          <form onSubmit={verify} className="space-y-3">
            {!email && (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/30 transition-colors"
              />
            )}
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              autoFocus
              autoComplete="one-time-code"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xl text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors text-center tracking-[0.5em] font-mono"
            />
            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#4f8ef7] hover:bg-[#3a7ae0] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-40"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Verificar email
            </button>
          </form>

          {email && (
            <button
              onClick={resendCode}
              disabled={resending}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {resending ? "Reenviando…" : "Reenviar código"}
            </button>
          )}
          <p className="text-center text-[10px] text-white/20">Revisá también tu carpeta de spam.</p>
        </div>
      </div>
    </div>
  );
}
