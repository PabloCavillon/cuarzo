import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const PREFIX = "enc:v1:";

function secretKey(): Buffer {
  const secret = process.env.AFIP_KEY_SECRET;
  if (!secret) throw new Error("AFIP_KEY_SECRET not configured");
  return createHash("sha256").update(secret).digest();
}

export function encryptAfipKey(pem: string): string {
  const iv     = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", secretKey(), iv);
  const data   = Buffer.concat([cipher.update(pem, "utf8"), cipher.final()]);
  return PREFIX + [iv, cipher.getAuthTag(), data].map((b) => b.toString("base64")).join(":");
}

// Keys saved before encryption existed are still plain PEM.
export function decryptAfipKey(stored: string): string {
  if (!stored.startsWith(PREFIX)) return stored;
  const [iv, tag, data] = stored.slice(PREFIX.length).split(":").map((p) => Buffer.from(p, "base64"));
  const decipher = createDecipheriv("aes-256-gcm", secretKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}
