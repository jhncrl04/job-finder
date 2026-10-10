import { query } from "@/lib/db";
import { normalize, searchJobs } from "@/lib/jsearch";
import type { SavedSearch } from "@/lib/types";

export interface FetchSummary {
  searches: number;
  fetched: number;
  inserted: number;
  errors: string[];
}

// Runs every enabled saved search once and stores anything new.
// Duplicates (same API id, or same company+title+location) are skipped by the database.
export async function runFetch(): Promise<FetchSummary> {
  const searches = await query<SavedSearch>("SELECT * FROM searches WHERE enabled ORDER BY id");
  const summary: FetchSummary = { searches: searches.length, fetched: 0, inserted: 0, errors: [] };

  for (const s of searches) {
    try {
      const rows = await searchJobs({
        query: s.query,
        country: s.country,
        datePosted: s.date_posted,
        remoteOnly: s.remote_only,
      });
      summary.fetched += rows.length;

      for (const raw of rows) {
        const j = normalize(raw, s.query);
        if (!j) continue;
        const inserted = await query(
          `INSERT INTO jobs (job_id, dedupe_key, title, company, location, is_remote,
             employment_type, salary, salary_max, apply_link, google_link, source,
             posted_at, description, search_query)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
           ON CONFLICT DO NOTHING
           RETURNING id`,
          [
            j.job_id, j.dedupe_key, j.title, j.company, j.location, j.is_remote,
            j.employment_type, j.salary, j.salary_max, j.apply_link, j.google_link,
            j.source, j.posted_at, j.description, j.search_query,
          ]
        );
        summary.inserted += inserted.length;
      }
    } catch (e) {
      summary.errors.push(`${s.query}: ${e instanceof Error ? e.message : "Unknown error"}`);
    }
  }
  return summary;
}
