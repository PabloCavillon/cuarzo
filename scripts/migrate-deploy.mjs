import { execSync } from "child_process";

// prisma migrate deploy requires a direct (non-pooled) connection for
// pg_advisory_lock. Use DATABASE_URL_UNPOOLED when available (Vercel + Neon),
// falling back to DATABASE_URL for local dev.
const env = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
};

execSync("npx prisma migrate deploy", { stdio: "inherit", env });
