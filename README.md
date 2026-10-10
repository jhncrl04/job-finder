# Job finder

A standalone app that pulls job listings from JSearch (Google for Jobs: LinkedIn, Indeed, and others) for your saved keyword searches, stores them in Postgres, and lets you filter, save, and track them. Independent from your application tracker.

Stack: Next.js (App Router), TypeScript, Tailwind CSS, Postgres, Vercel Cron.

## 1. Run it locally

```bash
npm install
cp .env.example .env.local     # then fill in the values
```

| Variable | What it is |
|---|---|
| `JSEARCH_API_KEY` | API key from OpenWeb Ninja (JSearch) |
| `DATABASE_URL` | Postgres connection string |
| `CRON_SECRET` | Any long random string. Protects the cron route |
| `APP_PASSWORD` | The password you will type to sign in |
| `SESSION_SECRET` | Another long random string (signs your session) |

Generate random strings with: `openssl rand -hex 32`

## 2. Create the database tables

1. In Vercel: Storage (or Marketplace) > add a Postgres database (Neon). It adds `DATABASE_URL` to your project.
2. Open the database's SQL editor and run everything in `schema.sql`.

## 3. Start the app

```bash
npm run dev
```

Open http://localhost:3000, sign in, press **Fetch now**.

## 4. Check the first API response (important)

The field names in `lib/jsearch.ts` follow the provider's docs but were not tested against a live response. After your first Fetch now:

- If listings show up with titles, companies, and links, you are done.
- If you get "0 new listings" even though the API returned data, log one raw item (`console.log(rows[0])` in `lib/fetchJobs.ts`) and adjust the field names in `normalize()`.

## 5. Deploy to Vercel

1. Push this folder to a GitHub repo.
2. In Vercel: Add New > Project > import the repo.
3. Add the five environment variables.
4. Deploy.

The daily fetch is defined in `vercel.json` (runs once a day, UTC). Vercel Hobby only allows once-a-day cron jobs and may fire anywhere inside the scheduled hour. Cron runs on production deployments only.

## Project map

```
app/
  page.tsx, login/page.tsx        pages
  api/jobs                        list with filters, update status/notes
  api/searches                    saved searches (add, pause, delete)
  api/fetch                       "Fetch now" button
  api/cron/fetch-jobs             daily job (Bearer CRON_SECRET)
components/                       Dashboard, JobCard, JobDrawer, FilterPanel, ChipInput, SearchesDialog
lib/                              db, jsearch client, fetch runner, auth
schema.sql                        run once in your database
```

## Design tokens

Pastel palette and fonts live in `tailwind.config.ts` and `app/layout.tsx`. Pastels are used for fills and tints; text on them is always the dark ink color or the matching deep tone.
