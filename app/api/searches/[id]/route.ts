import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (typeof body.enabled !== "boolean") {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }
  const rows = await query("UPDATE searches SET enabled = $1 WHERE id = $2 RETURNING *", [
    body.enabled,
    Number(id),
  ]);
  if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await query("DELETE FROM searches WHERE id = $1", [Number(id)]);
  return NextResponse.json({ ok: true });
}
