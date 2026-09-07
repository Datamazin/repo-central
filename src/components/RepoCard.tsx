"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Star, GitFork, Code2, Loader2, Activity } from "lucide-react";
import type { GithubRepo, RepoDetail } from "@/lib/github/types";
import { LANGUAGE_COLORS } from "@/lib/languageColors";

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export default function RepoCard({ repo }: { repo: GithubRepo }) {
  const [hovered, setHovered] = useState(false);
  const [detail, setDetail] = useState<RepoDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchDetail = useCallback(() => {
    if (detail || loading) return;
    setLoading(true);
    fetch(`/api/repo/${repo.owner.login}/${repo.name}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setDetail(data))
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [detail, loading, repo.owner.login, repo.name]);

  function handleEnter() {
    timeoutRef.current = setTimeout(() => {
      setHovered(true);
      fetchDetail();
    }, 350);
  }

  function handleLeave() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHovered(false);
  }

  const thumbnail = `https://opengraph.githubassets.com/1/${repo.full_name}`;
  const snippet = detail?.files?.[0];
  const commitActivity = detail?.commitActivity;
  const maxCommits = commitActivity ? Math.max(...commitActivity, 1) : 0;

  return (
    <div
      className="relative w-64 shrink-0"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <Link href={`/repo/${repo.owner.login}/${repo.name}`}>
        <div
          className={`overflow-hidden rounded-md border bg-neutral-900 transition-all duration-200 ${
            hovered
              ? "border-white/60 shadow-2xl shadow-black/80"
              : "border-white/10"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnail}
            alt={`${repo.full_name} preview`}
            className="aspect-video w-full object-cover"
            loading="lazy"
          />
        </div>
      </Link>
      <p className="mt-1 truncate text-xs text-white/70">{repo.full_name}</p>

      {hovered && (
        <div className="absolute left-0 top-full z-20 w-64 origin-top rounded-md border border-white/20 bg-neutral-900 p-3 shadow-2xl shadow-black/80 animate-fade-in">
          <p className="mt-1 line-clamp-2 text-xs text-white/60">
            {repo.description ?? "No description provided."}
          </p>
          <div className="mt-2 flex items-center gap-3 text-xs text-white/70">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-400" />
              {formatCount(repo.stargazers_count)}
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="h-3 w-3" />
              {formatCount(repo.forks_count)}
            </span>
            {repo.language && (
              <span className="flex items-center gap-1">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor:
                      LANGUAGE_COLORS[repo.language] ?? "#8b949e",
                  }}
                />
                {repo.language}
              </span>
            )}
          </div>

          <div className="mt-3 rounded bg-black/60 p-2">
            <div className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-wide text-white/40">
              <Code2 className="h-3 w-3" />
              {snippet ? snippet.path : "Code preview"}
            </div>
            {loading && (
              <div className="flex items-center gap-2 py-2 text-xs text-white/40">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading clip...
              </div>
            )}
            {!loading && snippet && (
              <div
                className="max-h-28 overflow-hidden text-[10px] leading-tight [&_pre]:whitespace-pre-wrap [&_pre]:break-all"
                dangerouslySetInnerHTML={{ __html: snippet.html }}
              />
            )}
            {!loading && detail && !snippet && (
              <p className="py-2 text-xs text-white/40">
                No preview available.
              </p>
            )}
          </div>

          {!loading && commitActivity && (
            <div className="mt-2 rounded bg-black/60 p-2">
              <div className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-wide text-white/40">
                <Activity className="h-3 w-3" />
                Commit Activity
              </div>
              <div className="flex h-8 items-end gap-px">
                {commitActivity.map((total, i) => (
                  <div
                    key={i}
                    title={`${total} commit${total === 1 ? "" : "s"}`}
                    className="flex-1 rounded-t-sm bg-accent/70"
                    style={{
                      height: `${Math.max((total / maxCommits) * 100, total > 0 ? 6 : 0)}%`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
