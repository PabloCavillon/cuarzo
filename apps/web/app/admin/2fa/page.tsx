"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Loader2, Mail, Smartphone, RotateCcw } from "lucide-react";
import { CuarzoIsotype } from "@/app/components/CuarzoLogo";

export default function TwoFaPage() {
  const router = useRouter();
  const [method,   setMethod]   = useState<"totp" | "email" | null>(null);
  const [code,     setCode]     = useState("");
  const [loading,  setLoading]  = useState(false);
  const [sending,  setSending]  = useState(false);
  const [error,    setError]    = useState("");
  const [sent,     setSent]     = useState(false);

  useEffect(() => {
    fetch("/api/admin/2fa/method")
      .then((r) => r.json())
      .then((d) => {
        setMethod(d.method);
        if (d.method === "email") sendOtp();
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendOtp() {
    setSending(true);
    await fetch("/api/admin/2fa/send-otp", { method: "POST" });
    setSending(false);
    setSent(true);
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res  = await fetch("/api/admin/2fa/verify", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ code }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Incorrect code.");
      setCode("");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <CuarzoIsotype height={28} />
          <div className="flex items-center gap-2 mt-4">
            <Shield className="w-4 h-4 text-white/50" />
            <h1 className="text-sm font-bold tracking-wide text-white">Verificación en 2 pasos</h1>
          </div>
          <p className="text-xs text-white/30 mt-1 text-center">
            {method === "totp"
              ? "Enter the code from your authenticator app"
              : method === "email"
              ? "We sent a code to your email"
              : "Loading…"}
          </p>
        </div>

        <div className="bg-white/4 border border-white/10 rounded-2xl p-6 space-y-4">
          {method === "email" && (
            <div className="flex items-center gap-2 text-xs text-white/40 bg-white/5 rounded-xl px-3 py-2">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              {sending ? "Sending code…" : sent ? "Code sent — check your email" : ""}
            </div>
          )}
          {method === "totp" && (
            <div className="flex items-center gap-2 text-xs text-white/40 bg-white/5 rounded-xl px-3 py-2">
              <Smartphone className="w-3.5 h-3.5 shrink-0" />
              Use your Google Authenticator / Authy app
            </div>
          )}

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-center">
              {error}
            </p>
          )}

          <form onSubmit={verify} className="space-y-3">
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
              className="w-full flex items-center justify-center gap-2 py-3 bg-white/12 hover:bg-white/18 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-40"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              Verificar
            </button>
          </form>

          {method === "email" && sent && (
            <button
              onClick={sendOtp}
              disabled={sending}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reenviar código
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
