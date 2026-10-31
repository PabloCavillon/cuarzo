import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin, apiError, signProof, SUPER_ADMIN_COOKIE } from "@/lib/auth/session";
import { verifyTotp } from "@/lib/auth/totp";

export async function POST(req: NextRequest) {
  let user;
  try { user = await requireSuperAdmin({ pending: true }); } catch (e) { return apiError(e); }

  const { code } = await req.json().catch(() => ({})) as { code?: string };
  const secret   = process.env.SUPER_ADMIN_TOTP_SECRET;

  if (!secret) {
    return NextResponse.json({ error: "TOTP no configurado. Visitá /super-admin/setup primero." }, { status: 500 });
  }

  if (!code || !verifyTotp(code, secret)) {
    return NextResponse.json({ error: "Código incorrecto o expirado." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SUPER_ADMIN_COOKIE, signProof("super-admin", user.id, user.sessionVersion), {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict",
    path:     "/",
    maxAge:   60 * 60 * 8,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SUPER_ADMIN_COOKIE);
  return res;
}
