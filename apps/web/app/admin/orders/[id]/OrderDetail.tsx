"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight, CheckCircle2, XCircle, Truck, Package2,
  RotateCcw, Loader2, CreditCard, Plus,
} from "lucide-react";
import { updateOrderStatus, registerPayment } from "../actions";

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderItem = {
  id: string;
  skuSnap: string;
  nameSnap: string;
  qty: number;
  unitPrice: string;
};

type PaymentRow = {
  id: string;
  amount: string;
  currency: string;
  method: string;
  status: string;
  createdAt: string;
};

type OrderProps = {
  id: string;
  status: string;
  subtotal: string;
  discount: string;
  tax: string;
  total: string;
  notes: string | null;
  createdAt: string;
  client: { name: string; email: string; phone: string | null };
  items: OrderItem[];
  payments: PaymentRow[];
};

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  draft:      "bg-white/8 text-white/40",
  confirmed:  "bg-blue-500/15 text-blue-300",
  processing: "bg-amber-500/15 text-amber-300",
  shipped:    "bg-purple-500/15 text-purple-300",
  delivered:  "bg-emerald-500/15 text-emerald-300",
  cancelled:  "bg-red-500/15 text-red-400",
  refunded:   "bg-white/8 text-white/30",
};

const STATUS_ES: Record<string, string> = {
  draft:      "Borrador",
  confirmed:  "Confirmado",
  processing: "En proceso",
  shipped:    "Enviado",
  delivered:  "Entregado",
  cancelled:  "Cancelado",
  refunded:   "Reembolsado",
};

const VALID_TRANSITIONS: Record<string, { status: string; label: string; Icon: React.ComponentType<{ className?: string }> }[]> = {
  draft:      [{ status: "confirmed",  label: "Confirmar",   Icon: CheckCircle2 }, { status: "cancelled", label: "Cancelar", Icon: XCircle }],
  confirmed:  [{ status: "processing", label: "En proceso",  Icon: Package2 },     { status: "cancelled", label: "Cancelar", Icon: XCircle }],
  processing: [{ status: "shipped",    label: "Enviado",     Icon: Truck },        { status: "cancelled", label: "Cancelar", Icon: XCircle }],
  shipped:    [{ status: "delivered",  label: "Entregado",   Icon: CheckCircle2 }],
  delivered:  [],
  cancelled:  [{ status: "refunded",   label: "Reembolsado", Icon: RotateCcw }],
  refunded:   [],
};

const PAYMENT_METHODS = [
  { value: "transferencia", label: "Transferencia" },
  { value: "efectivo",      label: "Efectivo" },
  { value: "mercadopago",   label: "Mercado Pago" },
  { value: "stripe",        label: "Stripe" },
];

const METHOD_ES: Record<string, string> = {
  transferencia: "Transferencia",
  efectivo:      "Efectivo",
  mercadopago:   "Mercado Pago",
  stripe:        "Stripe",
};

function fmt(n: number) {
  return n.toLocaleString("es-AR", { minimumFractionDigits: 2 });
}

// ─── Payment modal ────────────────────────────────────────────────────────────

