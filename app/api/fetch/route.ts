import { NextResponse } from "next/server";
import { runFetch } from "@/lib/fetchJobs";

export const maxDuration = 60;

// "Fetch now" button. Protected by the login middleware.
export async function POST() {
  const summary = await runFetch();
  return NextResponse.json(summary);
}
