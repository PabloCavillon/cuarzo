import type { DefaultSession } from "next-auth";

// Augment the built-in NextAuth types so that session.user has our fields.
declare module "next-auth" {
  interface Session {
    user: {
      id:       string;
      role:     string; // "owner" | "admin" | "staff"
      tenantId: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?:   string;
    role?:     string;
    tenantId?: string;
  }
}
