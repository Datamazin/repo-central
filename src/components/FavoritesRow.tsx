"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Settings, Sparkles } from "lucide-react";
import type { GithubRepo } from "@/lib/github/types";
import { getPreferences } from "@/lib/preferences";
import RepoRow from "./RepoRow";

export default function FavoritesRow() {
  const [status, setStatus] = useState<"loading" | "empty" | "no-prefs" | "ready">(
    "loading"
  );
  const [repos, setRepos] = useState<GithubRepo[]>([]);

  useEffect(() => {
    const prefs = getPreferences();
    if (!prefs) {
      setStatus("no-prefs");
      return;
    }
    const params = new URLSearchParams();
    if (prefs.languages.length) params.set("languages", prefs.languages.join(","));
    if (prefs.topics.length) params.set("topics", prefs.topics.join(","));
    if (prefs.terms.length) params.set("terms", prefs.terms.join(","));

    fetch(`/api/favorites?${params}`)
      .then((res) => (res.ok ? res.json() : { repos: [] }))
      .then((data) => {
        setRepos(data.repos ?? []);
        setStatus(data.repos?.length ? "ready" : "empty");
      })
      .catch(() => setStatus("empty"));
  }, []);

  if (status === "loading") return null;

  if (status === "no-prefs") {
    return (
      <section className="px-4 py-4 sm:px-8">
        <Link
          href="/setup"
          className="flex items-center gap-3 rounded-md border border-dashed border-white/20 px-4 py-4 text-white/70 transition-colors hover:border-accent/60 hover:text-white"
        >
          <Sparkles className="h-5 w-5 shrink-0 text-accent" />
          <span className="text-sm">
            Set up your interests to see a personalized{" "}
            <span className="font-semibold text-white">Favorites</span> row.
          </span>
        </Link>
      </section>
    );
  }

  if (status === "empty") return null;

  return (
    <RepoRow
      title="Your Favorites"
      repos={repos}
      action={
        <Link
          href="/setup"
          className="flex items-center gap-1 text-xs text-white/50 transition-colors hover:text-white"
        >
          <Settings className="h-3.5 w-3.5" />
          Edit interests
        </Link>
      }
    />
  );
}
