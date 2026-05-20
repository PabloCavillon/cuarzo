"use server";

import forge from "node-forge";
import { prisma } from "@/lib/db/prisma";

const WSAA_PROD = "https://wsaa.afip.gov.ar/ws/services/LoginCms";
const WSAA_TEST = "https://wsaahomo.afip.gov.ar/ws/services/LoginCms";
const SERVICE   = "wsfe";

function buildLoginTicketRequest(ttlSeconds = 36000): string {
  const now        = new Date();
  const expiration = new Date(now.getTime() + ttlSeconds * 1000);
  const uniqueId   = Math.floor(Math.random() * 2_147_483_647);

  return `<?xml version="1.0" encoding="UTF-8"?>
<loginTicketRequest version="1.0">
  <header>
    <uniqueId>${uniqueId}</uniqueId>
    <generationTime>${now.toISOString().replace("Z", "-03:00")}</generationTime>
    <expirationTime>${expiration.toISOString().replace("Z", "-03:00")}</expirationTime>
  </header>
  <service>${SERVICE}</service>
</loginTicketRequest>`;
}

function signCMS(xmlStr: string, certPem: string, keyPem: string): string {
  const cert         = forge.pki.certificateFromPem(certPem);
  const privateKey   = forge.pki.privateKeyFromPem(keyPem);
  const p7           = forge.pkcs7.createSignedData();

  p7.content = forge.util.createBuffer(xmlStr, "utf8");
  p7.addCertificate(cert);
  p7.addSigner({
    key:         privateKey,
    certificate: cert,
    digestAlgorithm: forge.pki.oids.sha256,
    authenticatedAttributes: [
      { type: forge.pki.oids.contentType,   value: forge.pki.oids.data },
      { type: forge.pki.oids.messageDigest },
      { type: forge.pki.oids.signingTime,   value: new Date().toString() },
    ],
  });
  p7.sign();

  const der = forge.asn1.toDer(p7.toAsn1()).getBytes();
  return Buffer.from(der, "binary").toString("base64");
}

async function callWsaa(cms: string, production: boolean): Promise<{ token: string; sign: string; expiration: Date }> {
  const url  = production ? WSAA_PROD : WSAA_TEST;
  const body = `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsaa="http://wsaa.view.sua.dvadac.desein.afip.gov.ar/">
  <soapenv:Header/>
  <soapenv:Body>
    <wsaa:loginCms>
      <wsaa:in0>${cms}</wsaa:in0>
    </wsaa:loginCms>
  </soapenv:Body>
</soapenv:Envelope>`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction:     '""',
    },
    body,
  });

  if (!res.ok) throw new Error(`WSAA HTTP ${res.status}`);

  const text  = await res.text();
  const token = text.match(/<token>([\s\S]*?)<\/token>/)?.[1]?.trim();
  const sign  = text.match(/<sign>([\s\S]*?)<\/sign>/)?.[1]?.trim();
  const expirationStr = text.match(/<expirationTime>([\s\S]*?)<\/expirationTime>/)?.[1]?.trim();

  if (!token || !sign) throw new Error("WSAA: no token/sign in response");

  const expiration = expirationStr ? new Date(expirationStr) : new Date(Date.now() + 10 * 3600 * 1000);

  return { token, sign, expiration };
}

export async function getAccessTicket(tenantId: string): Promise<{ token: string; sign: string }> {
  const cfg = await prisma.fiscalConfig.findUnique({ where: { tenantId } });
  if (!cfg)             throw new Error("FiscalConfig not found");
  if (!cfg.afipCert)    throw new Error("AFIP certificate not configured");
  if (!cfg.afipKey)     throw new Error("AFIP private key not configured");

  // Return cached TA if still valid (with 5-min buffer)
  if (cfg.taToken && cfg.taSign && cfg.taExpiration) {
    const buffer = new Date(cfg.taExpiration.getTime() - 5 * 60 * 1000);
    if (buffer > new Date()) {
      return { token: cfg.taToken, sign: cfg.taSign };
    }
  }

  // Build and sign a new TRA
  const ltr = buildLoginTicketRequest();
  const cms = signCMS(ltr, cfg.afipCert, cfg.afipKey);
  const ta  = await callWsaa(cms, cfg.production);

  await prisma.fiscalConfig.update({
    where: { tenantId },
    data:  { taToken: ta.token, taSign: ta.sign, taExpiration: ta.expiration },
  });

  return { token: ta.token, sign: ta.sign };
}
