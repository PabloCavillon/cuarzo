import type { NextAuthConfig } from "next-auth";

// Edge-compatible config — no Prisma, no bcrypt.
// Used by middleware to verify JWTs without hitting the database.
// Full providers are added in auth.ts.
export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [],
  callbacks: {
    // Called by middleware to decide if a request is allowed.
    // Only verifies the JWT signature (stateless — safe for Edge).
    // The DB check happens in requireAuth() inside each Route Handler.
    authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user;
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");

      if (isAdminRoute) {
        if (!isLoggedIn) return false; // → redirects to /login
        const role = (session.user as { role?: string }).role;
        return role === "owner" || role === "admin";
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
