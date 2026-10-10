import { NextRequest, NextResponse } from "next/server";
import { JOB_COLS, query } from "@/lib/db";

const STATUSES = ["new", "saved", "applied", "dismissed"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const jobId = Number(id);
  if (!Number.isInteger(jobId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const sets: string[] = [];
  const values: unknown[] = [];

  if (typeof body.status === "string") {
    if (!STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    values.push(body.status);
    sets.push(`status = $${values.length}`);
  }
  if (typeof body.notes === "string") {
    values.push(body.notes.slice(0, 5000));
    sets.push(`notes = $${values.length}`);
  }
  if (!sets.length) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  values.push(jobId);
  const rows = await query(
    `UPDATE jobs SET ${sets.join(", ")} WHERE id = $${values.length} RETURNING ${JOB_COLS}`,
    values
  );
  if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}
