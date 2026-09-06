import { NextResponse } from "next/server";
import { searchRepos } from "@/lib/github/client";
import { HOME_ROWS } from "@/lib/github/rows";
import type { RepoRow } from "@/lib/github/types";

export async function GET() {
  const rows: RepoRow[] = await Promise.all(
    HOME_ROWS.map(async (def) => {
      const repos = await searchRepos(def.query, {
        sort: def.sort,
        perPage: 18,
      }).catch(() => []);
      return { id: def.id, title: def.title, repos };
    })
  );

  const nonEmpty = rows.filter((row) => row.repos.length > 0);
  return NextResponse.json({ rows: nonEmpty });
}
