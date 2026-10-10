"use client";

import { cn } from "@/lib/utils";
import ChipInput from "@/components/ChipInput";
import type { Filters, PostedWindow, SortMode } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onClear: () => void;
  activeCount: number;
}

// Sidebar on desktop, bottom sheet on phones.
export default function FilterPanel({ open, onClose, filters, onChange, onClear, activeCount }: Props) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-ink/30 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}
      <aside
        aria-label="Filters"
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 max-h-[88vh] overflow-y-auto rounded-t-3xl border border-line bg-white p-5 shadow-lift transition-[transform,visibility] duration-200",
          "lg:sticky lg:inset-x-auto lg:bottom-auto lg:top-24 lg:z-0 lg:max-h-none lg:translate-y-0 lg:self-start lg:overflow-visible lg:rounded-3xl lg:shadow-soft lg:visible",
          open ? "visible translate-y-0" : "invisible translate-y-full"
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Filters</h2>
          {activeCount > 0 && (
            <button type="button" onClick={onClear} className="text-sm font-medium text-lav-deep hover:underline">
              Clear all
            </button>
          )}
        </div>

        <div className="space-y-5">
          <ChipInput
            label="Keywords"
            values={filters.keywords}
            onChange={(keywords) => onChange({ keywords })}
            placeholder="dynamics 365, power apps"
            hint="Press Enter after each keyword."
          />

          <div role="group" aria-label="Keyword matching" className="grid grid-cols-2 gap-1 rounded-full bg-lav-soft p-1">
            {(["any", "all"] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={filters.mode === m}
                onClick={() => onChange({ mode: m })}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
                  filters.mode === m ? "bg-white text-ink shadow-sm" : "text-ink-soft hover:text-ink"
                )}
              >
                Match {m}
              </button>
            ))}
          </div>

          <ChipInput
            label="Hide listings with"
            values={filters.excludes}
            onChange={(excludes) => onChange({ excludes })}
            placeholder="intern, unpaid"
            tone="rose"
          />

          <div className="space-y-3">
            <label className="flex items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={filters.titleOnly}
                onChange={(e) => onChange({ titleOnly: e.target.checked })}
                className="size-4 accent-[#5B49C2]"
              />
              Search titles only
            </label>
            <label className="flex items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={filters.remote}
                onChange={(e) => onChange({ remote: e.target.checked })}
                className="size-4 accent-[#5B49C2]"
              />
              Remote only
            </label>
          </div>

          <div>
            <label htmlFor="posted" className="mb-1.5 block text-sm font-semibold">
              Posted
            </label>
            <select
              id="posted"
              className="field"
              value={filters.posted}
              onChange={(e) => onChange({ posted: e.target.value as PostedWindow })}
            >
              <option value="any">Any time</option>
              <option value="today">Today</option>
              <option value="3days">Last 3 days</option>
              <option value="week">Last week</option>
              <option value="month">Last month</option>
            </select>
          </div>

          <div>
            <label htmlFor="sort" className="mb-1.5 block text-sm font-semibold">
              Sort by
            </label>
            <select
              id="sort"
              className="field"
              value={filters.sort}
              onChange={(e) => onChange({ sort: e.target.value as SortMode })}
            >
              <option value="newest">Newest first</option>
              <option value="salary">Highest salary</option>
            </select>
          </div>
        </div>

        <button type="button" onClick={onClose} className="btn btn-primary mt-6 w-full lg:hidden">
          Show results
        </button>
      </aside>
    </>
  );
}
