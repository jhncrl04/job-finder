import { NextResponse } from "next/server";
import { runFetch } from "@/lib/fetchJobs";

export const maxDuration = 60;

// Called by Vercel Cron (see vercel.json). Vercel sends GET with
// "Authorization: Bearer <CRON_SECRET>" when CRON_SECRET is set.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const summary = await runFetch();
  return NextResponse.json(summary);
}
