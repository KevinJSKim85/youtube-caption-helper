import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";

const execFileAsync = promisify(execFile);

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { videoId, segments } = body as {
    videoId: string;
    segments: Array<{ text: string; start: number; duration: number }>;
  };

  if (!videoId || !segments?.length) {
    return NextResponse.json(
      { error: "videoId and segments are required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "GEMINI_API_KEY is not configured. Add it to .env.local to enable enhanced captions.",
      },
      { status: 500 }
    );
  }

  try {
    const scriptPath = path.join(
      process.cwd(),
      "scripts",
      "enhance_captions.py"
    );
    const captionsArg = JSON.stringify(segments);

    const { stdout } = await execFileAsync(
      "python3",
      [scriptPath, videoId, captionsArg],
      {
        timeout: 120000,
        env: { ...process.env, GEMINI_API_KEY: apiKey },
        maxBuffer: 10 * 1024 * 1024,
      }
    );

    const result = JSON.parse(stdout);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ segments: result.segments });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to enhance captions";
    console.error("[enhance API]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
