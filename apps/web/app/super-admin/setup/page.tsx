import { redirect } from "next/navigation";
import { requireSuperAdmin, apiError } from "@/lib/auth/session";
import { generateTotpSecret, getTotpUri } from "@/lib/auth/totp";
import { CuarzoIsotype } from "@/app/components/CuarzoLogo";
import { Shield, Smartphone, Key, AlertTriangle, ExternalLink } from "lucide-react";
import Link from "next/link";

export default async function SuperAdminSetupPage() {
  try { await requireSuperAdmin(); } catch (e) {
    void apiError(e); redirect("/login");
  }

  const existingSecret = process.env.SUPER_ADMIN_TOTP_SECRET;
  const secret = existingSecret ?? generateTotpSecret();
  const uri    = getTotpUri(secret, "Cuarzo Super Admin", "Cuarzo");
  const isNew  = !existingSecret;

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="flex flex-col items-center mb-8">
          <CuarzoIsotype height={32} />
          <div className="flex items-center gap-2 mt-4">
            <Shield className="w-4 h-4 text-amber-400" />
            <h1 className="text-sm font-bold tracking-widest text-white/80 uppercase">Configurar Autenticador</h1>
          </div>
        </div>

        <div className="space-y-4">
          {isNew && (
            <div className="flex gap-3 bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-400">Guardá este secret en tu .env</p>
                <p className="text-xs text-amber-400/70 mt-1">
                  Agregá <code className="bg-amber-500/15 px-1 rounded">SUPER_ADMIN_TOTP_SECRET=…</code> en Vercel y en tu .env local.
                  Si no lo guardás, el autenticador dejará de funcionar.
                </p>
              </div>
            </div>
          )}

          {/* Secret key */}
          <div className="bg-white/4 border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-white/40" />
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Secret Key</p>
            </div>
            <div className="bg-black/30 rounded-xl px-4 py-3 font-mono text-sm text-amber-300 break-all select-all text-center tracking-widest">
              {secret}
            </div>
            <p className="text-[11px] text-white/30">
              Copiá este valor y guardalo en <code className="text-white/50">SUPER_ADMIN_TOTP_SECRET</code> en tus variables de entorno.
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-white/4 border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-white/40" />
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Configurar en tu celular</p>
            </div>

            <ol className="space-y-3 text-xs text-white/60">
              <li className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-white/8 flex items-center justify-center text-[10px] font-bold text-white shrink-0">1</span>
                Instalá <strong className="text-white/80">Google Authenticator</strong> o <strong className="text-white/80">Authy</strong> en tu celular
              </li>
              <li className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-white/8 flex items-center justify-center text-[10px] font-bold text-white shrink-0">2</span>
                Abrí la app, tocá <strong className="text-white/80">+</strong> → <strong className="text-white/80">Ingresá una clave de configuración</strong>
              </li>
              <li className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-white/8 flex items-center justify-center text-[10px] font-bold text-white shrink-0">3</span>
                Nombre de cuenta: <code className="bg-white/8 px-1.5 py-0.5 rounded text-white/70">Cuarzo Super Admin</code>
              </li>
              <li className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-white/8 flex items-center justify-center text-[10px] font-bold text-white shrink-0">4</span>
                Clave: pegá el <strong className="text-white/80">Secret Key</strong> de arriba. Tipo: <strong className="text-white/80">Basado en tiempo</strong>
              </li>
              <li className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-white/8 flex items-center justify-center text-[10px] font-bold text-white shrink-0">5</span>
                ¡Listo! La app genera un código nuevo cada 30 segundos
              </li>
            </ol>

            <a
              href={uri}
              className="flex items-center gap-2 text-xs text-amber-400/70 hover:text-amber-400 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Abrir link de configuración en el autenticador
            </a>
          </div>

          <Link
            href="/super-admin/login"
            className="flex items-center justify-center gap-2 w-full py-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-400 text-sm font-semibold rounded-xl transition-colors"
          >
            <Shield className="w-4 h-4" />
            Ir al login del panel
          </Link>
        </div>
      </div>
    </div>
  );
}
