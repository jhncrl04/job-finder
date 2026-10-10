"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SavedSearch } from "@/lib/types";

const WINDOW_LABEL: Record<string, string> = {
  all: "Any time",
  today: "Today",
  "3days": "Last 3 days",
  week: "Last week",
  month: "Last month",
};

export default function SearchesDialog({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState<SavedSearch[] | null>(null);
  const [text, setText] = useState("");
  const [country, setCountry] = useState("ph");
  const [windowPosted, setWindowPosted] = useState("week");
  const [remote, setRemote] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/searches");
    if (res.ok) setItems(await res.json());
    else setError("Could not load your searches.");
  }, []);

  useEffect(() => {
    load();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [load, onClose]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/searches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: text, country, date_posted: windowPosted, remote_only: remote }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not add that search.");
      return;
    }
    setText("");
    load();
  }

  async function toggle(s: SavedSearch) {
    await fetch(`/api/searches/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !s.enabled }),
    });
    load();
  }

  async function remove(s: SavedSearch) {
    await fetch(`/api/searches/${s.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center" role="dialog" aria-modal="true" aria-label="Saved searches">
      <div className="absolute inset-0 bg-ink/30" onClick={onClose} aria-hidden="true" />
      <div className="relative max-h-[92vh] w-full animate-rise-in overflow-y-auto rounded-t-3xl bg-white p-6 shadow-lift sm:max-w-lg sm:rounded-3xl">
        <div className="mb-1 flex items-start justify-between gap-4">
          <h2 className="font-display text-xl font-semibold">Saved searches</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="icon-btn">
            <X size={18} />
          </button>
        </div>
        <p className="mb-5 text-sm text-ink-soft">
          Each search runs once a day and whenever you press Fetch now. Put a place in the search, like “power platform developer in Manila”.
        </p>

        <ul className="mb-6 space-y-2">
          {items === null && <li className="h-16 animate-pulse rounded-2xl bg-lav-soft" />}
          {items?.length === 0 && (
            <li className="rounded-2xl bg-lav-soft p-4 text-sm text-lav-deep">No searches yet. Add one below to start collecting listings.</li>
          )}
          {items?.map((s) => (
            <li key={s.id} className="flex items-center gap-3 rounded-2xl border border-line p-3.5">
              <div className="min-w-0 flex-1">
                <p className={cn("truncate font-medium", !s.enabled && "text-ink-faint line-through")}>{s.query}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <span className="chip bg-sky-soft text-sky-deep">{s.country.toUpperCase()}</span>
                  <span className="chip bg-lav-soft text-lav-deep">{WINDOW_LABEL[s.date_posted] ?? s.date_posted}</span>
                  {s.remote_only && <span className="chip bg-mint-soft text-mint-deep">Remote only</span>}
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={s.enabled}
                aria-label={s.enabled ? `Pause ${s.query}` : `Resume ${s.query}`}
                onClick={() => toggle(s)}
                className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", s.enabled ? "bg-mint-deep" : "bg-line")}
              >
                <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-all", s.enabled ? "left-[22px]" : "left-0.5")} />
              </button>
              <button type="button" onClick={() => remove(s)} aria-label={`Delete ${s.query}`} className="icon-btn">
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>

        <form onSubmit={add} className="space-y-3 rounded-2xl bg-canvas p-4">
          <label htmlFor="new-search" className="block text-sm font-semibold">
            New search
          </label>
          <input
            id="new-search"
            className="field"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="dynamics 365 developer in Philippines"
          />
          <div className="grid grid-cols-[5rem_1fr] gap-3">
            <div>
              <label htmlFor="country" className="mb-1 block text-xs font-medium text-ink-soft">
                Country
              </label>
              <input id="country" className="field" maxLength={2} value={country} onChange={(e) => setCountry(e.target.value)} />
            </div>
            <div>
              <label htmlFor="window" className="mb-1 block text-xs font-medium text-ink-soft">
                Posted
              </label>
              <select id="window" className="field" value={windowPosted} onChange={(e) => setWindowPosted(e.target.value)}>
                {Object.entries(WINDOW_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2.5 text-sm">
            <input type="checkbox" checked={remote} onChange={(e) => setRemote(e.target.checked)} className="size-4 accent-[#5B49C2]" />
            Remote jobs only
          </label>
          {error && (
            <p role="alert" className="rounded-xl bg-rose-soft px-3 py-2 text-sm text-rose-deep">
              {error}
            </p>
          )}
          <button type="submit" disabled={busy || !text.trim()} className="btn btn-primary w-full">
            <Plus size={16} />
            Add search
          </button>
        </form>
      </div>
    </div>
  );
}
