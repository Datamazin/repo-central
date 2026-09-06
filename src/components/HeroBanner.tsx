import Link from "next/link";
import { Star, GitFork, Info } from "lucide-react";
import type { GithubRepo } from "@/lib/github/types";

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export default function HeroBanner({ repo }: { repo: GithubRepo }) {
  const backdrop = `https://opengraph.githubassets.com/1/${repo.full_name}`;

  return (
    <div className="relative h-[70vh] min-h-[420px] w-full overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={backdrop}
        alt={`${repo.full_name} preview`}
        className="absolute inset-0 h-full w-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/20 to-transparent" />

      <div className="relative z-10 flex h-full flex-col justify-end gap-4 px-4 pb-16 sm:px-8 sm:pb-24">
        <span className="text-xs font-semibold uppercase tracking-widest text-accent">
          Featured Repository
        </span>
        <h1 className="max-w-2xl text-4xl font-extrabold text-white drop-shadow-lg sm:text-6xl">
          {repo.name}
        </h1>
        <p className="max-w-xl text-sm text-white/80 sm:text-base line-clamp-3">
          {repo.description ?? "No description provided."}
        </p>
        <div className="flex items-center gap-4 text-sm text-white/70">
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400" />
            {formatCount(repo.stargazers_count)} stars
          </span>
          <span className="flex items-center gap-1">
            <GitFork className="h-4 w-4" />
            {formatCount(repo.forks_count)} forks
          </span>
          {repo.language && <span>{repo.language}</span>}
        </div>
        <div className="mt-2 flex gap-3">
          <Link
            href={`/repo/${repo.owner.login}/${repo.name}`}
            className="flex items-center gap-2 rounded bg-white px-6 py-2.5 font-semibold text-black transition hover:bg-white/80"
          >
            <Info className="h-5 w-5" />
            More Info
          </Link>
          <a
            href={repo.html_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded bg-white/20 px-6 py-2.5 font-semibold text-white backdrop-blur transition hover:bg-white/30"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
