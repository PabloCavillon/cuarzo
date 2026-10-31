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
} satisfies NextAuthConfig;
