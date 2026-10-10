import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

const WINDOWS = ["all", "today", "3days", "week", "month"];

export async function GET() {
  const rows = await query("SELECT * FROM searches ORDER BY id");
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const text = typeof body.query === "string" ? body.query.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "Enter a search, like “dynamics 365 developer in Philippines”." }, { status: 400 });
  }
  const country = (typeof body.country === "string" ? body.country : "ph").trim().toLowerCase().slice(0, 2) || "ph";
  const datePosted = WINDOWS.includes(body.date_posted) ? body.date_posted : "week";

  const rows = await query(
    `INSERT INTO searches (query, country, date_posted, remote_only)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (query, country) DO NOTHING
     RETURNING *`,
    [text.slice(0, 200), country, datePosted, Boolean(body.remote_only)]
  );
  if (!rows.length) {
    return NextResponse.json({ error: "You already have that search for this country." }, { status: 409 });
  }
  return NextResponse.json(rows[0]);
}
