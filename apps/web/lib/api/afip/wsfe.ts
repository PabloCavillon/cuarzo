import "server-only";
import { getAccessTicket } from "./wsaa";
import { prisma } from "@/lib/db/prisma";

const WSFE_PROD = "https://servicios1.afip.gov.ar/wsfev1/service.asmx";
const WSFE_TEST = "https://wswhomo.afip.gov.ar/wsfev1/service.asmx";

export const TIPO_COMPROBANTE_AFIP: Record<string, number> = {
  A: 1,
  B: 6,
  C: 11,
  M: 51,
  X: 0,
};

export const TIPO_DOC_AFIP = {
  CUIT:    80,
  CUIL:    86,
  CDI:     87,
  DNI:     96,
  PASAPORTE: 94,
  CONSUMIDOR_FINAL: 99,
} as const;

type WsfeAuth = { Token: string; Sign: string; Cuit: string };

function soapEnvelope(action: string, cuit: string, token: string, sign: string, inner: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ar="http://ar.gov.afip.dif.FEV1/">
  <soapenv:Header/>
  <soapenv:Body>
    <ar:${action}>
      <ar:Auth>
        <ar:Token>${token}</ar:Token>
        <ar:Sign>${sign}</ar:Sign>
        <ar:Cuit>${cuit}</ar:Cuit>
      </ar:Auth>
      ${inner}
    </ar:${action}>
  </soapenv:Body>
</soapenv:Envelope>`;
}

async function callWsfe(url: string, action: string, body: string): Promise<string> {
  const res = await fetch(url, {
    method:  "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction:     `"http://ar.gov.afip.dif.FEV1/${action}"`,
    },
    body,
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`WSFE HTTP ${res.status}`);
  return res.text();
}

function extractXml(xml: string, tag: string): string | undefined {
  return xml.match(new RegExp(`<(?:ar:)?${tag}[^>]*>([\\s\\S]*?)<\/(?:ar:)?${tag}>`))?.[1]?.trim();
}

export async function getUltimoAutorizado(tenantId: string, tipoComprobante: number, puntoVenta: number): Promise<number> {
  const cfg  = await prisma.fiscalConfig.findUnique({ where: { tenantId } });
  if (!cfg) throw new Error("FiscalConfig not found");
  const ta   = await getAccessTicket(tenantId);
  const url  = cfg.production ? WSFE_PROD : WSFE_TEST;

  const inner = `<ar:PtoVta>${puntoVenta}</ar:PtoVta><ar:CbteTipo>${tipoComprobante}</ar:CbteTipo>`;
  const envelope = soapEnvelope("FECompUltimoAutorizado", cfg.cuit, ta.token, ta.sign, inner);
  const xml  = await callWsfe(url, "FECompUltimoAutorizado", envelope);

  const nro = extractXml(xml, "CbteNro");
  if (nro === undefined) throw new Error("WSFE: no CbteNro in response");
  return parseInt(nro, 10);
}

export type InvoiceRequest = {
  tipoComprobante: number;
  puntoVenta: number;
  concepto: number;
  receptorDocTipo: number;
  receptorDocNro: string;
  receptorNombre?: string;
  importeNeto: number;
  importeIVA: number;
  importeTotal: number;
  alicuotaId: number;
  condicionIvaReceptor: number;
  // YYYYMMDD, required by AFIP when the concept includes services
  servicioDesde?: string;
  servicioHasta?: string;
  vtoPago?: string;
  fecha?: string;
};

export type InvoiceResult = {
  numero: number;
  cae: string;
  caeVto: Date;
  fecha: string;
};

function parseCaeVto(raw: string | undefined): Date {
  return raw
    ? new Date(`${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`)
    : new Date(Date.now() + 10 * 24 * 3600 * 1000);
}

// A lost response does not mean AFIP refused: a retry would issue a second real invoice.
async function findIssued(
  url: string, envelopeFor: (inner: string) => string, req: InvoiceRequest, numero: number, fecha: string,
): Promise<InvoiceResult | null> {
  const inner = `<ar:FeCompConsReq><ar:CbteTipo>${req.tipoComprobante}</ar:CbteTipo><ar:CbteNro>${numero}</ar:CbteNro><ar:PtoVta>${req.puntoVenta}</ar:PtoVta></ar:FeCompConsReq>`;
  const xml = await callWsfe(url, "FECompConsultar", envelopeFor(inner));
  const cae = extractXml(xml, "CodAutorizacion");
  const sameInvoice =
    Number(extractXml(xml, "ImpTotal")) === req.importeTotal &&
    Number(extractXml(xml, "DocNro")) === Number(req.receptorDocNro);
  if (!cae || !sameInvoice) return null;
  return { numero, cae, caeVto: parseCaeVto(extractXml(xml, "FchVto")), fecha };
}

export async function solicitarCAE(tenantId: string, req: InvoiceRequest): Promise<InvoiceResult> {
  const cfg = await prisma.fiscalConfig.findUnique({ where: { tenantId } });
  if (!cfg) throw new Error("FiscalConfig not found");

  const ta  = await getAccessTicket(tenantId);
  const url = cfg.production ? WSFE_PROD : WSFE_TEST;

  const lastNro = await getUltimoAutorizado(tenantId, req.tipoComprobante, req.puntoVenta);
  const numero  = lastNro + 1;

  const today  = req.fecha ?? new Date().toLocaleDateString("sv-SE", { timeZone: "America/Argentina/Buenos_Aires" }).replace(/-/g, "");
  const nroStr = String(numero).padStart(8, "0");

  const inner = `
<ar:FeCAEReq>
  <ar:FeCabReq>
    <ar:CantReg>1</ar:CantReg>
    <ar:PtoVta>${req.puntoVenta}</ar:PtoVta>
    <ar:CbteTipo>${req.tipoComprobante}</ar:CbteTipo>
  </ar:FeCabReq>
  <ar:FeDetReq>
    <ar:FECAEDetRequest>
      <ar:Concepto>${req.concepto}</ar:Concepto>
      <ar:DocTipo>${req.receptorDocTipo}</ar:DocTipo>
      <ar:DocNro>${req.receptorDocNro}</ar:DocNro>
      <ar:CbteDesde>${nroStr}</ar:CbteDesde>
      <ar:CbteHasta>${nroStr}</ar:CbteHasta>
      <ar:CbteFch>${today}</ar:CbteFch>
      <ar:ImpTotal>${req.importeTotal.toFixed(2)}</ar:ImpTotal>
      <ar:ImpTotConc>0.00</ar:ImpTotConc>
      <ar:ImpNeto>${req.importeNeto.toFixed(2)}</ar:ImpNeto>
      <ar:ImpOpEx>0.00</ar:ImpOpEx>
      <ar:ImpTrib>0.00</ar:ImpTrib>
      <ar:ImpIVA>${req.importeIVA.toFixed(2)}</ar:ImpIVA>
      ${req.concepto === 1 ? "" : `<ar:FchServDesde>${req.servicioDesde}</ar:FchServDesde>
      <ar:FchServHasta>${req.servicioHasta}</ar:FchServHasta>
      <ar:FchVtoPago>${req.vtoPago}</ar:FchVtoPago>`}
      <ar:MonId>PES</ar:MonId>
      <ar:MonCotiz>1</ar:MonCotiz>
      <ar:CondicionIVAReceptorId>${req.condicionIvaReceptor}</ar:CondicionIVAReceptorId>
      ${req.tipoComprobante === 11 ? "" : `<ar:Iva>
        <ar:AlicIva>
          <ar:Id>${req.alicuotaId}</ar:Id>
          <ar:BaseImp>${req.importeNeto.toFixed(2)}</ar:BaseImp>
          <ar:Importe>${req.importeIVA.toFixed(2)}</ar:Importe>
        </ar:AlicIva>
      </ar:Iva>`}
    </ar:FECAEDetRequest>
  </ar:FeDetReq>
</ar:FeCAEReq>`;

  const envelope = soapEnvelope("FECAESolicitar", cfg.cuit, ta.token, ta.sign, inner);

  let xml: string;
  try {
    xml = await callWsfe(url, "FECAESolicitar", envelope);
  } catch {
    const issued = await findIssued(
      url, (i) => soapEnvelope("FECompConsultar", cfg.cuit, ta.token, ta.sign, i), req, numero, today,
    ).catch(() => null);
    if (issued) return issued;
    throw new Error(`AFIP no respondió. Antes de reintentar, revisá en AFIP si se emitió el comprobante ${numero}.`);
  }

  const resultado = extractXml(xml, "Resultado");
  if (resultado !== "A") {
    const errMsg = extractXml(xml, "Msg") ?? "AFIP rechazó el comprobante";
    throw new Error(`WSFE: ${errMsg}`);
  }

  const cae    = extractXml(xml, "CAE") ?? "";
  const caeVto = parseCaeVto(extractXml(xml, "CAEFchVto"));

  return { numero, cae, caeVto, fecha: today };
}
