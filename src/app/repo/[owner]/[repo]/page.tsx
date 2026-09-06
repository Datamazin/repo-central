import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Star, GitFork, CircleDot, ExternalLink, Code2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { getRepoDetail } from "@/lib/github/client";
import { LANGUAGE_COLORS } from "@/lib/languageColors";

export const revalidate = 3600;

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export default async function RepoDetailPage({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const { owner, repo } = await params;
  const detail = await getRepoDetail(owner, repo);
  if (!detail) notFound();

  const totalBytes = Object.values(detail.languages).reduce((a, b) => a + b, 0);
  const backdrop = `https://opengraph.githubassets.com/1/${detail.full_name}`;

  return (
    <>
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>

      <div className="relative h-[45vh] min-h-[300px] w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={backdrop}
          alt={`${detail.full_name} preview`}
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      <main className="relative z-10 mx-auto -mt-24 max-w-5xl px-4 pb-24 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
              {detail.full_name}
            </h1>
            <p className="mt-2 max-w-2xl text-white/70">
              {detail.description ?? "No description provided."}
            </p>
          </div>
          <a
            href={detail.html_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded bg-white px-5 py-2.5 font-semibold text-black transition hover:bg-white/80"
          >
            <ExternalLink className="h-4 w-4" />
            Open on GitHub
          </a>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-white/80">
          <span className="flex items-center gap-1.5">
            <Star className="h-4 w-4 text-yellow-400" />
            {formatCount(detail.stargazers_count)} stars
          </span>
          <span className="flex items-center gap-1.5">
            <GitFork className="h-4 w-4" />
            {formatCount(detail.forks_count)} forks
          </span>
          <span className="flex items-center gap-1.5">
            <CircleDot className="h-4 w-4" />
            {formatCount(detail.open_issues_count)} open issues
          </span>
          {detail.license && <span>{detail.license.name}</span>}
        </div>

        {detail.topics.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {detail.topics.map((topic) => (
              <span
                key={topic}
                className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80"
              >
                {topic}
              </span>
            ))}
          </div>
        )}

        {totalBytes > 0 && (
          <div className="mt-6">
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-white/10">
              {Object.entries(detail.languages).map(([lang, bytes]) => (
                <div
                  key={lang}
                  style={{
                    width: `${(bytes / totalBytes) * 100}%`,
                    backgroundColor: LANGUAGE_COLORS[lang] ?? "#8b949e",
                  }}
                  title={lang}
                />
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/60">
              {Object.entries(detail.languages)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6)
                .map(([lang, bytes]) => (
                  <span key={lang} className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: LANGUAGE_COLORS[lang] ?? "#8b949e" }}
                    />
                    {lang} {((bytes / totalBytes) * 100).toFixed(1)}%
                  </span>
                ))}
            </div>
          </div>
        )}

        {detail.files.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold text-white">
              <Code2 className="h-5 w-5" />
              Code Preview
            </h2>
            <div className="flex flex-col gap-4">
              {detail.files.map((file) => (
                <div
                  key={file.path}
                  className="overflow-hidden rounded-md border border-white/10 bg-neutral-900"
                >
                  <div className="border-b border-white/10 bg-black/40 px-4 py-2 font-mono text-xs text-white/60">
                    {file.path}
                  </div>
                  <div
                    className="overflow-x-auto p-4 text-xs leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: file.html }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {detail.readme && (
          <div className="mt-10">
            <h2 className="mb-3 text-xl font-semibold text-white">README</h2>
            <article className="prose prose-invert max-w-none rounded-md border border-white/10 bg-neutral-900 p-6 prose-pre:bg-black/60 prose-a:text-accent">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {detail.readme}
              </ReactMarkdown>
            </article>
          </div>
        )}

        <div className="mt-10">
          <Link href="/" className="text-sm text-white/50 hover:text-white">
            &larr; Back to browsing
          </Link>
        </div>
      </main>
    </>
  );
}
