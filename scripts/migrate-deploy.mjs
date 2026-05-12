import { execSync } from "child_process";
import pg from "pg";

// Use direct (non-pooled) URL for advisory lock support on Neon.
// Falls back to DATABASE_URL for local dev.
const dbUrl = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
const env   = { ...process.env, DATABASE_URL: dbUrl };

// Neon free tier suspends the compute after inactivity. Wake it up with a
// simple query before attempting the migration advisory lock (10s timeout).
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

async function run() {
  await wake();

  let attempts = 3;
  while (attempts > 0) {
    try {
      execSync("npx prisma migrate deploy", { stdio: "inherit", env });
      return;
    } catch {
      attempts--;
      if (attempts === 0) throw new Error("prisma migrate deploy failed after 3 attempts");
      console.log(`Migration failed — retrying in 8s (${attempts} left)…`);
      await new Promise((r) => setTimeout(r, 8_000));
    }
  }
}

await run();
