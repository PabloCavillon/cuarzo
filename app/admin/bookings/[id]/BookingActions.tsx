"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { confirmBooking, cancelBooking, markNoShow } from "../actions";

type Status = "confirmed" | "cancelled" | "no_show";
type ActionFn = (id: string) => Promise<{ ok: true } | { ok: false; error: string }>;

export function BookingActions({ id, status }: { id: string; status: Status }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(action: ActionFn) {
    setError(null);
    startTransition(async () => {
      const result = await action(id);
      if (!result.ok) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Acciones</h3>

      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        {status !== "confirmed" && (
          <button
            disabled={isPending}
            onClick={() => run(confirmBooking)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-sm rounded-xl transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Confirmar
          </button>
        )}
        {status !== "cancelled" && (
          <button
            disabled={isPending}
            onClick={() => run(cancelBooking)}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/15 hover:bg-red-500/25 text-red-400 text-sm rounded-xl transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Cancelar
          </button>
        )}
        {status !== "no_show" && (
          <button
            disabled={isPending}
            onClick={() => run(markNoShow)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 text-sm rounded-xl transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertCircle className="w-4 h-4" />}
            No asistió
          </button>
        )}
      </div>
    </div>
  );
}
