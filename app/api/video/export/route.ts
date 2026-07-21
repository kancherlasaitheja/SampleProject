import { NextResponse } from "next/server";
import { exportClip } from "@/lib/video-backend";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      jobId?: string;
      clipId?: string;
      aspectRatio?: string;
    };

    if (!body.jobId || !body.clipId) {
      return NextResponse.json(
        { error: "jobId and clipId are required." },
        { status: 400 },
      );
    }

    const result = await exportClip(
      body.jobId,
      body.clipId,
      body.aspectRatio ?? "9:16",
    );
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Clip export failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
