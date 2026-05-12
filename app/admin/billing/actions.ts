"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getAccessTicket } from "@/lib/afip/wsaa";
import { solicitarCAE, getUltimoAutorizado, TIPO_COMPROBANTE_AFIP } from "@/lib/afip/wsfe";
import { TipoComprobante } from "@/app/generated/prisma/client";

type ActionResult = { ok: true } | { ok: false; error: string };

// ─── Fiscal Config ────────────────────────────────────────────────────────────

export async function saveFiscalConfig(fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireAuth("staff");
    const tid  = user.tenantId;

    const cuit         = (fd.get("cuit") as string)?.trim().replace(/\D/g, "");
    const ivaCondition = (fd.get("ivaCondition") as string)?.trim();
    const puntoVenta   = parseInt(fd.get("puntoVenta") as string, 10);
    const production   = fd.get("production") === "true";
    const afipCert     = (fd.get("afipCert") as string)?.trim() || null;
    const afipKey      = (fd.get("afipKey") as string)?.trim() || null;

    if (!cuit || cuit.length !== 11) return { ok: false, error: "CUIT inválido (debe tener 11 dígitos)" };
    if (!ivaCondition)               return { ok: false, error: "Condición de IVA requerida" };
    if (!puntoVenta || puntoVenta < 1) return { ok: false, error: "Punto de venta inválido" };

    await prisma.fiscalConfig.upsert({
      where:  { tenantId: tid },
      create: { tenantId: tid, cuit, ivaCondition, puntoVenta, production, afipCert, afipKey },
      update: { cuit, ivaCondition, puntoVenta, production, afipCert, afipKey },
    });

    revalidatePath("/admin/billing");
    revalidatePath("/admin/billing/settings");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error inesperado" };
  }
}

export async function testAfipConnection(): Promise<ActionResult> {
  try {
    const user = await requireAuth("staff");
    await getAccessTicket(user.tenantId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error de conexión" };
  }
}

// ─── Invoice ──────────────────────────────────────────────────────────────────

export async function createInvoice(fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireAuth("staff");
    const tid  = user.tenantId;

    const cfg = await prisma.fiscalConfig.findUnique({ where: { tenantId: tid } });
    if (!cfg)          return { ok: false, error: "Configure los datos fiscales primero" };
    if (!cfg.afipCert) return { ok: false, error: "Certificado AFIP no configurado" };

    const tipoStr  = (fd.get("tipoComprobante") as string)?.trim() as TipoComprobante;
    const concepto = parseInt(fd.get("concepto") as string, 10) || 1;
    const receptorDocTipo = parseInt(fd.get("receptorDocTipo") as string, 10) || 99;
    const receptorDocNro  = (fd.get("receptorDocNro") as string)?.trim() || "0";
    const receptorNombre  = (fd.get("receptorNombre") as string)?.trim() || null;
    const importeNeto     = parseFloat(fd.get("importeNeto") as string) || 0;
    const importeIVA      = parseFloat(fd.get("importeIVA") as string) || 0;
    const importeTotal    = importeNeto + importeIVA;

    const tipoNum = TIPO_COMPROBANTE_AFIP[tipoStr];
    if (tipoNum === undefined) return { ok: false, error: "Tipo de comprobante inválido" };

    const result = await solicitarCAE(tid, {
      tipoComprobante: tipoNum,
      puntoVenta:      cfg.puntoVenta,
      concepto,
      receptorDocTipo,
      receptorDocNro,
      receptorNombre:  receptorNombre ?? undefined,
      importeNeto,
      importeIVA,
      importeTotal,
    });

    await prisma.fiscalInvoice.create({
      data: {
        tenantId:        tid,
        tipoComprobante: tipoStr,
        puntoVenta:      cfg.puntoVenta,
        numero:          result.numero,
        fecha:           result.fecha,
        concepto,
        receptorDocTipo,
        receptorDocNro,
        receptorNombre,
        importeNeto,
        importeIVA,
        amount:      importeTotal,
        cae:         result.cae,
        caeVto:      result.caeVto,
        environment: cfg.production ? "prod" : "test",
        metadata:    {},
      },
    });

    revalidatePath("/admin/billing");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error al emitir comprobante" };
  }
}

export async function getNextInvoiceNumber(tipoComprobante: TipoComprobante): Promise<number> {
  const user = await requireAuth("staff");
  const cfg  = await prisma.fiscalConfig.findUnique({ where: { tenantId: user.tenantId } });
  if (!cfg) throw new Error("FiscalConfig not found");
  const tipoNum = TIPO_COMPROBANTE_AFIP[tipoComprobante] ?? 11;
  try {
    const last = await getUltimoAutorizado(user.tenantId, tipoNum, cfg.puntoVenta);
    return last + 1;
  } catch {
    return 1;
  }
}
