import { NextResponse } from "next/server";
import {
  exportClip,
  exportUploadedClip,
  type ClipSuggestion,
} from "@/lib/video-backend";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      const clipText = String(form.get("clip") ?? "");
      const aspectRatio = String(form.get("aspectRatio") ?? "9:16");

      if (!(file instanceof File)) {
        return NextResponse.json(
          { error: "A source video file is required for export." },
          { status: 400 },
        );
      }

      const clip = JSON.parse(clipText) as ClipSuggestion;
      const rendered = await exportUploadedClip(file, clip, aspectRatio);

      return new Response(new Uint8Array(rendered.file), {
        headers: {
          "Content-Disposition": `attachment; filename="${rendered.fileName}"`,
          "Content-Type": "video/mp4",
          "Cache-Control": "no-store",
          "X-ClipForge-Filename": rendered.fileName,
        },
      });
    }

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
