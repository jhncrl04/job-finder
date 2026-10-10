import { NextResponse } from "next/server";
import { COOKIE, sessionToken } from "@/lib/auth";

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  if (!process.env.APP_PASSWORD || !process.env.SESSION_SECRET) {
    return NextResponse.json(
      { error: "APP_PASSWORD and SESSION_SECRET are not set on the server." },
      { status: 500 }
    );
  }
  if (password !== process.env.APP_PASSWORD) {
    return NextResponse.json({ error: "That password is not correct." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, await sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
