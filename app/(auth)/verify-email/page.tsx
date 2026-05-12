"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyEmailContent() {
  const params = useSearchParams();
  const error  = params.get("error");

  const [resending,       setResending]       = useState(false);
  const [resendSuccess,   setResendSuccess]   = useState(false);
  const [resendError,     setResendError]     = useState("");

  // Auto-scroll to top on mount
  useEffect(() => { window.scrollTo(0, 0); }, []);

  async function handleResend() {
    setResending(true);
    setResendError("");
    const res = await fetch("/api/auth/resend-verification", { method: "POST" });
    setResending(false);
    if (res.ok) setResendSuccess(true);
    else        setResendError("No se pudo reenviar el email. Intentá de nuevo.");
  }

  const errorMessages: Record<string, string> = {
    missing: "El enlace de verificación es inválido.",
    invalid: "Este enlace no es válido o ya fue utilizado.",
    expired: "Este enlace expiró. Solicitá uno nuevo.",
  };

  if (error) {
    return (
      <div className="text-center space-y-4">
        <div className="text-4xl">⚠️</div>
        <h1 className="text-xl font-semibold text-white">Verificación fallida</h1>
        <p className="text-sm text-white/50">{errorMessages[error] ?? "Error inesperado."}</p>
        {error === "expired" && (
          <button
            onClick={handleResend}
            disabled={resending || resendSuccess}
            className="mt-2 bg-[#4f8ef7] hover:bg-[#3a7ae0] disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-2.5 text-sm transition"
          >
            {resending ? "Enviando…" : resendSuccess ? "¡Email enviado!" : "Reenviar email"}
          </button>
        )}
        {resendError && <p className="text-xs text-red-400">{resendError}</p>}
        <Link href="/admin" className="block text-xs text-[#4f8ef7] hover:underline mt-2">
          Ir al panel
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <div className="text-4xl">📧</div>
      <h1 className="text-xl font-semibold text-white">Verificá tu email</h1>
      <p className="text-sm text-white/50 leading-relaxed">
        Te enviamos un enlace de verificación. Revisá tu bandeja de entrada y hacé clic en el enlace.
      </p>
      <p className="text-xs text-white/30">¿No lo recibiste?</p>

      {resendSuccess ? (
        <p className="text-sm text-emerald-400">¡Email reenviado! Revisá tu bandeja.</p>
      ) : (
        <button
          onClick={handleResend}
          disabled={resending}
          className="text-xs text-[#4f8ef7] hover:underline disabled:opacity-50"
        >
          {resending ? "Enviando…" : "Reenviar email de verificación"}
        </button>
      )}

      {resendError && <p className="text-xs text-red-400">{resendError}</p>}

      <Link href="/admin" className="block text-xs text-white/30 hover:text-white mt-4 transition-colors">
        Continuar sin verificar →
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
