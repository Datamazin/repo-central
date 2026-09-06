import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import FavoritesRow from "@/components/FavoritesRow";
import RepoRow from "@/components/RepoRow";
import { searchRepos } from "@/lib/github/client";
import { HOME_ROWS } from "@/lib/github/rows";
import type { RepoRow as RepoRowType } from "@/lib/github/types";

export const revalidate = 1800;

export default async function Home() {
  const rows: RepoRowType[] = await Promise.all(
    HOME_ROWS.map(async (def) => {
      const repos = await searchRepos(def.query, {
        sort: def.sort,
        perPage: 18,
      }).catch(() => []);
      return { id: def.id, title: def.title, repos };
    })
  );

  const nonEmptyRows = rows.filter((row) => row.repos.length > 0);
  const heroRepo = nonEmptyRows[1]?.repos[0] ?? nonEmptyRows[0]?.repos[0];

  return (
    <>
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>
      {heroRepo && <HeroBanner repo={heroRepo} />}
      <main className="relative z-10 -mt-16 pb-16">
        <FavoritesRow />
        {nonEmptyRows.length === 0 ? (
          <div className="px-8 py-24 text-center text-white/60">
            <p>
              Couldn&apos;t load repositories right now. GitHub&apos;s API may
              be rate-limiting unauthenticated requests — add a GITHUB_TOKEN
              in .env.local and restart the dev server.
            </p>
          </div>
        ) : (
          nonEmptyRows.map((row) => (
            <RepoRow key={row.id} title={row.title} repos={row.repos} />
          ))
        )}
      </main>
    </>
  );
}
