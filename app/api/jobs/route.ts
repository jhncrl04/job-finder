import { NextRequest, NextResponse } from "next/server";
import { JOB_COLS, query } from "@/lib/db";

const POSTED: Record<string, string> = {
  today: "1 day",
  "3days": "3 days",
  week: "7 days",
  month: "30 days",
};

function list(value: string | null): string[] {
  return (value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);
}

// Escape LIKE wildcards so a keyword like "100%" is matched literally.
const like = (s: string) => `%${s.replace(/[\\%_]/g, (m) => "\\" + m)}%`;

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const keywords = list(sp.get("q"));
  const excludes = list(sp.get("x"));
  const mode = sp.get("mode") === "all" ? "all" : "any";
  const titleOnly = sp.get("title_only") === "1";
  const status = ["new", "saved", "applied", "dismissed"].includes(sp.get("status") ?? "")
    ? (sp.get("status") as string)
    : "new";
  const posted = POSTED[sp.get("posted") ?? ""];
  const sort = sp.get("sort") === "salary" ? "salary" : "newest";

  const params: unknown[] = [];
  const add = (v: unknown) => {
    params.push(v);
    return `$${params.length}`;
  };

  const where: string[] = [`status = ${add(status)}`];

  if (keywords.length) {
    const parts = keywords.map((k) => {
      const p = add(like(k));
      return titleOnly
        ? `title ILIKE ${p}`
        : `(title ILIKE ${p} OR COALESCE(description, '') ILIKE ${p})`;
    });
    where.push(`(${parts.join(mode === "all" ? " AND " : " OR ")})`);
  }

  for (const x of excludes) {
    const p = add(like(x));
    where.push(`NOT (title ILIKE ${p} OR company ILIKE ${p} OR COALESCE(description, '') ILIKE ${p})`);
  }

  if (sp.get("remote") === "1") where.push("is_remote = true");
  if (posted) where.push(`posted_at >= now() - interval '${posted}'`);

  const order =
    sort === "salary"
      ? "ORDER BY salary_max DESC NULLS LAST, posted_at DESC NULLS LAST"
      : "ORDER BY posted_at DESC NULLS LAST, created_at DESC";

  const [jobs, counts] = await Promise.all([
    query(`SELECT ${JOB_COLS} FROM jobs WHERE ${where.join(" AND ")} ${order} LIMIT 120`, params),
    query<{ status: string; n: number }>(
      "SELECT status, count(*)::int AS n FROM jobs GROUP BY status"
    ),
  ]);

  const countMap: Record<string, number> = { new: 0, saved: 0, applied: 0, dismissed: 0 };
  for (const c of counts) countMap[c.status] = c.n;

  return NextResponse.json({ jobs, counts: countMap });
}
