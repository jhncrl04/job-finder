"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ListFilter, LogOut, RefreshCw, Search, Settings2 } from "lucide-react";
import FilterPanel from "@/components/FilterPanel";
import JobCard from "@/components/JobCard";
import JobDrawer from "@/components/JobDrawer";
import SearchesDialog from "@/components/SearchesDialog";
import { cn } from "@/lib/utils";
import { STATUSES, type Filters, type Job, type Status } from "@/lib/types";

const DEFAULT_FILTERS: Filters = {
  keywords: [],
  excludes: [],
  mode: "any",
  titleOnly: false,
  remote: false,
  posted: "any",
  sort: "newest",
};

const TAB_LABEL: Record<Status, string> = { new: "New", saved: "Saved", applied: "Applied", dismissed: "Dismissed" };
const TAB_ACTIVE: Record<Status, string> = {
  new: "bg-sky text-ink",
  saved: "bg-peach text-ink",
  applied: "bg-mint text-ink",
  dismissed: "bg-rose text-ink",
};
const MOVED: Record<Status, string> = {
  new: "Moved back to New",
  saved: "Saved",
  applied: "Marked as applied",
  dismissed: "Dismissed",
};

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export default function Dashboard() {
  const [status, setStatus] = useState<Status>("new");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [counts, setCounts] = useState<Record<Status, number>>({ new: 0, saved: 0, applied: 0, dismissed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Job | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchesOpen, setSearchesOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const reqId = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4500);
  }, []);

  const patchFilters = (p: Partial<Filters>) => setFilters((f) => ({ ...f, ...p }));
  const activeCount =
    filters.keywords.length +
    filters.excludes.length +
    (filters.titleOnly ? 1 : 0) +
    (filters.remote ? 1 : 0) +
    (filters.posted !== "any" ? 1 : 0);

  const load = useCallback(async () => {
    const id = ++reqId.current;
    setLoading(true);
    setError(null);
    const p = new URLSearchParams({ status, mode: filters.mode, posted: filters.posted, sort: filters.sort });
    if (filters.keywords.length) p.set("q", filters.keywords.join(","));
    if (filters.excludes.length) p.set("x", filters.excludes.join(","));
    if (filters.titleOnly) p.set("title_only", "1");
    if (filters.remote) p.set("remote", "1");
    try {
      const res = await fetch(`/api/jobs?${p}`);
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!res.ok) throw new Error("bad response");
      const data = await res.json();
      if (id !== reqId.current) return;
      setJobs(data.jobs);
      setCounts(data.counts);
    } catch {
      if (id === reqId.current) {
        setError("Could not load listings. Check that DATABASE_URL is set and schema.sql has been run.");
      }
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, [status, filters]);

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  async function changeStatus(job: Job, next: Status) {
    const res = await fetch(`/api/jobs/${job.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (!res.ok) return showToast("Could not update that listing. Try again.");
    const updated: Job = await res.json();
    setSelected((s) => (s && s.id === updated.id ? updated : s));
    setJobs((list) =>
      updated.status === status ? list.map((j) => (j.id === updated.id ? updated : j)) : list.filter((j) => j.id !== updated.id)
    );
    setCounts((c) => ({ ...c, [job.status]: Math.max(0, c[job.status] - 1), [next]: c[next] + 1 }));
    showToast(MOVED[next]);
  }

  async function saveNotes(job: Job, notes: string) {
    const res = await fetch(`/api/jobs/${job.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    if (!res.ok) return showToast("Could not save your notes. Try again.");
    const updated: Job = await res.json();
    setSelected((s) => (s && s.id === updated.id ? updated : s));
    setJobs((list) => list.map((j) => (j.id === updated.id ? updated : j)));
  }

  async function fetchNow() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/fetch", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Fetch failed");
      if (data.errors?.length) {
        showToast(`${plural(data.inserted, "new listing", "new listings")}, but a search failed: ${data.errors[0]}`);
      } else if (data.searches === 0) {
        showToast("You have no active searches. Add one under Searches.");
      } else {
        showToast(`${plural(data.inserted, "new listing", "new listings")} from ${plural(data.searches, "search", "searches")}`);
      }
      load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Fetch failed. Try again.");
    } finally {
      setRefreshing(false);
    }
  }

  async function logout() {
    await fetch("/api/login", { method: "DELETE" });
    window.location.href = "/login";
  }

  const hasAnyJobs = Object.values(counts).some((n) => n > 0);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-line bg-canvas/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <div className="grid size-10 place-items-center rounded-2xl bg-lav text-lav-deep">
            <Search size={19} strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-xl font-bold">Job finder</h1>
          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={() => setSearchesOpen(true)} className="btn btn-quiet px-3 sm:px-4" aria-label="Saved searches">
              <Settings2 size={17} />
              <span className="hidden sm:inline">Searches</span>
            </button>
            <button type="button" onClick={fetchNow} disabled={refreshing} className="btn btn-primary px-3 sm:px-4">
              <RefreshCw size={17} className={cn(refreshing && "animate-spin")} />
              <span className="hidden sm:inline">{refreshing ? "Fetching..." : "Fetch now"}</span>
              <span className="sr-only sm:hidden">Fetch now</span>
            </button>
            <button type="button" onClick={logout} aria-label="Sign out" title="Sign out" className="icon-btn">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-8">
        <FilterPanel
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          filters={filters}
          onChange={patchFilters}
          onClear={() => setFilters(DEFAULT_FILTERS)}
          activeCount={activeCount}
        />

        <section className="min-w-0">
          <div role="tablist" aria-label="Listing status" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={status === s}
                onClick={() => setStatus(s)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                  status === s ? `${TAB_ACTIVE[s]} border-transparent` : "border-line bg-white text-ink-soft hover:bg-lav-soft"
                )}
              >
                {TAB_LABEL[s]}
                <span className={cn("rounded-full px-1.5 text-xs", status === s ? "bg-white/70" : "bg-lav-soft text-lav-deep")}>{counts[s]}</span>
              </button>
            ))}
          </div>

          <div className="mb-4 mt-5 flex items-center justify-between gap-3">
            <p className="text-sm text-ink-soft" aria-live="polite">
              {loading ? "Loading listings..." : plural(jobs.length, "listing", "listings")}
            </p>
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="btn btn-quiet px-3.5 py-2 lg:hidden"
            >
              <ListFilter size={16} />
              Filters
              {activeCount > 0 && <span className="rounded-full bg-lav px-1.5 text-xs text-ink">{activeCount}</span>}
            </button>
          </div>

          {error && (
            <p role="alert" className="mb-4 rounded-2xl bg-rose-soft px-4 py-3 text-sm text-rose-deep">
              {error}
            </p>
          )}

          {loading && jobs.length === 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-60 animate-pulse rounded-3xl bg-lav-soft/70" />
              ))}
            </div>
          ) : jobs.length === 0 && !error ? (
            <div className="rounded-3xl border border-dashed border-lav bg-white p-8 text-center sm:p-12">
              {activeCount > 0 ? (
                <>
                  <h2 className="font-display text-lg font-semibold">No listings match these filters</h2>
                  <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">Try fewer keywords, switch to Match any, or widen the posted date.</p>
                  <button type="button" onClick={() => setFilters(DEFAULT_FILTERS)} className="btn btn-quiet mt-5">
                    Clear filters
                  </button>
                </>
              ) : !hasAnyJobs ? (
                <>
                  <h2 className="font-display text-lg font-semibold">No listings yet</h2>
                  <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">Fetch now pulls listings for your saved searches. After that it runs once a day.</p>
                  <button type="button" onClick={fetchNow} disabled={refreshing} className="btn btn-primary mt-5">
                    <RefreshCw size={16} className={cn(refreshing && "animate-spin")} />
                    Fetch now
                  </button>
                </>
              ) : (
                <>
                  <h2 className="font-display text-lg font-semibold">Nothing in {TAB_LABEL[status]}</h2>
                  <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">Listings you move here will show up in this tab.</p>
                </>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} terms={filters.keywords} onOpen={setSelected} onStatus={changeStatus} />
              ))}
            </div>
          )}
        </section>
      </main>

      {selected && (
        <JobDrawer
          key={selected.id}
          job={selected}
          terms={filters.keywords}
          onClose={() => setSelected(null)}
          onStatus={changeStatus}
          onNotes={saveNotes}
        />
      )}
      {searchesOpen && <SearchesDialog onClose={() => setSearchesOpen(false)} />}

      {toast && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-[60] max-w-[90vw] -translate-x-1/2 animate-rise-in rounded-full bg-ink px-5 py-2.5 text-sm text-white shadow-lift"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
