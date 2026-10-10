// JSearch via OpenWeb Ninja. Field names below follow the provider's published
// docs; they are read defensively, so a missing field never breaks a run.
// Check one real response when you first run it (see README).
const BASE = "https://api.openwebninja.com/jsearch/search";

export interface SearchParams {
  query: string;
  country: string;
  datePosted: string;
  remoteOnly: boolean;
  numPages?: number;
}

export async function searchJobs(p: SearchParams): Promise<Record<string, any>[]> {
  const url = new URL(BASE);
  url.searchParams.set("query", p.query);
  url.searchParams.set("country", p.country);
  url.searchParams.set("date_posted", p.datePosted);
  url.searchParams.set("num_pages", String(p.numPages ?? 1));
  if (p.remoteOnly) url.searchParams.set("work_from_home", "true");

  const res = await fetch(url, {
    headers: { "x-api-key": process.env.JSEARCH_API_KEY ?? "" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`JSearch ${res.status}: ${(await res.text()).slice(0, 160)}`);
  }
  const body = await res.json();
  return Array.isArray(body?.data) ? body.data : [];
}

export interface NormalizedJob {
  job_id: string;
  dedupe_key: string;
  title: string;
  company: string;
  location: string | null;
  is_remote: boolean;
  employment_type: string | null;
  salary: string | null;
  salary_max: number | null;
  apply_link: string | null;
  google_link: string | null;
  source: string | null;
  posted_at: string | null;
  description: string | null;
  search_query: string;
}

function salaryText(raw: Record<string, any>): { text: string | null; max: number | null } {
  const min = Number(raw.job_min_salary) || null;
  const max = Number(raw.job_max_salary) || null;
  if (!min && !max) return { text: null, max: null };
  const cur = raw.job_salary_currency ?? "";
  const per = raw.job_salary_period ? ` / ${String(raw.job_salary_period).toLowerCase()}` : "";
  const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  const range = min && max && min !== max ? `${fmt(min)} to ${fmt(max)}` : fmt((max ?? min) as number);
  return { text: `${cur} ${range}${per}`.trim(), max: max ?? min };
}

export function normalize(raw: Record<string, any>, searchQuery: string): NormalizedJob | null {
  const jobId = raw.job_id ? String(raw.job_id) : null;
  const title = raw.job_title ? String(raw.job_title).trim() : null;
  if (!jobId || !title) return null;

  const company = String(raw.employer_name ?? "").trim();
  const location =
    [raw.job_city, raw.job_state, raw.job_country].filter(Boolean).join(", ") || null;
  const { text: salary, max: salaryMax } = salaryText(raw);

  return {
    job_id: jobId,
    dedupe_key: [company, title, location ?? ""].join("|").toLowerCase(),
    title,
    company,
    location,
    is_remote: Boolean(raw.job_is_remote),
    employment_type: raw.job_employment_type ? String(raw.job_employment_type) : null,
    salary,
    salary_max: salaryMax,
    apply_link: raw.job_apply_link ?? raw.apply_options?.[0]?.apply_link ?? null,
    google_link: raw.job_google_link ?? null,
    source: raw.job_publisher ? String(raw.job_publisher) : null,
    posted_at: raw.job_posted_at_datetime_utc ?? null,
    description: raw.job_description ? String(raw.job_description) : null,
    search_query: searchQuery,
  };
}
