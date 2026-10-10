import { NextRequest, NextResponse } from "next/server";
import { COOKIE, isAuthed } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  if (await isAuthed(req.cookies.get(COOKIE)?.value)) return NextResponse.next();

  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

// The cron route does its own check (CRON_SECRET). Login stays public.
export const config = {
  matcher: ["/((?!login|api/login|api/cron|_next/static|_next/image|favicon.ico).*)"],
};
