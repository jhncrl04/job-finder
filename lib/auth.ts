// Single-user auth. The cookie holds a hash of APP_PASSWORD + SESSION_SECRET.
// Uses Web Crypto so it works in both middleware (edge) and route handlers.
export const COOKIE = "jf_session";

export async function sessionToken(): Promise<string> {
  const data = new TextEncoder().encode(
    `${process.env.APP_PASSWORD}:${process.env.SESSION_SECRET}`
  );
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function isAuthed(value?: string): Promise<boolean> {
  if (!process.env.APP_PASSWORD || !process.env.SESSION_SECRET) return false;
  return value === (await sessionToken());
}
