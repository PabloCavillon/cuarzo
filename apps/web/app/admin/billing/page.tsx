import { redirect } from "next/navigation";
import { requireAuth, apiError } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { InvoiceListClient } from "./InvoiceListClient";

export default async function BillingPage() {
  let user;
  try {
    user = await requireAuth("staff");
  } catch (e) {
    void apiError(e);
    redirect("/login");
  }

  const tid = user.tenantId;

  const [config, invoices] = await Promise.all([
    prisma.fiscalConfig.findUnique({ where: { tenantId: tid } }),
    prisma.fiscalInvoice.findMany({
      where:   { tenantId: tid },
      orderBy: { createdAt: "desc" },
      take:    200,
    }),
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">Facturación</h2>
        <p className="text-sm text-white/40 mt-0.5">Comprobantes electrónicos ARCA / AFIP</p>
      </div>

      <InvoiceListClient
        invoices={invoices.map((inv) => ({
          id:              inv.id,
          tipoComprobante: inv.tipoComprobante,
          puntoVenta:      inv.puntoVenta,
          numero:          inv.numero,
          fecha:           inv.fecha,
          receptorNombre:  inv.receptorNombre,
          receptorDocNro:  inv.receptorDocNro,
          amount:          inv.amount.toString(),
          cae:             inv.cae,
          caeVto:          inv.caeVto.toISOString(),
          environment:     inv.environment,
        }))}
        hasConfig={!!config?.afipCert}
        production={config?.production ?? false}
      />
    </div>
  );
}
