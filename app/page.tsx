"use client";

import { useMemo, useState } from "react";

type Clip = {
  id: string;
  title: string;
  duration: string;
  range: string;
  score: number;
  platform: string;
  caption: string;
  reason: string;
  topic: string;
};

type TemplateId = "creator" | "tutorial" | "launch";

const templates: Array<{
  id: TemplateId;
  name: string;
  description: string;
}> = [
  {
    id: "creator",
    name: "Creator highlights",
    description: "Find hooks, punchlines, and reaction moments.",
  },
  {
    id: "tutorial",
    name: "Tutorial clips",
    description: "Extract steps, explainers, and before-after beats.",
  },
  {
    id: "launch",
    name: "Product launch",
    description: "Package benefits, demos, and call-to-action clips.",
  },
];

const clipCollections: Record<TemplateId, Clip[]> = {
  creator: [
    {
      id: "creator-1",
      title: "Hook: the first 3 seconds",
      duration: "0:31",
      range: "01:12 - 01:43",
      score: 94,
      platform: "Reels + Shorts",
      caption: "Most creators lose viewers before the demo starts.",
      reason: "Strong opener, clear face, high waveform change.",
      topic: "Hook",
    },
    {
      id: "creator-2",
      title: "Mistake founders repeat",
      duration: "0:42",
      range: "03:08 - 03:50",
      score: 88,
      platform: "TikTok",
      caption: "Here is the simple edit that makes tutorials watchable.",
      reason: "Useful takeaway with one clean punchline.",
      topic: "Mistake",
    },
    {
      id: "creator-3",
      title: "Tool stack reveal",
      duration: "0:27",
      range: "05:21 - 05:48",
      score: 82,
      platform: "LinkedIn",
      caption: "This workflow turns a 25 minute recording into six posts.",
      reason: "Screen motion, labeled process, publish-ready pacing.",
      topic: "Workflow",
    },
  ],
  tutorial: [
    {
      id: "tutorial-1",
      title: "Step one: isolate the promise",
      duration: "0:35",
      range: "00:46 - 01:21",
      score: 91,
      platform: "YouTube Shorts",
      caption: "Start with the promise before showing the tool.",
      reason: "Clear tutorial step with strong retention potential.",
      topic: "Step 1",
    },
    {
      id: "tutorial-2",
      title: "Before-after edit pass",
      duration: "0:39",
      range: "04:12 - 04:51",
      score: 86,
      platform: "Reels",
      caption: "The before clip is slow. The after clip has a visible reason to stay.",
      reason: "Comparison structure is easy to caption and replay.",
      topic: "Before-after",
    },
    {
      id: "tutorial-3",
      title: "Caption cleanup lesson",
      duration: "0:29",
      range: "07:02 - 07:31",
      score: 80,
      platform: "TikTok",
      caption: "Readable captions beat clever captions every time.",
      reason: "Single practical tip with low editing complexity.",
      topic: "Captions",
    },
  ],
  launch: [
    {
      id: "launch-1",
      title: "Problem to product",
      duration: "0:33",
      range: "02:10 - 02:43",
      score: 90,
      platform: "LinkedIn",
      caption: "The product exists because editing short clips should not take all day.",
      reason: "Clean pain-point setup with demo context.",
      topic: "Problem",
    },
    {
      id: "launch-2",
      title: "Feature stack in one pass",
      duration: "0:44",
      range: "06:18 - 07:02",
      score: 84,
      platform: "Shorts + Reels",
      caption: "Upload, detect highlights, style captions, export.",
      reason: "Great for explaining the product loop quickly.",
      topic: "Demo",
    },
    {
      id: "launch-3",
      title: "Launch CTA",
      duration: "0:24",
      range: "10:12 - 10:36",
      score: 78,
      platform: "TikTok",
      caption: "Turn one recording into a full week of posts.",
      reason: "Direct call to action with strong closing energy.",
      topic: "CTA",
    },
  ],
};

const transcriptRows = [
  ["01:12", "Most creators lose viewers before the demo starts."],
  ["01:19", "The fix is to make the promise visible immediately."],
  ["01:31", "Then the edit can slow down once the viewer trusts you."],
];

