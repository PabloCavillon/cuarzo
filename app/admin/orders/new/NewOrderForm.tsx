"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Search, Loader2, ShoppingCart } from "lucide-react";
import { createOrder } from "../actions";

type ProductOption = {
  id: string;
  sku: string;
  name: string;
  basePrice: string;
  categoryName: string | null;
};

type OrderLine = {
  productId: string;
  variantId: string | null;
  skuSnap: string;
  nameSnap: string;
  qty: number;
  unitPrice: number;
};

function fmt(n: number) {
  return n.toLocaleString("es-AR", { minimumFractionDigits: 2 });
}

export function NewOrderForm({ products }: { products: ProductOption[] }) {
  const router  = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError]  = useState<string | null>(null);
  const [lines, setLines]  = useState<OrderLine[]>([]);
  const [search, setSearch] = useState("");

  const filtered = search.length > 1
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.sku.toLowerCase().includes(search.toLowerCase()),
      ).slice(0, 8)
    : [];

  function addProduct(p: ProductOption) {
    setLines((prev) => {
      const existing = prev.findIndex((l) => l.productId === p.id && l.variantId === null);
      if (existing !== -1) {
        return prev.map((l, i) => i === existing ? { ...l, qty: l.qty + 1 } : l);
      }
      return [
        ...prev,
        {
          productId: p.id,
          variantId: null,
          skuSnap:   p.sku,
          nameSnap:  p.name,
          qty:       1,
          unitPrice: parseFloat(p.basePrice) || 0,
        },
      ];
    });
    setSearch("");
  }

  function updateLine(idx: number, field: "qty" | "unitPrice", value: number) {
    setLines((prev) => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l));
  }

  function removeLine(idx: number) {
    setLines((prev) => prev.filter((_, i) => i !== idx));
  }

  const subtotal = lines.reduce((a, l) => a + l.qty * l.unitPrice, 0);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formRef.current) return;
    if (!lines.length) { setError("Agregá al menos un producto"); return; }
    const fd = new FormData(formRef.current);
    fd.set("items", JSON.stringify(lines));
    setError(null);

    startTransition(async () => {
      const res = await createOrder(fd);
      if (!res.ok) setError(res.error);
      else router.push(`/admin/orders/${res.id}`);
    });
  }

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25";

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      {/* Client */}
      <div className="bg-white/5 border border-white/8 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Cliente</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-white/50 mb-1.5">
              Nombre <span className="text-red-400/70">*</span>
            </label>
            <input name="clientName" required placeholder="Juan García" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">
              Email <span className="text-red-400/70">*</span>
            </label>
            <input name="clientEmail" type="email" required placeholder="juan@empresa.com" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Teléfono</label>
            <input name="clientPhone" type="tel" placeholder="+54 11..." className={inputCls} />
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="bg-white/5 border border-white/8 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Productos</h3>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto por nombre o SKU..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25"
          />
          {filtered.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 z-20 bg-[#0d1b2e] border border-white/12 rounded-xl shadow-xl overflow-hidden">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addProduct(p)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/8 transition-colors text-left"
                >
                  <div>
                    <p className="text-sm text-white">{p.name}</p>
                    <p className="text-xs text-white/35">{p.sku}{p.categoryName ? ` · ${p.categoryName}` : ""}</p>
                  </div>
                  <p className="text-xs font-semibold text-white/60 shrink-0 ml-3">
                    $ {fmt(parseFloat(p.basePrice))}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Lines */}
        {lines.length === 0 ? (
          <div className="py-8 text-center">
            <ShoppingCart className="w-7 h-7 text-white/15 mx-auto mb-2" />
            <p className="text-xs text-white/25">Buscá y agregá productos al pedido</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-[1fr_80px_110px_32px] gap-2 px-3">
              {["Producto", "Cant.", "Precio unit.", ""].map((h) => (
                <p key={h} className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">{h}</p>
              ))}
            </div>
            {lines.map((l, i) => (
              <div key={i} className="grid grid-cols-[1fr_80px_110px_32px] gap-2 items-center bg-white/4 rounded-xl px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{l.nameSnap}</p>
                  <p className="text-xs text-white/35">{l.skuSnap}</p>
                </div>
                <input
                  type="number"
                  min={1}
                  value={l.qty}
                  onChange={(e) => updateLine(i, "qty", parseInt(e.target.value) || 1)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white text-center focus:outline-none focus:border-white/25"
                />
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={l.unitPrice}
                  onChange={(e) => updateLine(i, "unitPrice", parseFloat(e.target.value) || 0)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white text-right focus:outline-none focus:border-white/25"
                />
                <button
                  type="button"
                  onClick={() => removeLine(i)}
                  className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <div className="flex justify-end px-3 pt-2 border-t border-white/8">
              <div className="text-right">
                <p className="text-xs text-white/40">Total</p>
                <p className="text-xl font-bold text-white">$ {fmt(subtotal)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
        <label className="block text-xs font-medium text-white/50 mb-1.5">Notas internas</label>
        <textarea
          name="notes"
          rows={2}
          placeholder="Instrucciones de entrega, condiciones, etc."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 resize-none"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2.5 bg-white/5 hover:bg-white/8 text-white/60 hover:text-white text-sm rounded-xl transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/20 text-white text-sm rounded-xl transition-colors disabled:opacity-50"
        >
          {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Crear pedido
        </button>
      </div>
    </form>
  );
}
