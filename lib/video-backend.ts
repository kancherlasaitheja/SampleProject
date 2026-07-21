import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import ffmpegBinary from "ffmpeg-static";

const require = createRequire(import.meta.url);
const ffprobeBinary = require("ffprobe-static") as { path?: string };

const JOB_ROOT = path.join(tmpdir(), "clipforge-studio");
const MAX_UPLOAD_BYTES = 250 * 1024 * 1024;
const TRANSCRIBE_MODEL =
  process.env.OPENAI_TRANSCRIBE_MODEL ?? "gpt-4o-mini-transcribe";
const FFPROBE_PLATFORM = process.platform === "win32" ? "win32" : process.platform;
const FFPROBE_BINARY = process.platform === "win32" ? "ffprobe.exe" : "ffprobe";
const FFMPEG_BINARY = process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg";

export type TemplateId = "creator" | "tutorial" | "launch";

export type ClipSuggestion = {
  id: string;
  title: string;
  duration: string;
  range: string;
  score: number;
  platform: string;
  caption: string;
  reason: string;
  topic: string;
  startSeconds: number;
  endSeconds: number;
};

export type TranscriptRow = [string, string];

export type AnalysisResult = {
  jobId: string;
  metadata: {
    fileName: string;
    mimeType: string;
    durationSeconds: number;
    durationLabel: string;
    width: number;
    height: number;
    sizeBytes: number;
    transcriptionStatus: string;
    processingMode: string;
  };
  clips: ClipSuggestion[];
  transcriptRows: TranscriptRow[];
  thumbnailDataUrl: string | null;
};

type SilenceRange = {
  start: number;
  end: number;
};

type SpeechSegment = {
  start: number;
  end: number;
};

type JobManifest = AnalysisResult & {
  sourcePath: string;
};

type CommandResult = {
  stdout: string;
  stderr: string;
};

function assertFfmpeg() {
  if (!resolveFfmpegPath()) {
    throw new Error("FFmpeg binary is unavailable.");
  }

  if (!resolveFfprobePath()) {
    throw new Error("FFprobe binary is unavailable.");
  }
}

function resolveFfmpegPath() {
  if (ffmpegBinary && !ffmpegBinary.startsWith("/ROOT/")) {
    return ffmpegBinary;
  }

  return path.join(
    process.cwd(),
    "node_modules",
    "ffmpeg-static",
    FFMPEG_BINARY,
  );
}

function resolveFfprobePath() {
  const packagePath = ffprobeBinary.path;
  if (packagePath && !packagePath.startsWith("/ROOT/")) {
    return packagePath;
  }

  return path.join(
    process.cwd(),
    "node_modules",
    "ffprobe-static",
    "bin",
    FFPROBE_PLATFORM,
    process.arch,
    FFPROBE_BINARY,
  );
}

function runCommand(
  command: string,
  args: string[],
  timeoutMs = 90_000,
): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    const timer = windowlessSetTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`${path.basename(command)} timed out.`));
    }, timeoutMs);

    child.stdout.on("data", (chunk) => stdout.push(Buffer.from(chunk)));
    child.stderr.on("data", (chunk) => stderr.push(Buffer.from(chunk)));
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      const result = {
        stdout: Buffer.concat(stdout).toString("utf8"),
        stderr: Buffer.concat(stderr).toString("utf8"),
      };

      if (code === 0) {
        resolve(result);
        return;
      }

      reject(
        new Error(
          `${path.basename(command)} exited with ${code}: ${result.stderr.slice(0, 1200)}`,
        ),
      );
    });
  });
}

function windowlessSetTimeout(callback: () => void, delay: number) {
  return setTimeout(callback, delay);
}

function cleanFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

function extensionFor(file: File) {
  const fromName = path.extname(file.name).toLowerCase();
  if (fromName) return fromName;
  if (file.type.includes("quicktime")) return ".mov";
  if (file.type.includes("webm")) return ".webm";
  return ".mp4";
}

function jobDir(jobId: string) {
  if (!/^[a-f0-9-]{36}$/i.test(jobId)) {
    throw new Error("Invalid job id.");
  }
  return path.join(JOB_ROOT, jobId);
}

