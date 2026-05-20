import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAuth, apiError } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { InvoiceForm } from "./InvoiceForm";

export default async function NewInvoicePage() {
  let user;
  try {
    user = await requireAuth("staff");
  } catch (e) {
    void apiError(e);
    redirect("/login");
  }

  const config = await prisma.fiscalConfig.findUnique({
    where: { tenantId: user.tenantId },
  });

  if (!config?.afipCert) {
    redirect("/admin/billing/settings");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Link
        href="/admin/billing"
        className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Facturación
      </Link>

      <div>
        <h2 className="text-xl font-bold text-white">Nuevo comprobante</h2>
        <p className="text-sm text-white/40 mt-0.5">
          Emisión de factura electrónica vía AFIP
        </p>
      </div>

      <InvoiceForm
        puntoVenta={config.puntoVenta}
        production={config.production}
      />
    </div>
  );
}
