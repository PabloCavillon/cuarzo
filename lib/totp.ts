import { generateSecret as _generateSecret, generateSync, verifySync, generateURI } from "otplib";

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function generateTotpToken(secret: string): string {
  return generateSync({ secret });
}

export function generateEmailOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
