"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Smartphone, Mail, Loader2, CheckCircle2, X, AlertCircle } from "lucide-react";

type Method = "totp" | "email";

const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/30 transition-colors";

// ─── SetupModal ───────────────────────────────────────────────────────────────

function SetupModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [step,    setStep]    = useState<"choose" | "totp-setup" | "totp-verify" | "email-confirm">("choose");
  const [method,  setMethod]  = useState<Method | null>(null);
  const [secret,  setSecret]  = useState("");
  const [code,    setCode]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function chooseMethod(m: Method) {
    setMethod(m);
    setError("");
    if (m === "totp") {
      setLoading(true);
      const res  = await fetch("/api/admin/2fa/setup");
      const data = await res.json();
      setLoading(false);
      setSecret(data.secret ?? "");
      setStep("totp-setup");
    } else {
      setStep("email-confirm");
    }
  }

  async function enableTotp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res  = await fetch("/api/admin/2fa/setup", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ method: "totp", code }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Error al verificar."); return; }
    onDone();
  }

  async function enableEmail() {
    setLoading(true);
    const res = await fetch("/api/admin/2fa/setup", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ method: "email" }),
    });
    setLoading(false);
    if (res.ok) onDone();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="bg-[#0d1b2e] border border-white/12 rounded-2xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-white/8">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-white/50" />
            <h3 className="text-sm font-bold text-white">Activar verificación en 2 pasos</h3>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
            </div>
          )}

          {/* Step 1: choose */}
          {step === "choose" && (
            <div className="space-y-3">
              <p className="text-xs text-white/50">Elegí un método para el segundo factor de autenticación.</p>
              <button
                onClick={() => chooseMethod("totp")}
                disabled={loading}
                className="w-full flex items-center gap-3 p-4 bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl transition-colors text-left"
              >
                <Smartphone className="w-5 h-5 text-white/50 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">App autenticadora</p>
                  <p className="text-xs text-white/40">Google Authenticator, Authy, etc.</p>
                </div>
              </button>
              <button
                onClick={() => chooseMethod("email")}
                className="w-full flex items-center gap-3 p-4 bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl transition-colors text-left"
              >
                <Mail className="w-5 h-5 text-white/50 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">Código por email</p>
                  <p className="text-xs text-white/40">Te enviamos un código cada vez que iniciás sesión</p>
                </div>
              </button>
            </div>
          )}

          {/* Step 2: TOTP setup */}
          {step === "totp-setup" && (
            <div className="space-y-4">
              <p className="text-xs text-white/50">
                Abrí <strong className="text-white/70">Google Authenticator</strong> o <strong className="text-white/70">Authy</strong>, tocá <strong className="text-white/70">+</strong> → <strong className="text-white/70">Ingresá una clave de configuración</strong>.
              </p>
              <div className="bg-black/30 rounded-xl px-4 py-3 font-mono text-sm text-amber-300 text-center tracking-widest select-all break-all">
                {secret}
              </div>
              <p className="text-[11px] text-white/30 text-center">
                Tipo de clave: <strong className="text-white/50">Basado en tiempo</strong>
              </p>
              <button
                onClick={() => setStep("totp-verify")}
                className="w-full py-2.5 text-sm bg-white/10 hover:bg-white/15 text-white rounded-xl transition-colors"
              >
                Ya lo configuré →
              </button>
            </div>
          )}

          {/* Step 3: TOTP verify */}
          {step === "totp-verify" && (
            <form onSubmit={enableTotp} className="space-y-3">
              <p className="text-xs text-white/50">Ingresá el código de 6 dígitos que muestra la app para confirmar.</p>
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
                className={`${inputCls} text-center text-xl tracking-[0.5em] font-mono`}
              />
              <button
                type="submit"
                disabled={loading || code.length < 6}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 rounded-xl transition-colors disabled:opacity-40"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Confirmar y activar
              </button>
            </form>
          )}

          {/* Email confirm */}
          {step === "email-confirm" && (
            <div className="space-y-3">
              <p className="text-xs text-white/50">
                A partir de ahora, cada vez que iniciés sesión te enviaremos un código de 6 dígitos a tu email.
              </p>
              <button
                onClick={enableEmail}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 rounded-xl transition-colors disabled:opacity-40"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Activar verificación por email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── TwoFaPanel ───────────────────────────────────────────────────────────────

export function TwoFaPanel({
  totpEnabled,
  twoFaMethod,
}: {
  totpEnabled:  boolean;
  twoFaMethod:  string | null;
}) {
  const router   = useRouter();
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);

  const methodLabel = twoFaMethod === "totp" ? "App autenticadora" : twoFaMethod === "email" ? "Email" : null;

  async function disable() {
    setLoading(true);
    await fetch("/api/admin/2fa/setup", { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <>
      {open && (
        <SetupModal
          onClose={() => setOpen(false)}
          onDone={() => { setOpen(false); router.refresh(); }}
        />
      )}

      <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2 rounded-lg ${totpEnabled ? "bg-emerald-500/15" : "bg-white/8"}`}>
              <Shield className={`w-4 h-4 ${totpEnabled ? "text-emerald-400" : "text-white/40"}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Verificación en 2 pasos</p>
              <p className="text-xs text-white/40 mt-0.5">
                {totpEnabled
                  ? <span className="text-emerald-400">Activa · {methodLabel}</span>
                  : "Desactivada — recomendamos activarla"}
              </p>
            </div>
          </div>
          {totpEnabled ? (
            <button
              onClick={disable}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 rounded-lg transition-colors disabled:opacity-40 shrink-0"
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
              Desactivar
            </button>
          ) : (
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 rounded-lg transition-colors shrink-0"
            >
              <Shield className="w-3 h-3" />
              Activar
            </button>
          )}
        </div>
      </div>
    </>
  );
}
