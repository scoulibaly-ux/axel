import { neon } from "@neondatabase/serverless";

export function getSql() {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!url || url.includes("[SENSITIVE]")) {
    throw new Error("DATABASE_URL is not configured");
  }
  return neon(url);
}

export async function ensureSchema() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS app_snapshots (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
}
