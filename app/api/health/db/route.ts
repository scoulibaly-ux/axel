import { NextResponse } from "next/server";
import { ensureSchema, getSql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureSchema();
    const sql = getSql();
    const rows = await sql`SELECT now() AS now`;
    return NextResponse.json({
      ok: true,
      provider: "neon",
      resource: "neon-gray-lever",
      now: rows[0]?.now ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "db_error";
    return NextResponse.json({ ok: false, error: message }, { status: 503 });
  }
}
