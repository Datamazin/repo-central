import { NextResponse } from "next/server";
import { searchRepos } from "@/lib/github/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ repos: [] });
  }
  const repos = await searchRepos(q, { sort: "best-match", perPage: 24 });
  return NextResponse.json({ repos });
}
