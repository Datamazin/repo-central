"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Clapperboard } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-colors duration-300 ${
        scrolled ? "bg-black" : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <div className="flex items-center gap-6 px-4 py-3 sm:px-8">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Clapperboard className="h-7 w-7 text-accent" strokeWidth={2.5} />
          <span className="text-xl font-bold tracking-tight text-accent">
            RepoFlix
          </span>
        </Link>
        <form onSubmit={handleSubmit} className="ml-auto w-full max-w-xs">
          <div className="flex items-center gap-2 rounded-md border border-white/20 bg-black/60 px-3 py-1.5 focus-within:border-white/60">
            <Search className="h-4 w-4 text-white/60 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search repositories..."
              className="w-full bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
            />
          </div>
        </form>
      </div>
    </header>
  );
}
