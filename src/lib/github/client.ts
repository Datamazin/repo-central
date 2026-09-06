import type { GithubRepo, RepoDetail, RepoFilePreview } from "./types";

const API_BASE = "https://api.github.com";

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function ghFetch<T>(
  path: string,
  revalidateSeconds = 3600
): Promise<T | null> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: authHeaders(),
    next: { revalidate: revalidateSeconds },
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    const body = await res.text().catch(() => "");
    throw new Error(`GitHub API ${res.status} for ${path}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

interface SearchResponse {
  items: GithubRepo[];
  total_count: number;
}

export async function searchRepos(
  query: string,
  opts: { sort?: "stars" | "forks" | "updated" | "best-match"; perPage?: number } = {}
): Promise<GithubRepo[]> {
  const { sort = "stars", perPage = 20 } = opts;
  const params = new URLSearchParams({
    q: query,
    per_page: String(perPage),
  });
  if (sort !== "best-match") {
    params.set("sort", sort);
    params.set("order", "desc");
  }
  const data = await ghFetch<SearchResponse>(`/search/repositories?${params}`, 1800);
  return data?.items ?? [];
}

export async function getRepo(owner: string, repo: string): Promise<GithubRepo | null> {
  return ghFetch<GithubRepo>(`/repos/${owner}/${repo}`, 3600);
}

export async function getLanguages(
  owner: string,
  repo: string
): Promise<Record<string, number>> {
  const data = await ghFetch<Record<string, number>>(`/repos/${owner}/${repo}/languages`, 3600);
  return data ?? {};
}

export async function getReadme(owner: string, repo: string): Promise<string | null> {
  const res = await fetch(`${API_BASE}/repos/${owner}/${repo}/readme`, {
    headers: { ...authHeaders(), Accept: "application/vnd.github.raw+json" },
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  return res.text();
}

interface ContentItem {
  name: string;
  path: string;
  type: "file" | "dir";
  size: number;
}

const EXT_TO_LANG: Record<string, string> = {
  js: "javascript",
  jsx: "jsx",
  ts: "typescript",
  tsx: "tsx",
  py: "python",
  go: "go",
  rs: "rust",
  java: "java",
  rb: "ruby",
  php: "php",
  c: "c",
  cpp: "cpp",
  cs: "csharp",
  swift: "swift",
  kt: "kotlin",
  md: "markdown",
  json: "json",
  sh: "bash",
};

function skipDir(name: string): boolean {
  return [
    "node_modules",
    ".git",
    "dist",
    "build",
    "vendor",
    ".github",
    "test",
    "tests",
    "__tests__",
  ].includes(name.toLowerCase());
}

export async function getCodeSnippets(
  owner: string,
  repo: string,
  branch: string,
  maxFiles = 3
): Promise<RepoFilePreview[]> {
  const items = await ghFetch<ContentItem[]>(`/repos/${owner}/${repo}/contents?ref=${branch}`, 3600);
  if (!items || !Array.isArray(items)) return [];

  const candidateFiles = items.filter(
    (item) =>
      item.type === "file" &&
      item.size > 0 &&
      item.size < 20000 &&
      /\.(js|jsx|ts|tsx|py|go|rs|java|rb|php|c|cpp|cs|swift|kt)$/i.test(item.name)
  );

  const dirs = items.filter((item) => item.type === "dir" && !skipDir(item.name));
  let pool = candidateFiles;
  if (pool.length < maxFiles && dirs.length > 0) {
    const nested = await ghFetch<ContentItem[]>(
      `/repos/${owner}/${repo}/contents/${dirs[0].path}?ref=${branch}`,
      3600
    );
    if (nested && Array.isArray(nested)) {
      pool = pool.concat(
        nested.filter(
          (item) =>
            item.type === "file" &&
            item.size > 0 &&
            item.size < 20000 &&
            /\.(js|jsx|ts|tsx|py|go|rs|java|rb|php|c|cpp|cs|swift|kt)$/i.test(item.name)
        )
      );
    }
  }

  const chosen = pool.slice(0, maxFiles);
  const files = await Promise.all(
    chosen.map(async (item) => {
      const res = await fetch(
        `${API_BASE}/repos/${owner}/${repo}/contents/${item.path}?ref=${branch}`,
        { headers: { ...authHeaders(), Accept: "application/vnd.github.raw+json" }, next: { revalidate: 3600 } }
      );
      if (!res.ok) return null;
      const content = (await res.text()).slice(0, 2000);
      const ext = item.name.split(".").pop()?.toLowerCase() ?? "";
      const language = EXT_TO_LANG[ext] ?? "text";
      const html = await highlight(content, language);
      return {
        path: item.path,
        content,
        language,
        html,
      } satisfies RepoFilePreview;
    })
  );
  return files.filter((f): f is RepoFilePreview => f !== null);
}

async function highlight(code: string, lang: string): Promise<string> {
  try {
    const { codeToHtml } = await import("shiki");
    return await codeToHtml(code, { lang, theme: "github-dark" });
  } catch {
    const escaped = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return `<pre><code>${escaped}</code></pre>`;
  }
}

export async function getRepoDetail(owner: string, repo: string): Promise<RepoDetail | null> {
  const base = await getRepo(owner, repo);
  if (!base) return null;
  const [readme, languages, files] = await Promise.all([
    getReadme(owner, repo),
    getLanguages(owner, repo),
    getCodeSnippets(owner, repo, base.default_branch),
  ]);
  return { ...base, readme, languages, files };
}
