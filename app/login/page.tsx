"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        window.location.href = "/";
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not sign in. Try again.");
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-3xl border border-line bg-white p-7 shadow-soft"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-lav text-lav-deep">
            <Search size={20} strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-2xl font-bold">Job finder</h1>
        </div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoFocus
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field"
        />
        {error && (
          <p role="alert" className="mt-3 rounded-xl bg-rose-soft px-3 py-2 text-sm text-rose-deep">
            {error}
          </p>
        )}
        <button type="submit" disabled={busy || !password} className="btn btn-primary mt-5 w-full">
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
