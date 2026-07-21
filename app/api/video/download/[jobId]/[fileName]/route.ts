import { readExportedClip } from "@/lib/video-backend";

export const runtime = "nodejs";
export const maxDuration = 30;

type RouteContext = {
  params: Promise<{
    jobId: string;
    fileName: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { jobId, fileName } = await context.params;
    const clip = await readExportedClip(jobId, fileName);

    return new Response(new Uint8Array(clip.file), {
      headers: {
        "Content-Disposition": `attachment; filename="${clip.fileName}"`,
        "Content-Type": "video/mp4",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("Clip not found.", { status: 404 });
  }
}
