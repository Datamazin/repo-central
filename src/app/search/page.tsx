import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import RepoCard from "@/components/RepoCard";
import { searchRepos } from "@/lib/github/client";

export const revalidate = 0;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const repos = query
    ? await searchRepos(query, { sort: "best-match", perPage: 30 })
    : [];

  return (
    <>
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>
      <main className="px-4 pt-24 pb-16 sm:px-8">
        <h1 className="mb-6 text-2xl font-semibold text-white">
          {query ? (
            <>
              Results for <span className="text-accent">&ldquo;{query}&rdquo;</span>
            </>
          ) : (
            "Search for a repository"
          )}
        </h1>
        {query && repos.length === 0 && (
          <p className="text-white/60">No repositories found.</p>
        )}
        <div className="flex flex-wrap gap-x-2 gap-y-10">
          {repos.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      </main>
    </>
  );
}
