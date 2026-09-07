export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  topics: string[];
  homepage: string | null;
  pushed_at: string;
  created_at: string;
  default_branch: string;
  license: { name: string } | null;
}

export interface RepoRow {
  id: string;
  title: string;
  repos: GithubRepo[];
}

export interface RepoFilePreview {
  path: string;
  content: string;
  language: string;
  html: string;
}

export interface RepoDetail extends GithubRepo {
  readme: string | null;
  languages: Record<string, number>;
  files: RepoFilePreview[];
  commitActivity: number[] | null;
}
