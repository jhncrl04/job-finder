-- Run this once in your Postgres SQL editor (e.g. Neon).

CREATE TABLE IF NOT EXISTS jobs (
  id              SERIAL PRIMARY KEY,
  job_id          TEXT NOT NULL UNIQUE,          -- id from the API
  dedupe_key      TEXT NOT NULL UNIQUE,          -- company|title|location, catches the same job on two boards
  title           TEXT NOT NULL,
  company         TEXT NOT NULL DEFAULT '',
  location        TEXT,
  is_remote       BOOLEAN NOT NULL DEFAULT false,
  employment_type TEXT,
  salary          TEXT,
  salary_max      NUMERIC,
  apply_link      TEXT,
  google_link     TEXT,
  source          TEXT,
  posted_at       TIMESTAMPTZ,
  description     TEXT,
  status          TEXT NOT NULL DEFAULT 'new'
                  CHECK (status IN ('new', 'saved', 'applied', 'dismissed')),
  notes           TEXT,
  search_query    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS jobs_status_idx ON jobs (status);
CREATE INDEX IF NOT EXISTS jobs_posted_idx ON jobs (posted_at DESC);

CREATE TABLE IF NOT EXISTS searches (
  id          SERIAL PRIMARY KEY,
  query       TEXT NOT NULL,
  country     TEXT NOT NULL DEFAULT 'ph',
  date_posted TEXT NOT NULL DEFAULT 'week',
  remote_only BOOLEAN NOT NULL DEFAULT false,
  enabled     BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (query, country)
);

-- A starter search so the first fetch has something to do.
INSERT INTO searches (query, country, date_posted)
VALUES ('dynamics 365 developer in Philippines', 'ph', 'week')
ON CONFLICT DO NOTHING;
