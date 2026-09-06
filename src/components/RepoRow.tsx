"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { GithubRepo } from "@/lib/github/types";
import RepoCard from "./RepoCard";

export default function RepoRow({
  title,
  repos,
}: {
  title: string;
  repos: GithubRepo[];
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollBy(amount: number) {
    scrollerRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  if (repos.length === 0) return null;

  return (
    <section className="relative py-4">
      <h2 className="mb-2 px-4 text-lg font-semibold text-white sm:px-8">
        {title}
      </h2>
      <div className="group/row relative">
        <button
          aria-label="Scroll left"
          onClick={() => scrollBy(-800)}
          className="absolute left-0 top-0 z-10 hidden h-full w-10 items-center justify-center bg-black/50 opacity-0 transition-opacity hover:bg-black/70 group-hover/row:opacity-100 sm:flex"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <div
          ref={scrollerRef}
          className="no-scrollbar flex gap-2 overflow-x-auto scroll-smooth px-4 pb-24 sm:px-8"
        >
          {repos.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
        <button
          aria-label="Scroll right"
          onClick={() => scrollBy(800)}
          className="absolute right-0 top-0 z-10 hidden h-full w-10 items-center justify-center bg-black/50 opacity-0 transition-opacity hover:bg-black/70 group-hover/row:opacity-100 sm:flex"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>
      </div>
    </section>
  );
}
