import { NextResponse } from "next/server";
import { ensureSchema, getSql } from "@/lib/db";

export const dynamic = "force-dynamic";

const SNAPSHOT_ID = "default";

export async function GET() {
  try {
    await ensureSchema();
    const sql = getSql();
    const rows = await sql`
      SELECT data, updated_at
      FROM app_snapshots
      WHERE id = ${SNAPSHOT_ID}
    `;
    if (!rows[0]) {
      return NextResponse.json({ state: null, updatedAt: null });
    }
    return NextResponse.json({
      state: rows[0].data,
      updatedAt: rows[0].updated_at,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "db_error";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  try {
    await ensureSchema();
    const body = await request.json();
    const state = body?.state ?? body;
    const sql = getSql();
    await sql`
      INSERT INTO app_snapshots (id, data, updated_at)
      VALUES (${SNAPSHOT_ID}, ${JSON.stringify(state)}::jsonb, now())
      ON CONFLICT (id)
      DO UPDATE SET data = excluded.data, updated_at = now()
    `;
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "db_error";
    return NextResponse.json({ ok: false, error: message }, { status: 503 });
  }
}
