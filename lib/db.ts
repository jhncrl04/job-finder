import { Pool } from "pg";

const globalForPg = globalThis as unknown as { pgPool?: Pool };

export const pool =
  globalForPg.pgPool ??
  new Pool({ connectionString: process.env.DATABASE_URL, max: 3 });

if (process.env.NODE_ENV !== "production") globalForPg.pgPool = pool;

export async function query<T = any>(text: string, params: unknown[] = []): Promise<T[]> {
  const result = await pool.query(text, params as any[]);
  return result.rows as T[];
}

// Columns returned to the UI. salary_max is cast so it arrives as a number.
export const JOB_COLS = `id, job_id, title, company, location, is_remote, employment_type,
  salary, salary_max::float8 AS salary_max, apply_link, google_link, source,
  posted_at, description, status, notes, search_query, created_at`;
