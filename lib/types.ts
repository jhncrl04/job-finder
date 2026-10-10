export type Status = "new" | "saved" | "applied" | "dismissed";

export interface Job {
  id: number;
  job_id: string;
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
  status: Status;
  notes: string | null;
  search_query: string | null;
  created_at: string;
}

export interface SavedSearch {
  id: number;
  query: string;
  country: string;
  date_posted: string;
  remote_only: boolean;
  enabled: boolean;
}

export type MatchMode = "any" | "all";
export type SortMode = "newest" | "salary";
export type PostedWindow = "any" | "today" | "3days" | "week" | "month";

export interface Filters {
  keywords: string[];
  excludes: string[];
  mode: MatchMode;
  titleOnly: boolean;
  remote: boolean;
  posted: PostedWindow;
  sort: SortMode;
}

export const STATUSES: Status[] = ["new", "saved", "applied", "dismissed"];