function formatTimestamp(seconds: number) {
  const safe = Math.max(0, Math.round(seconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function clipDuration(start: number, end: number) {
  return formatTimestamp(Math.max(1, end - start)).replace(/^00:/, "0:");
}

async function saveUpload(file: File, dir: string) {
  if (!file.type.startsWith("video/")) {
    throw new Error("Upload a video file.");
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Video is too large for this serverless demo. Use a file under 250 MB.");
  }

  const sourceName = `source${extensionFor(file)}`;
  const sourcePath = path.join(dir, sourceName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(sourcePath, buffer);
  return sourcePath;
}

async function probeVideo(sourcePath: string) {
  assertFfmpeg();
  const result = await runCommand(resolveFfprobePath(), [
    "-v",
    "error",
    "-print_format",
    "json",
    "-show_format",
    "-show_streams",
    sourcePath,
  ]);

  const probe = JSON.parse(result.stdout) as {
    format?: { duration?: string };
    streams?: Array<{
      codec_type?: string;
      width?: number;
      height?: number;
      duration?: string;
    }>;
  };
  const videoStream = probe.streams?.find((stream) => stream.codec_type === "video");
  const durationSeconds = Number(
    probe.format?.duration ?? videoStream?.duration ?? 0,
  );

  return {
    durationSeconds: Number.isFinite(durationSeconds) ? durationSeconds : 0,
    width: videoStream?.width ?? 0,
    height: videoStream?.height ?? 0,
  };
}

async function extractThumbnail(sourcePath: string, dir: string, duration: number) {
  assertFfmpeg();
  const thumbPath = path.join(dir, "thumbnail.jpg");
  const seek = Math.min(Math.max(duration * 0.1, 1), 12);

  await runCommand(resolveFfmpegPath(), [
    "-y",
    "-ss",
    String(seek),
    "-i",
    sourcePath,
    "-frames:v",
    "1",
    "-vf",
    "scale=1280:-1",
    thumbPath,
  ]);

  const image = await readFile(thumbPath);
  return `data:image/jpeg;base64,${image.toString("base64")}`;
}

async function detectSilences(sourcePath: string) {
  assertFfmpeg();
  try {
    const result = await runCommand(
      resolveFfmpegPath(),
      [
        "-hide_banner",
        "-i",
        sourcePath,
        "-af",
        "silencedetect=noise=-35dB:d=0.55",
        "-f",
        "null",
        "-",
      ],
      120_000,
    );

    const silenceStarts = [...result.stderr.matchAll(/silence_start: ([\d.]+)/g)].map(
      (match) => Number(match[1]),
    );
    const silenceEnds = [...result.stderr.matchAll(/silence_end: ([\d.]+)/g)].map(
      (match) => Number(match[1]),
    );

    return silenceStarts.map((start, index) => ({
      start,
      end: silenceEnds[index] ?? start,
    }));
  } catch {
    return [];
  }
}

function speechSegmentsFromSilence(silences: SilenceRange[], duration: number) {
  if (duration <= 0) return [];
  const segments: SpeechSegment[] = [];
  let cursor = 0;

  for (const silence of silences) {
    if (silence.start - cursor >= 6) {
      segments.push({ start: cursor, end: silence.start });
    }
    cursor = Math.max(cursor, silence.end);
  }

  if (duration - cursor >= 6) {
    segments.push({ start: cursor, end: duration });
  }

  if (segments.length > 0) {
    return segments;
  }

  const clipLength = Math.min(42, Math.max(12, duration / 3));
  return [0.08, 0.42, 0.7]
    .map((ratio) => {
      const start = Math.min(Math.max(0, duration * ratio), Math.max(0, duration - clipLength));
      return { start, end: Math.min(duration, start + clipLength) };
    })
    .filter((segment, index, all) => {
      const rounded = Math.round(segment.start);
      return all.findIndex((item) => Math.round(item.start) === rounded) === index;
    });
}

async function extractAudio(sourcePath: string, dir: string) {
  assertFfmpeg();
  const audioPath = path.join(dir, "audio.mp3");
  await runCommand(
    resolveFfmpegPath(),
    [
      "-y",
      "-i",
      sourcePath,
      "-vn",
      "-ac",
      "1",
      "-ar",
      "16000",
      "-b:a",
      "64k",
      audioPath,
    ],
    120_000,
  );
  return audioPath;
}

async function transcribeAudio(audioPath: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      text: "",
      status: "OpenAI transcription not configured",
    };
  }

  const audio = await readFile(audioPath);
  const form = new FormData();
  form.set("model", TRANSCRIBE_MODEL);
  form.set(
    "file",
    new Blob([audio], { type: "audio/mpeg" }),
    path.basename(audioPath),
  );
  form.set("response_format", "json");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: form,
  });

  if (!response.ok) {
    const errorText = await response.text();
    return {
      text: "",
      status: `OpenAI transcription failed: ${errorText.slice(0, 180)}`,
    };
  }

  const json = (await response.json()) as { text?: string };
  return {
    text: json.text ?? "",
    status: `Transcribed with ${TRANSCRIBE_MODEL}`,
  };
}

