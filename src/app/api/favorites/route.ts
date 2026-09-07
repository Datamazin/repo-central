import { NextResponse } from "next/server";
import { searchRepos } from "@/lib/github/client";
import type { GithubRepo } from "@/lib/github/types";

const MAX_QUERIES = 6;
const RESULT_LIMIT = 18;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const languages = searchParams.get("languages")?.split(",").filter(Boolean) ?? [];
  const topics = searchParams.get("topics")?.split(",").filter(Boolean) ?? [];
  const terms = searchParams.get("terms")?.split(",").filter(Boolean) ?? [];

  // GitHub's search API doesn't support OR-ing multiple values for a single
  // qualifier (e.g. language:A OR language:B silently matches nothing), so
  // each selected interest is queried separately and the results merged.
  const queries = [
    ...languages.map((lang) => `language:${lang} stars:>100`),
    ...topics.map((topic) => `topic:${topic} stars:>100`),
    ...terms.map((term) => `${term} in:name,description,topics stars:>50`),
  ].slice(0, MAX_QUERIES);

  if (queries.length === 0) {
    return NextResponse.json({ repos: [] });
  }

  const perQuery = Math.max(6, Math.ceil((RESULT_LIMIT * 1.5) / queries.length));
  const results = await Promise.all(
    queries.map((q) =>
      searchRepos(q, { sort: "stars", perPage: perQuery }).catch(() => [])
    )
  );

  const seen = new Map<number, GithubRepo>();
  for (const repos of results) {
    for (const repo of repos) {
      if (!seen.has(repo.id)) seen.set(repo.id, repo);
    }
  }

  const merged = Array.from(seen.values())
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, RESULT_LIMIT);

  return NextResponse.json({ repos: merged });
}
