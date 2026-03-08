import { NextRequest, NextResponse } from "next/server";
import { extractVideoId, fetchTranscript } from "@/lib/youtube";

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
    const result = await fetchTranscript(videoId, lang);
    return NextResponse.json({
      videoId,
      title: result.title,
      segments: result.segments,
      availableTracks: result.tracks,
      selectedTrack: result.selectedTrack,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch transcript";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
