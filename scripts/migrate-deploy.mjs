import { execSync } from "child_process";
import { config } from "dotenv";
import pg from "pg";

// Load .env for local dev (no-op in Vercel where vars come from the dashboard)
config();

// Use Neon's direct (non-pooled) URL for schema sync.
// POSTGRES_URL_NON_POOLING is injected by Neon's Vercel integration.
// Falls back to DATABASE_URL for local dev.
const dbUrl =
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("No database URL found. Set DATABASE_URL in .env");
  process.exit(1);
}

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
execSync("npx prisma db push", { stdio: "inherit", env });
