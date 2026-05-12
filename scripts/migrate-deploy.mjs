import { execSync } from "child_process";
import pg from "pg";

// prisma migrate deploy uses pg_advisory_lock which Neon's pooler blocks.
// prisma db push achieves the same result without advisory locks and is
// safe to run repeatedly (no-op when schema is already in sync).
const dbUrl =
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.DATABASE_URL;

const env = { ...process.env, DATABASE_URL: dbUrl };

async function wake() {
  const client = new pg.Client({ connectionString: dbUrl, connectionTimeoutMillis: 30_000 });
  try {
    await client.connect();
    await client.query("SELECT 1");
    console.log("Database is awake.");
  } finally {
    await client.end().catch(() => {});
  }
}

await wake();
execSync("npx prisma db push --skip-generate", { stdio: "inherit", env });