const workflowSteps = ["Import", "Detect", "Caption", "Package"];
const aspectRatios = ["9:16", "1:1", "16:9"];
const captionStyles = ["Bold", "Clean", "Karaoke"];

export default function Home() {
  const [activeTemplate, setActiveTemplate] = useState<TemplateId>("creator");
  const [selectedClip, setSelectedClip] = useState("creator-1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [sourceUrl, setSourceUrl] = useState("https://youtube.com/watch?v=creator-demo");
  const [sourceName, setSourceName] = useState("Creator podcast episode.mov");
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [captionStyle, setCaptionStyle] = useState("Bold");
  const [publishQueue, setPublishQueue] = useState<Array<string>>([
    "Hook: the first 3 seconds - draft ready",
  ]);

  const clips = clipCollections[activeTemplate];
  const activeClip = useMemo(
    () => clips.find((clip) => clip.id === selectedClip) ?? clips[0],
    [clips, selectedClip],
  );

  const captionClass =
    captionStyle === "Karaoke"
      ? "bg-[#f7d658] text-[#172026]"
      : captionStyle === "Clean"
        ? "bg-white/92 text-[#172026]"
        : "bg-black/72 text-white";

  function selectTemplate(template: TemplateId) {
    setActiveTemplate(template);
    setSelectedClip(clipCollections[template][0].id);
  }

  function runGeneration() {
    setIsGenerating(true);
    window.setTimeout(() => {
      setIsGenerating(false);
      setSelectedClip(clipCollections[activeTemplate][0].id);
    }, 900);
  }

  function queueExport() {
    const entry = `${activeClip.title} - ${aspectRatio} ${activeClip.platform}`;
    setPublishQueue((items) => [entry, ...items.filter((item) => item !== entry)]);
  }

  return (
    <main className="min-h-screen bg-[#f6f3ee] text-[#1d2329]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-4 py-4 sm:px-5 lg:px-6">
        <header className="flex flex-col gap-3 border-b border-[#d9d0c4] pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-[#60756f]">
              AI shorts studio
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-[#172026] sm:text-3xl">
              ClipForge Studio
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="h-10 rounded-md border border-[#c8bfb3] bg-white px-4 text-sm font-semibold text-[#233039] shadow-sm transition hover:border-[#22806b]">
              Save draft
            </button>
            <button
              onClick={queueExport}
              className="h-10 rounded-md bg-[#f05a3b] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#d94a2d]"
            >
              Export clip
            </button>
          </div>
        </header>

        <section className="grid flex-1 gap-4 py-4 xl:grid-cols-[292px_minmax(0,1fr)_342px]">
          <aside className="flex flex-col gap-4">
            <div className="rounded-lg border border-[#d9d0c4] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold">Source</h2>
                <span className="rounded-md bg-[#dbeee7] px-2 py-1 text-xs font-semibold text-[#17604b]">
                  Ready
                </span>
              </div>
              <label className="mt-4 block text-xs font-semibold text-[#60756f]">
                Video URL
              </label>
              <input
                value={sourceUrl}
                onChange={(event) => setSourceUrl(event.target.value)}
                className="mt-2 h-10 w-full rounded-md border border-[#c8bfb3] bg-[#fbfaf8] px-3 text-sm outline-none focus:border-[#22806b]"
              />
              <label className="mt-4 flex min-h-28 cursor-pointer flex-col justify-center rounded-lg border border-dashed border-[#b8aca0] bg-[#fbfaf8] p-4">
                <input
                  type="file"
                  accept="video/*"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) setSourceName(file.name);
                  }}
                />
                <span className="text-sm font-semibold">{sourceName}</span>
                <span className="mt-2 text-xs leading-5 text-[#68737a]">
                  Drop MP4, MOV, or choose a local file. This prototype
                  simulates analysis without uploading the file.
                </span>
              </label>
            </div>

            <div className="rounded-lg border border-[#d9d0c4] bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold">AI template</h2>
              <div className="mt-3 grid gap-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => selectTemplate(template.id)}
                    aria-pressed={activeTemplate === template.id}
                    className={`rounded-md border px-3 py-2 text-left ${
                      activeTemplate === template.id
                        ? "border-[#22806b] bg-[#eaf5f0] text-[#114b3c]"
                        : "border-[#ded6cb] bg-[#fbfaf8] text-[#465059]"
                    }`}
                  >
                    <span className="block text-sm font-semibold">{template.name}</span>
                    <span className="mt-1 block text-xs leading-5">
                      {template.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[#d9d0c4] bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold">Output shape</h2>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {aspectRatios.map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`h-10 rounded-md border text-sm font-semibold ${
                      aspectRatio === ratio
                        ? "border-[#172026] bg-[#172026] text-white"
                        : "border-[#ded6cb] bg-[#fbfaf8] text-[#465059]"
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="flex min-w-0 flex-col gap-4">
            <div className="rounded-lg border border-[#d9d0c4] bg-[#172026] p-3 shadow-sm">
              <div className="relative overflow-hidden rounded-md bg-black">
                <div
                  role="img"
                  aria-label="Creator video source preview"
                  className="aspect-video w-full bg-cover bg-center"
                  style={{ backgroundImage: "url('/source-podcast-thumb.png')" }}
                />
                <div className="absolute inset-y-6 left-1/2 w-[38%] -translate-x-1/2 rounded-md border-2 border-white/65 shadow-[0_0_0_999px_rgba(0,0,0,0.20)]" />
                <div className="absolute inset-x-0 bottom-0 px-4 py-5 text-center">
                  <p
                    className={`mx-auto max-w-xl rounded-md px-3 py-2 text-balance text-lg font-bold leading-tight sm:px-4 sm:text-2xl ${captionClass}`}
                  >
                    {activeClip.caption}
                  </p>
                </div>
                <div className="absolute left-3 top-3 rounded-md bg-white/92 px-3 py-2 text-xs font-semibold text-[#172026]">
                  {aspectRatio} smart crop active
                </div>
                <div className="absolute right-3 top-3 rounded-md bg-[#f7d658] px-3 py-2 text-xs font-semibold text-[#172026]">
                  Score {activeClip.score}
                </div>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <h2 className="text-base font-semibold text-white">
                    {activeClip.title}
                  </h2>
                  <p className="mt-1 text-sm text-[#b7c6c2]">
                    {activeClip.range} | {activeClip.duration} | {activeClip.platform}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="h-10 rounded-md border border-white/20 px-4 text-sm font-semibold text-white transition hover:border-white/55">
                    Play
                  </button>
                  <button className="h-10 rounded-md bg-[#24a17f] px-4 text-sm font-semibold text-white transition hover:bg-[#1c8b6c]">
                    Auto-caption
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[#d9d0c4] bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold">AI analysis pipeline</h2>
                  <p className="mt-1 text-xs text-[#68737a]">
                    Markers highlight hooks, pauses, topic changes, and caption beats.
                  </p>
                </div>
                <button
                  onClick={runGeneration}
                  disabled={isGenerating}
                  className="h-10 rounded-md bg-[#172026] px-4 text-sm font-semibold text-white transition hover:bg-[#26333b] disabled:cursor-wait disabled:bg-[#526068]"
                >
                  {isGenerating ? "Analyzing..." : "Generate clips"}
                </button>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-4">
                {workflowSteps.map((step, index) => (
                  <div
                    key={step}
                    className={`rounded-md border px-3 py-2 ${
                      isGenerating && index > 1
                        ? "border-[#ded6cb] bg-[#fbfaf8]"
                        : "border-[#c7ddd5] bg-[#eff8f4]"
                    }`}
                  >
                    <p className="text-xs font-semibold text-[#60756f]">Step {index + 1}</p>
                    <p className="mt-1 text-sm font-semibold">{step}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 h-28 rounded-md bg-[#f2efe9] p-3">
                <div className="flex h-full items-end gap-1">
                  {Array.from({ length: 56 }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (index < 18) setSelectedClip(clips[0].id);
                        else if (index < 36) setSelectedClip(clips[1].id);
                        else setSelectedClip(clips[2].id);
                      }}
                      className={`flex-1 rounded-sm ${
                        index > 9 && index < 18
                          ? "bg-[#f05a3b]"
                          : index > 31 && index < 39
                            ? "bg-[#f7d658]"
                            : "bg-[#8bb9ad]"
                      }`}
                      style={{ height: `${22 + ((index * 17) % 58)}%` }}
                      aria-label={`Timeline marker ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-lg border border-[#d9d0c4] bg-white p-4 shadow-sm">
                <h2 className="text-sm font-semibold">Caption designer</h2>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {captionStyles.map((style) => (
                    <button
                      key={style}
                      onClick={() => setCaptionStyle(style)}
                      className={`h-10 rounded-md border text-sm font-semibold ${
                        captionStyle === style
                          ? "border-[#f05a3b] bg-[#fff2ec] text-[#8e2f1c]"
                          : "border-[#ded6cb] bg-[#fbfaf8] text-[#465059]"
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
                <div className="mt-4 rounded-md bg-[#f2efe9] p-3">
                  <p className="text-xs font-semibold uppercase text-[#60756f]">
                    Active caption
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-6">
                    {activeClip.caption}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-[#d9d0c4] bg-white p-4 shadow-sm">
                <h2 className="text-sm font-semibold">Publish queue</h2>
                <div className="mt-3 grid gap-2">
                  {publishQueue.map((item) => (
                    <div
                      key={item}
                      className="rounded-md border border-[#ded6cb] bg-[#fbfaf8] px-3 py-2"
                    >
                      <p className="text-sm font-semibold">{item}</p>
                      <p className="mt-1 text-xs text-[#68737a]">
                        Captions, crop, and metadata are ready for review.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <aside className="flex flex-col gap-4">
            <div className="rounded-lg border border-[#d9d0c4] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Suggested shorts</h2>
                <span className="text-xs font-semibold text-[#60756f]">
                  {clips.length} found
                </span>
              </div>
              <div className="mt-3 grid gap-3">
                {clips.map((clip) => (
                  <button
                    key={clip.id}
                    onClick={() => setSelectedClip(clip.id)}
                    className={`rounded-lg border p-3 text-left transition ${
                      clip.id === selectedClip
                        ? "border-[#f05a3b] bg-[#fff2ec]"
                        : "border-[#ded6cb] bg-[#fbfaf8] hover:border-[#22806b]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{clip.title}</p>
                        <p className="mt-1 text-xs text-[#68737a]">{clip.range}</p>
                      </div>
                      <span className="rounded-md bg-[#172026] px-2 py-1 text-xs font-semibold text-white">
                        {clip.score}
                      </span>
                    </div>
                    <div className="mt-3 h-2 rounded-sm bg-[#e7e1d8]">
                      <div
                        className="h-2 rounded-sm bg-[#24a17f]"
                        style={{ width: `${clip.score}%` }}
                      />
                    </div>
                    <p className="mt-3 text-xs leading-5 text-[#526068]">
                      {clip.reason}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[#d9d0c4] bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold">Transcript</h2>
              <div className="mt-3 grid gap-3">
                {transcriptRows.map(([time, text]) => (
                  <div key={time} className="grid grid-cols-[42px_1fr] gap-3 text-sm">
                    <span className="font-mono text-xs text-[#60756f]">{time}</span>
                    <p className="leading-5 text-[#39444c]">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[#d9d0c4] bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold">Clip package</h2>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-md bg-[#f2efe9] p-3">
                  <p className="text-xs font-semibold text-[#60756f]">Topic</p>
                  <p className="mt-1 font-semibold">{activeClip.topic}</p>
                </div>
                <div className="rounded-md bg-[#f2efe9] p-3">
                  <p className="text-xs font-semibold text-[#60756f]">Format</p>
                  <p className="mt-1 font-semibold">{aspectRatio}</p>
                </div>
                <div className="rounded-md bg-[#f2efe9] p-3">
                  <p className="text-xs font-semibold text-[#60756f]">Caption</p>
                  <p className="mt-1 font-semibold">{captionStyle}</p>
                </div>
                <div className="rounded-md bg-[#f2efe9] p-3">
                  <p className="text-xs font-semibold text-[#60756f]">Length</p>
                  <p className="mt-1 font-semibold">{activeClip.duration}</p>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
