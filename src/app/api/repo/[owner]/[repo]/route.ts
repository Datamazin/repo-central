import { NextResponse } from "next/server";
import { getRepoDetail } from "@/lib/github/client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  const { owner, repo } = await params;
  const detail = await getRepoDetail(owner, repo);
  if (!detail) {
    return NextResponse.json({ error: "Repository not found" }, { status: 404 });
  }
  return NextResponse.json(detail);
}