function PaymentModal({
  orderId,
  defaultAmount,
  onClose,
}: {
  orderId: string;
  defaultAmount: number;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const res = await registerPayment(orderId, fd);
      if (!res.ok) setError(res.error);
      else { router.refresh(); onClose(); }
    });
  }

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-[#0d1b2e] border border-white/12 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-sm font-bold text-white mb-4">Registrar pago</h3>

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Monto</label>
            <input
              name="amount"
              type="number"
              min={0.01}
              step={0.01}
              defaultValue={defaultAmount > 0 ? defaultAmount.toFixed(2) : ""}
              required
              placeholder="0.00"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Método</label>
            <select name="method" required className={inputCls + " cursor-pointer"}>
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/8 text-white/60 hover:text-white text-sm rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/20 text-white text-sm rounded-xl transition-colors disabled:opacity-50"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function OrderDetail({ order, paid }: { order: OrderProps; paid: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const transitions = VALID_TRANSITIONS[order.status] ?? [];
  const total   = parseFloat(order.total);
  const pending = Math.max(0, total - paid);

  function changeStatus(status: string) {
    setError(null);
    startTransition(async () => {
      const res = await updateOrderStatus(order.id, status);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <>
      {paymentOpen && (
        <PaymentModal
          orderId={order.id}
          defaultAmount={pending}
          onClose={() => setPaymentOpen(false)}
        />
      )}

      <div className="space-y-4">
        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        {/* Status + actions */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 flex items-center gap-3">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status] ?? "bg-white/8 text-white/40"}`}>
              {STATUS_ES[order.status] ?? order.status}
            </span>
            <span className="text-xs text-white/30">
              {new Date(order.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>

          {transitions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {transitions.map(({ status, label, Icon }) => (
                <button
                  key={status}
                  onClick={() => changeStatus(status)}
                  disabled={isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/8 hover:bg-white/14 text-white/70 hover:text-white text-xs rounded-lg transition-colors disabled:opacity-40"
                >
                  {isPending
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Icon className="w-3.5 h-3.5" />
                  }
                  {label}
                  <ChevronRight className="w-3 h-3 opacity-40" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Client */}
          <div className="bg-white/5 border border-white/8 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Cliente</h3>
            <div>
              <p className="text-sm font-semibold text-white">{order.client.name}</p>
              <p className="text-xs text-white/40 mt-0.5">{order.client.email}</p>
              {order.client.phone && (
                <p className="text-xs text-white/40">{order.client.phone}</p>
              )}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-white/5 border border-white/8 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Resumen</h3>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Subtotal</span>
                <span className="text-white/70">$ {fmt(parseFloat(order.subtotal))}</span>
              </div>
              {parseFloat(order.discount) > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Descuento</span>
                  <span className="text-emerald-400">- $ {fmt(parseFloat(order.discount))}</span>
                </div>
              )}
              {parseFloat(order.tax) > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Impuestos</span>
                  <span className="text-white/70">$ {fmt(parseFloat(order.tax))}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold border-t border-white/8 pt-2 mt-2">
                <span className="text-white">Total</span>
                <span className="text-white">$ {fmt(total)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Pagado</span>
                <span className={paid >= total ? "text-emerald-400" : "text-white/70"}>$ {fmt(paid)}</span>
              </div>
              {pending > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Pendiente</span>
                  <span className="text-amber-400">$ {fmt(pending)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/8">
            <h3 className="text-sm font-semibold text-white">Productos</h3>
          </div>
          <div className="divide-y divide-white/5">
            {/* Header */}
            <div className="grid grid-cols-[1fr_60px_120px_110px] gap-2 px-5 py-2.5">
              {["Producto", "Cant.", "Precio unit.", "Subtotal"].map((h) => (
                <p key={h} className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">{h}</p>
              ))}
            </div>
            {order.items.map((it) => {
              const sub = it.qty * parseFloat(it.unitPrice);
              return (
                <div key={it.id} className="grid grid-cols-[1fr_60px_120px_110px] gap-2 items-center px-5 py-3">
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{it.nameSnap}</p>
                    <p className="text-xs text-white/35">{it.skuSnap}</p>
                  </div>
                  <p className="text-sm text-white/60 text-center">{it.qty}</p>
                  <p className="text-sm text-white/60 text-right">$ {fmt(parseFloat(it.unitPrice))}</p>
                  <p className="text-sm font-medium text-white text-right">$ {fmt(sub)}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payments */}
        <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
            <h3 className="text-sm font-semibold text-white">Pagos</h3>
            {order.status !== "cancelled" && order.status !== "refunded" && (
              <button
                onClick={() => setPaymentOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Registrar pago
              </button>
            )}
          </div>

          {order.payments.length === 0 ? (
            <div className="py-10 text-center">
              <CreditCard className="w-7 h-7 text-white/15 mx-auto mb-2" />
              <p className="text-xs text-white/25">Sin pagos registrados</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {order.payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm text-white">{METHOD_ES[p.method] ?? p.method}</p>
                    <p className="text-xs text-white/35">
                      {new Date(p.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
                      {" · "}
                      <span className={p.status === "completed" ? "text-emerald-400" : "text-amber-400"}>
                        {p.status === "completed" ? "Completado" : p.status}
                      </span>
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    {p.currency} $ {fmt(parseFloat(p.amount))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Notas</h3>
            <p className="text-sm text-white/60 leading-relaxed">{order.notes}</p>
          </div>
        )}
      </div>
    </>
  );
}