function transcriptRowsFromText(text: string, clips: SpeechSegment[]) {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length === 0) {
    return clips.slice(0, 3).map((clip, index) => [
      formatTimestamp(clip.start),
      [
        "Real video segment detected from audio activity.",
        "Set OPENAI_API_KEY to replace this with transcript text.",
        "Clip timing is based on FFmpeg silence detection.",
      ][index] ?? "Generated from backend video analysis.",
    ]) as TranscriptRow[];
  }

  return sentences.slice(0, 5).map((sentence, index) => [
    formatTimestamp(clips[index % clips.length]?.start ?? index * 10),
    sentence,
  ]) as TranscriptRow[];
}

function sentenceForClip(transcriptText: string, index: number, fallback: string) {
  const sentences = transcriptText
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  return sentences[index] ?? fallback;
}

function templateCopy(template: TemplateId, index: number) {
  const copy = {
    creator: [
      ["Hook from uploaded video", "Strong talking segment with low silence."],
      ["High-energy explanation", "Good short-form length and clean audio activity."],
      ["Repurpose-ready moment", "Detected as a compact speech block."],
    ],
    tutorial: [
      ["Tutorial step from upload", "Clear explainer segment detected."],
      ["Process breakdown", "Useful duration for a step-by-step clip."],
      ["Caption-ready lesson", "Speech block can be packaged as a tip."],
    ],
    launch: [
      ["Problem-solution moment", "Strong product-style segment from the upload."],
      ["Feature explanation", "Clear mid-video demo moment detected."],
      ["CTA-ready segment", "Short closing-style segment candidate."],
    ],
  } satisfies Record<TemplateId, Array<[string, string]>>;
  return copy[template][index] ?? copy[template][0];
}

