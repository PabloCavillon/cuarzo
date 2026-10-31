import { describe, it, expect, vi, beforeEach } from "vitest";

const prismaMock = vi.hoisted(() => ({ fiscalConfig: { findUnique: vi.fn() } }));
vi.mock("@/lib/db/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/api/afip/wsaa", () => ({ getAccessTicket: async () => ({ token: "t", sign: "s" }) }));

import { solicitarCAE, type InvoiceRequest } from "@/lib/api/afip/wsfe";

const REQ: InvoiceRequest = {
  tipoComprobante: 6, puntoVenta: 1, concepto: 2, receptorDocTipo: 99, receptorDocNro: "0",
  importeNeto: 100, importeIVA: 21, importeTotal: 121, alicuotaId: 5, condicionIvaReceptor: 5,
  servicioDesde: "20261001", servicioHasta: "20261031", vtoPago: "20261110",
};

const fetchMock = vi.fn();

// The action is in the SOAPAction header: one canned answer per call type.
function afip(answers: Record<string, () => string>) {
  fetchMock.mockImplementation(async (_url: string, init: { headers: Record<string, string> }) => {
    const action = init.headers.SOAPAction.match(/FEV1\/(\w+)/)![1];
    return { ok: true, text: async () => answers[action]() };
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal("fetch", fetchMock);
  prismaMock.fiscalConfig.findUnique.mockResolvedValue({ cuit: "20111111112", production: false });
});

const LAST = () => "<CbteNro>7</CbteNro>";

describe("solicitarCAE", () => {
  it("sends the service period and the receiver's IVA condition", async () => {
    afip({ FECompUltimoAutorizado: LAST, FECAESolicitar: () => "<Resultado>A</Resultado><CAE>123</CAE><CAEFchVto>20261110</CAEFchVto>" });
    const res = await solicitarCAE("t1", REQ);
    const body = fetchMock.mock.calls.at(-1)![1].body as string;
    expect(res.cae).toBe("123");
    expect(body).toContain("<ar:FchServDesde>20261001</ar:FchServDesde>");
    expect(body).toContain("<ar:CondicionIVAReceptorId>5</ar:CondicionIVAReceptorId>");
  });

  it("recovers an invoice AFIP issued when the response was lost", async () => {
    afip({
      FECompUltimoAutorizado: LAST,
      FECAESolicitar:  () => { throw new Error("timeout"); },
      FECompConsultar: () => "<CodAutorizacion>999</CodAutorizacion><ImpTotal>121</ImpTotal><DocNro>0</DocNro><FchVto>20261110</FchVto>",
    });
    await expect(solicitarCAE("t1", REQ)).resolves.toMatchObject({ numero: 8, cae: "999" });
  });

  it("does not adopt a different invoice with the same number", async () => {
    afip({
      FECompUltimoAutorizado: LAST,
      FECAESolicitar:  () => { throw new Error("timeout"); },
      FECompConsultar: () => "<CodAutorizacion>999</CodAutorizacion><ImpTotal>500</ImpTotal><DocNro>0</DocNro>",
    });
    await expect(solicitarCAE("t1", REQ)).rejects.toThrow(/revisá en AFIP/);
  });
});
