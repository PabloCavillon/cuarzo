import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  // CredentialsSignin is an expected user error (wrong password), not a system
  // fault. Suppress it so it doesn't pollute logs; all other errors still log.
  logger: {
    error(error) {
      if ("type" in error && (error as { type?: string }).type === "CredentialsSignin") return;
      console.error("[auth][error]", error);
    },
  },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    Credentials({
      credentials: {
        email:    { label: "Email",       type: "email"    },
        password: { label: "Contraseña",  type: "password" },
      },
      async authorize(credentials) {
        const email    = (credentials?.email    as string | undefined)?.trim().toLowerCase();
        const password =  credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findFirst({
          where: { email, active: true },
          select: { id: true, email: true, name: true, password: true },
        });
        if (!user?.password) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],

  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 days

  callbacks: {
    // ── Sign-in: create / update user on first Google login ─────────────────
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const email = user.email?.toLowerCase();
        if (!email) return false;

        const existing = await prisma.user.findFirst({ where: { email } });

        if (!existing) {
          const tenant = await prisma.tenant.findUnique({ where: { slug: "demo" } });
          if (!tenant) return false;

          await prisma.user.create({
            data: {
              tenantId:      tenant.id,
              email,
              name:          user.name  ?? email.split("@")[0],
              role:          "staff",
              image:         user.image ?? null,
              googleId:      account.providerAccountId,
              emailVerified: new Date(),
            },
          });
        } else {
          if (!existing.active) return false; // block deactivated accounts

          if (!existing.googleId) {
            await prisma.user.update({
              where: { id: existing.id },
              data:  { googleId: account.providerAccountId, image: user.image ?? undefined },
            });
          }
        }
      }
      return true;
    },

    // ── JWT: embed role + tenant into the token on first sign-in ────────────
    // Subsequent requests only verify the signature (no DB call here).
    // The DB check for revocation / role changes happens in requireAuth().
    async jwt({ token, user }) {
      if (user) {
        const email = (user.email ?? token.email)?.toLowerCase();
        if (email) {
          const dbUser = await prisma.user.findFirst({
            where:  { email },
            select: { id: true, role: true, tenantId: true },
          });
          if (dbUser) {
            token.userId   = dbUser.id;
            token.role     = dbUser.role;
            token.tenantId = dbUser.tenantId;
          }
        }
      }
      return token;
    },

    // ── Session: expose only what the client needs ───────────────────────────
    async session({ session, token }) {
      session.user.id       = (token.userId   as string) ?? "";
      session.user.role     = (token.role     as string) ?? "staff";
      session.user.tenantId = (token.tenantId as string) ?? "";
      return session;
    },
  },
});
