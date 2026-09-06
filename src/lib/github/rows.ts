export interface RowDef {
  id: string;
  title: string;
  query: string;
  sort?: "stars" | "forks" | "updated" | "best-match";
}

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export const HOME_ROWS: RowDef[] = [
  {
    id: "trending-week",
    title: "Trending This Week",
    query: `created:>${daysAgoISO(14)} stars:>50`,
    sort: "stars",
  },
  {
    id: "all-time-hits",
    title: "All-Time Blockbusters",
    query: "stars:>50000",
    sort: "stars",
  },
  {
    id: "new-releases",
    title: "New Releases",
    query: `created:>${daysAgoISO(30)} stars:>20`,
    sort: "updated",
  },
  {
    id: "lang-typescript",
    title: "TypeScript Originals",
    query: "language:TypeScript stars:>5000",
    sort: "stars",
  },
  {
    id: "lang-python",
    title: "Python Picks",
    query: "language:Python stars:>5000",
    sort: "stars",
  },
  {
    id: "lang-rust",
    title: "Rust Rising",
    query: "language:Rust stars:>2000",
    sort: "stars",
  },
  {
    id: "lang-go",
    title: "Go-To Projects",
    query: "language:Go stars:>3000",
    sort: "stars",
  },
  {
    id: "topic-ai",
    title: "Machine Learning & AI",
    query: "topic:machine-learning stars:>2000",
    sort: "stars",
  },
  {
    id: "topic-webdev",
    title: "Web Frameworks",
    query: "topic:web-framework stars:>1000",
    sort: "stars",
  },
  {
    id: "topic-cli",
    title: "Command Line Tools",
    query: "topic:cli stars:>1000",
    sort: "stars",
  },
  {
    id: "topic-game",
    title: "Game Dev",
    query: "topic:game-development stars:>500",
    sort: "stars",
  },
];
