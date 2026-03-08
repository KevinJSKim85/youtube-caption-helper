import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import { extractVideoId } from "@/lib/youtube";

const execFileAsync = promisify(execFile);

async function fetchVideoTitle(videoId: string): Promise<string> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const resp = await fetch(oembedUrl);
    if (resp.ok) {
      const data = await resp.json();
      return (data as { title?: string }).title || "Unknown";
    }
  } catch {}
  return "Unknown";
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get("url");
  const lang = searchParams.get("lang") || undefined;

  if (!url) {
    return NextResponse.json(
      { error: "YouTube URL is required" },
      { status: 400 }
    );
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    return NextResponse.json(
      { error: "Invalid YouTube URL. Please enter a valid YouTube video link." },
      { status: 400 }
    );
  }

  try {
    const scriptPath = path.join(process.cwd(), "scripts", "transcript.py");
    const args = [scriptPath, videoId];
    if (lang) args.push(lang);

    const { stdout } = await execFileAsync("python3", args, {
      timeout: 30000,
    });

    const result = JSON.parse(stdout);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    const title = await fetchVideoTitle(videoId);

    return NextResponse.json({
      videoId,
      title,
      segments: result.segments,
      availableTracks: result.availableTracks,
      selectedTrack: result.selectedTrack,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch transcript";
    console.error("[transcript API]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
