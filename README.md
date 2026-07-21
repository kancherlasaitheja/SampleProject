# ClipForge Studio

ClipForge Studio is an original Ssemble-style app for turning a long source
video into short-form clips. It includes local video upload, server-side
FFmpeg/FFprobe analysis, speech/silence based clip suggestions, optional OpenAI
transcription, smart crop preview, caption styles, timeline markers, transcript
context, and MP4 clip export.

## What is included

- Next.js single-page app in `app/page.tsx`
- Local generated media asset in `public/source-podcast-thumb.png`
- Real upload analysis API in `app/api/video/analyze/route.ts`
- Real MP4 export and download APIs in `app/api/video/export/route.ts` and
  `app/api/video/download/[jobId]/[fileName]/route.ts`
- FFmpeg/FFprobe processing module in `lib/video-backend.ts`
- Responsive editor layout for desktop and smaller screens

## Backend flow

1. Upload a local MP4, MOV, or WebM file.
2. The backend stores the file temporarily in `/tmp/clipforge-studio`.
3. FFprobe extracts real duration, resolution, and stream metadata.
4. FFmpeg extracts a thumbnail and runs silence detection.
5. If `OPENAI_API_KEY` exists, the backend extracts audio and transcribes it
   with `gpt-4o-mini-transcribe` by default.
6. The app creates clip suggestions from real speech segments.
7. Export re-sends the source file with the selected clip timing and returns a
   real MP4 response. This avoids relying on cross-request `/tmp` state in
   Vercel serverless functions.

## Environment

OpenAI transcription is optional. Without this key the app still does real
FFmpeg analysis, but captions use backend fallback text.

```bash
OPENAI_API_KEY=...
OPENAI_TRANSCRIBE_MODEL=gpt-4o-mini-transcribe
```

## Local development

```bash
npm run dev
```

The local dev server uses:

```text
http://localhost:3000/
```

## Validation

```bash
npm run lint
npm run build
```

## Vercel

This repo is ready for the connected Vercel project. Use:

- Framework preset: Next.js
- Root directory: `./`
- Production branch: `master`
- Build command: `npm run build`

For production-scale videos, replace repeated browser uploads with durable
object storage such as Vercel Blob, S3, or R2, and move long renders to a queue
worker.