function suggestClips(
  segments: SpeechSegment[],
  duration: number,
  template: TemplateId,
  transcriptText: string,
) {
  const ranked = segments
    .map((segment) => {
      const length = segment.end - segment.start;
      const ideal = Math.max(0, 35 - Math.abs(35 - length));
      const earlyBoost = segment.start < duration * 0.25 ? 9 : 0;
      return { ...segment, score: Math.round(68 + ideal * 0.45 + earlyBoost) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .sort((a, b) => a.start - b.start);

  return ranked.map((segment, index) => {
    const targetLength = Math.min(48, Math.max(18, segment.end - segment.start));
    const start = Math.max(0, segment.start);
    const end = Math.min(duration, start + targetLength);
    const [title, reason] = templateCopy(template, index);
    const caption = sentenceForClip(
      transcriptText,
      index,
      "Real clip candidate generated from uploaded video audio.",
    );

    return {
      id: `real-${index + 1}`,
      title,
      duration: clipDuration(start, end),
      range: `${formatTimestamp(start)} - ${formatTimestamp(end)}`,
      score: Math.min(98, Math.max(70, segment.score)),
      platform: index === 0 ? "Reels + Shorts" : index === 1 ? "TikTok" : "LinkedIn",
      caption,
      reason,
      topic: template === "tutorial" ? "Step" : template === "launch" ? "Launch" : "Hook",
      startSeconds: Number(start.toFixed(2)),
      endSeconds: Number(end.toFixed(2)),
    } satisfies ClipSuggestion;
  });
}

export async function analyzeVideoUpload(file: File, template: TemplateId) {
  assertFfmpeg();

  const jobId = randomUUID();
  const dir = jobDir(jobId);
  await mkdir(dir, { recursive: true });

  const sourcePath = await saveUpload(file, dir);
  const sourceStats = await stat(sourcePath);
  const metadata = await probeVideo(sourcePath);
  const [thumbnailDataUrl, silences] = await Promise.all([
    extractThumbnail(sourcePath, dir, metadata.durationSeconds).catch(() => null),
    detectSilences(sourcePath),
  ]);

  let transcription = {
    text: "",
    status: "No audio transcription attempted",
  };

  try {
    const audioPath = await extractAudio(sourcePath, dir);
    transcription = await transcribeAudio(audioPath);
  } catch {
    transcription = {
      text: "",
      status: "Audio track unavailable or could not be extracted",
    };
  }

  const segments = speechSegmentsFromSilence(silences, metadata.durationSeconds);
  const clips = suggestClips(segments, metadata.durationSeconds, template, transcription.text);
  const transcriptRows = transcriptRowsFromText(transcription.text, segments);

  const result: AnalysisResult = {
    jobId,
    metadata: {
      fileName: cleanFileName(file.name),
      mimeType: file.type,
      durationSeconds: Number(metadata.durationSeconds.toFixed(2)),
      durationLabel: formatTimestamp(metadata.durationSeconds),
      width: metadata.width,
      height: metadata.height,
      sizeBytes: sourceStats.size,
      transcriptionStatus: transcription.status,
      processingMode: "FFmpeg probe + silence detection",
    },
    clips,
    transcriptRows,
    thumbnailDataUrl,
  };

  const manifest: JobManifest = {
    ...result,
    sourcePath,
  };
  await writeFile(path.join(dir, "manifest.json"), JSON.stringify(manifest, null, 2));
  return result;
}

export async function readJobManifest(jobId: string) {
  const manifestPath = path.join(jobDir(jobId), "manifest.json");
  return JSON.parse(await readFile(manifestPath, "utf8")) as JobManifest;
}

function aspectFilter(aspectRatio: string) {
  if (aspectRatio === "1:1") {
    return "scale=1080:1080:force_original_aspect_ratio=increase,crop=1080:1080";
  }

  if (aspectRatio === "16:9") {
    return "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720";
  }

  return "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920";
}

export async function exportClip(jobId: string, clipId: string, aspectRatio: string) {
  assertFfmpeg();
  const manifest = await readJobManifest(jobId);
  const clip = manifest.clips.find((item) => item.id === clipId);
  if (!clip) {
    throw new Error("Clip was not found.");
  }

  const dir = jobDir(jobId);
  const fileName = `${clip.id}-${aspectRatio.replace(":", "x")}.mp4`;
  const outputPath = path.join(dir, fileName);
  const duration = Math.max(1, clip.endSeconds - clip.startSeconds);

  await runCommand(
    resolveFfmpegPath(),
    [
      "-y",
      "-ss",
      String(clip.startSeconds),
      "-i",
      manifest.sourcePath,
      "-t",
      String(duration),
      "-vf",
      aspectFilter(aspectRatio),
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "23",
      "-c:a",
      "aac",
      "-movflags",
      "+faststart",
      outputPath,
    ],
    120_000,
  );

  return {
    fileName,
    downloadUrl: `/api/video/download/${jobId}/${fileName}`,
  };
}

export async function readExportedClip(jobId: string, fileName: string) {
  if (!/^[a-zA-Z0-9._-]+\.mp4$/.test(fileName)) {
    throw new Error("Invalid file name.");
  }

  const filePath = path.join(jobDir(jobId), fileName);
  const file = await readFile(filePath);
  return {
    fileName,
    file,
  };
}
