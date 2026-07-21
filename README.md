# ClipForge Studio

ClipForge Studio is an original Ssemble-style prototype for turning a long
source video into short-form clips. It includes simulated source import,
template-based clip suggestions, smart crop preview, caption styles, timeline
markers, transcript context, and a publish queue.

## What is included

- Next.js single-page app in `app/page.tsx`
- Local generated media asset in `public/source-podcast-thumb.png`
- Simulated AI clipping workflow with template, clip, caption, and export state
- Responsive editor layout for desktop and smaller screens

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
