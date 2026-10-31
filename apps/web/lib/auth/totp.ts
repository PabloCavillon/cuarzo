import { randomInt } from "crypto";
import { generateSecret as _generateSecret, verifySync, generateURI } from "otplib";

export function generateTotpSecret(): string {
  return _generateSecret();
}

export function getTotpUri(secret: string, account: string, issuer = "Cuarzo"): string {
  return generateURI({ label: account, secret, issuer });
}

export function verifyTotp(token: string, secret: string): boolean {
  try {
    const result = verifySync({ token: token.replace(/\s/g, ""), secret });
    return typeof result === "object" ? result.valid : result === true;
  } catch {
    return false;
  }
}

export function generateEmailOtp(): string {
  return randomInt(100000, 1000000).toString();
}
