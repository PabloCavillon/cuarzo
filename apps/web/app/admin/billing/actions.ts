"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { getAccessTicket } from "@/lib/api/afip/wsaa";
import { encryptAfipKey } from "@/lib/api/afip/key-crypto";
import { hasModule } from "@/lib/utils/plan-limits";
import { solicitarCAE, getUltimoAutorizado, TIPO_COMPROBANTE_AFIP } from "@/lib/api/afip/wsfe";
import { TipoComprobante } from "@/prisma/generated/client";

type ActionResult = { ok: true } | { ok: false; error: string };

// AFIP's AlicIva ids
const ALICUOTA_ID: Record<string, number> = { "0": 3, "0.105": 4, "0.21": 5, "0.27": 6 };

// ─── Fiscal Config ────────────────────────────────────────────────────────────

export async function saveFiscalConfig(fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireAuth("owner");
    const tid  = user.tenantId;

    const cuit         = (fd.get("cuit") as string)?.trim().replace(/\D/g, "");
    const ivaCondition = (fd.get("ivaCondition") as string)?.trim();
    const puntoVenta   = parseInt(fd.get("puntoVenta") as string, 10);
    const production   = fd.get("production") === "true";
    const afipCert     = (fd.get("afipCert") as string)?.trim() || null;
    const rawKey       = (fd.get("afipKey") as string)?.trim() || null;
    const afipKey      = rawKey ? encryptAfipKey(rawKey) : null;

    if (!cuit || cuit.length !== 11) return { ok: false, error: "Invalid CUIT (must be 11 digits)" };
    if (!ivaCondition)               return { ok: false, error: "IVA condition required" };
    if (!puntoVenta || puntoVenta < 1) return { ok: false, error: "Invalid sales point" };

    await prisma.fiscalConfig.upsert({
      where:  { tenantId: tid },
      create: { tenantId: tid, cuit, ivaCondition, puntoVenta, production, afipCert, afipKey },
      update: {
        cuit, ivaCondition, puntoVenta, production,
        // Blank fields keep what is stored: the form never receives the key back.
        ...(afipCert ? { afipCert } : {}),
        ...(afipKey ? { afipKey } : {}),
        // The cached ticket belongs to the previous environment or certificate.
        taToken: null, taSign: null, taExpiration: null,
      },
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
    const user = await requireAuth("admin");
    await getAccessTicket(user.tenantId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Connection error" };
  }
}

// ─── Invoice ──────────────────────────────────────────────────────────────────

export async function createInvoice(fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireAuth("admin");
    const tid  = user.tenantId;

    if (!(await hasModule(tid, "fiscal"))) return { ok: false, error: "Módulo no disponible en tu plan." };

    const cfg = await prisma.fiscalConfig.findUnique({ where: { tenantId: tid } });
    if (!cfg)          return { ok: false, error: "Configure los datos fiscales primero" };
    if (!cfg.afipCert) return { ok: false, error: "Certificado AFIP no configurado" };

    const tipoStr  = (fd.get("tipoComprobante") as string)?.trim() as TipoComprobante;
    const concepto = parseInt(fd.get("concepto") as string, 10) || 1;
    const receptorDocTipo = parseInt(fd.get("receptorDocTipo") as string, 10) || 99;
    const receptorDocNro  = (fd.get("receptorDocNro") as string)?.replace(/\D/g, "") || "0";
    const receptorNombre  = (fd.get("receptorNombre") as string)?.trim() || null;
    const importeNeto     = parseFloat(fd.get("importeNeto") as string) || 0;
    // Factura C does not discriminate IVA.
    const importeIVA      = tipoStr === "C" ? 0 : parseFloat(fd.get("importeIVA") as string) || 0;
    const importeTotal    = Number((importeNeto + importeIVA).toFixed(2));
    const alicuotaId      = ALICUOTA_ID[fd.get("ivaRate") as string] ?? 5;

    const condicionIvaReceptor = parseInt(fd.get("condicionIvaReceptor") as string, 10) || 5;
    const fechaAfip = (name: string) => (fd.get(name) as string)?.replace(/-/g, "") || undefined;
    const servicioDesde = fechaAfip("servicioDesde");
    const servicioHasta = fechaAfip("servicioHasta");
    const vtoPago       = fechaAfip("vtoPago");

    const tipoNum = TIPO_COMPROBANTE_AFIP[tipoStr];
    if (tipoNum === undefined) return { ok: false, error: "Invalid invoice type" };
    if (importeNeto <= 0) return { ok: false, error: "El importe debe ser mayor a 0" };
    if (concepto !== 1 && !(servicioDesde && servicioHasta && vtoPago)) {
      return { ok: false, error: "Completá el período del servicio y el vencimiento de pago" };
    }

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
      alicuotaId,
      condicionIvaReceptor,
      servicioDesde,
      servicioHasta,
      vtoPago,
    });

    // AFIP already issued this number: losing the row would leave a ghost invoice.
    const saveInvoice = () => prisma.fiscalInvoice.create({
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

    try {
      await saveInvoice().catch(saveInvoice);
    } catch (e) {
      console.error("AFIP invoice issued but not saved", { tid, tipoStr, numero: result.numero, cae: result.cae }, e);
      return { ok: false, error: `AFIP emitió el comprobante ${result.numero} (CAE ${result.cae}) pero no se pudo guardar. No lo vuelvas a emitir y anotá estos datos.` };
    }

    revalidatePath("/admin/billing");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to issue invoice" };
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
