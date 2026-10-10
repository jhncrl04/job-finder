"use client";

import { useId, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const TONES = {
  lav: "bg-lav-soft text-lav-deep",
  rose: "bg-rose-soft text-rose-deep",
};

interface Props {
  label: string;
  hint?: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  tone?: keyof typeof TONES;
}

// Type a word and press Enter (or comma) to turn it into a removable chip.
export default function ChipInput({ label, hint, values, onChange, placeholder, tone = "lav" }: Props) {
  const id = useId();
  const [draft, setDraft] = useState("");

  function commit(raw: string) {
    const incoming = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (incoming.length) {
      const seen = new Set(values.map((v) => v.toLowerCase()));
      const next = [...values];
      for (const word of incoming) {
        if (!seen.has(word.toLowerCase())) {
          seen.add(word.toLowerCase());
          next.push(word);
        }
      }
      onChange(next);
    }
    setDraft("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit(draft);
    } else if (e.key === "Backspace" && !draft && values.length) {
      onChange(values.slice(0, -1));
    }
  }

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-line bg-white p-2 focus-within:border-lav">
        {values.map((v) => (
          <span key={v} className={cn("chip pr-1.5", TONES[tone])}>
            {v}
            <button
              type="button"
              onClick={() => onChange(values.filter((x) => x !== v))}
              aria-label={`Remove ${v}`}
              className="grid size-4 place-items-center rounded-full hover:bg-white/70"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => commit(draft)}
          placeholder={values.length ? "" : placeholder}
          className="min-w-[7rem] flex-1 bg-transparent px-1.5 py-1 text-sm placeholder:text-ink-faint focus:outline-none"
        />
      </div>
      {hint && <p className="mt-1.5 text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}
