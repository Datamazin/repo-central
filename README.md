# RepoCentral — GitHub Guide

Browse GitHub repositories Netflix-style: rows of "genres" (trending, by
language, by topic), hover a card to preview stats and a syntax-highlighted
code snippet, click through for a full detail page with a rendered README
and language breakdown.

## How it works

- **Data**: live GitHub REST/Search API calls, made server-side and cached.
- **Thumbnails**: GitHub's own auto-generated social preview image
  (`https://opengraph.githubassets.com/1/{owner}/{repo}`) — no scraping, no
  code execution, works instantly for any public repo.
- **"Clips"**: a couple of source files fetched from the repo and rendered
  with syntax highlighting (via `shiki`) as a hover preview and on the detail
  page.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### GitHub API rate limits

Unauthenticated requests are limited to 60/hr (general) and 10/min (search),
which the home page will exceed quickly since it renders ~11 rows. Add a
personal access token to raise this to 5,000/hr and 30/min:

1. Create a token at https://github.com/settings/tokens (no scopes needed —
   this app only reads public data).
2. Copy `.env.local.example` to `.env.local` and paste the token in as
   `GITHUB_TOKEN`.
3. Restart `npm run dev`.

## Project structure

- `src/lib/github/client.ts` — GitHub API client (search, repo detail,
  README, languages, code snippets + highlighting).
- `src/lib/github/rows.ts` — curated "genre" row definitions for the home
  page.
- `src/app/page.tsx` — home page (hero + rows).
- `src/app/search/page.tsx` — search results.
- `src/app/repo/[owner]/[repo]/page.tsx` — repo detail page.
- `src/app/api/*` — JSON API routes used by client-side hover fetches.
- `src/components/*` — `Navbar`, `HeroBanner`, `RepoRow`, `RepoCard`.
