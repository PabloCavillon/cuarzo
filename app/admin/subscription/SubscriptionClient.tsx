"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, AlertTriangle, ExternalLink, Crown, Zap } from "lucide-react";
import { startSubscription, cancelSubscription } from "./actions";

type Plan = {
  id: string;
  slug: string;
  name: string;
  priceUSD: string;
  features: string[];
};

type CurrentSub = {
  status: string;
  planSlug: string;
  planName: string;
  mpCheckoutUrl: string | null;
  currentPeriodEnd: string | null;
  cancelledAt: string | null;
} | null;

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  authorized: { label: "Activa",     color: "text-emerald-400" },
  pending:    { label: "Pendiente",  color: "text-amber-400"   },
  paused:     { label: "Pausada",    color: "text-amber-400"   },
  cancelled:  { label: "Cancelada",  color: "text-red-400"     },
  expired:    { label: "Vencida",    color: "text-red-400"     },
};

function PlanCard({
  plan,
  isCurrent,
  currentStatus,
  onSelect,
  isPending,
}: {
  plan: Plan;
  isCurrent: boolean;
  currentStatus: string | null;
  onSelect: () => void;
  isPending: boolean;
}) {
  const price  = parseFloat(plan.priceUSD);
  const isFree = price === 0;
  const isPro  = plan.slug === "pro";

  return (
    <div className={`relative flex flex-col bg-white/5 border rounded-2xl p-5 transition-colors ${
      isPro
        ? "border-white/25 bg-white/8"
        : isCurrent && currentStatus === "authorized"
          ? "border-emerald-500/30"
          : "border-white/8"
    }`}>
      {isPro && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="flex items-center gap-1 px-2.5 py-0.5 bg-white text-black text-[10px] font-bold rounded-full">
            <Crown className="w-3 h-3" />
            POPULAR
          </span>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-sm font-bold text-white">{plan.name}</h3>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl font-bold text-white">
            {isFree ? "Gratis" : `$${price}`}
          </span>
          {!isFree && <span className="text-xs text-white/40">USD / mes</span>}
        </div>
      </div>

      <ul className="flex-1 space-y-2 mb-5">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-xs text-white/60">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>

      {isCurrent && currentStatus === "authorized" ? (
        <div className="text-center py-2 text-xs text-emerald-400 font-medium">
          Plan actual
        </div>
      ) : (
        <button
          onClick={onSelect}
          disabled={isPending}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${
            isPro
              ? "bg-white text-black hover:bg-white/90"
              : "bg-white/10 text-white hover:bg-white/15"
          }`}
        >
          {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {isFree ? "Comenzar gratis" : `Suscribirse — $${price}/mes`}
        </button>
      )}
    </div>
  );
}

export function SubscriptionClient({
  plans,
  current,
}: {
  plans: Plan[];
  current: CurrentSub;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error,     setError]        = useState<string | null>(null);
  const [selecting, setSelecting]    = useState<string | null>(null);

  function handleSelect(slug: string) {
    setSelecting(slug);
    setError(null);
    startTransition(async () => {
      const res = await startSubscription(slug);
      if (!res.ok) {
        setError(res.error);
        setSelecting(null);
      } else if (res.url.startsWith("http")) {
        window.location.href = res.url;
      } else {
        router.push(res.url);
        router.refresh();
      }
    });
  }

  function handleCancel() {
    if (!confirm("¿Cancelar la suscripción? El acceso se mantiene hasta fin del período.")) return;
    setError(null);
    startTransition(async () => {
      const res = await cancelSubscription();
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  const statusInfo = current ? STATUS_LABEL[current.status] : null;

  return (
    <div className="space-y-6">
      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}

      {/* Current subscription status */}
      {current && (
        <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs text-white/40 mb-0.5">Suscripción actual</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white">{current.planName}</p>
                {statusInfo && (
                  <span className={`text-xs font-medium ${statusInfo.color}`}>
                    · {statusInfo.label}
                  </span>
                )}
              </div>
              {current.currentPeriodEnd && (
                <p className="text-xs text-white/30 mt-0.5">
                  Próxima renovación:{" "}
                  {new Date(current.currentPeriodEnd).toLocaleDateString("es-AR", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {current.mpCheckoutUrl && current.status === "pending" && (
                <a
                  href={current.mpCheckoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/15 text-white text-xs rounded-xl transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Completar pago
                </a>
              )}
              {current.status === "authorized" && current.planSlug !== "free" && (
                <button
                  onClick={handleCancel}
                  disabled={isPending}
                  className="px-3 py-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 text-xs rounded-xl transition-colors disabled:opacity-40"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Plans grid */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-white/40" />
          <h3 className="text-sm font-semibold text-white">Planes disponibles</h3>
          <span className="text-xs text-white/30">· Precios en USD, facturado mensualmente</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrent={current?.planSlug === plan.slug}
              currentStatus={current?.status ?? null}
              onSelect={() => handleSelect(plan.slug)}
              isPending={isPending && selecting === plan.slug}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
