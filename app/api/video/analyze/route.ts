import { NextResponse } from "next/server";
import { analyzeVideoUpload, type TemplateId } from "@/lib/video-backend";

export const runtime = "nodejs";
export const maxDuration = 60;

const templates = new Set(["creator", "tutorial", "launch"]);

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const templateValue = String(form.get("template") ?? "creator");
    const template = templates.has(templateValue)
      ? (templateValue as TemplateId)
      : "creator";

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Upload a local video file before generating clips." },
        { status: 400 },
      );
    }

    const result = await analyzeVideoUpload(file, template);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Video analysis failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
