import NextAuth from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authConfig } from "./auth.config";
import proxy from "./proxy";

// Next.js middleware: runs on every matched request at the Edge.
// Auth guard (JWT verification) runs first, then the rate limiter.
const { auth } = NextAuth(authConfig);

export default auth(function middleware(req: NextRequest) {
  return proxy(req);
});

export const config = {
  matcher: ["/api/:path*", "/admin/:path*", "/super-admin/:path*"],
};
