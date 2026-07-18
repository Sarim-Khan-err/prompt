"use client";

import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Check,
  ChevronDown,
  Clipboard,
  Copy,
  Eye,
  EyeOff,
  Film,
  Image as ImageIcon,
  Key,
  MapPin,
  Palette,
  Scissors,
  Settings,
  Sparkles,
  Upload,
  Users,
  Video,
  X,
} from "lucide-react";
import { extractVideoFrames, processImage } from "@/lib/media-processor";
import { SAMPLE_RESULT, emptyResult, type AnalysisResult } from "@/lib/analysis-types";

const ACCEPTED_TYPES =
  "image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm";

const STORAGE_KEY = "prompt-reverse-settings";

interface AppSettings {
  apiKey: string;
  baseUrl: string;
  model: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  apiKey: "",
  baseUrl: "https://api.openai.com/v1",
  model: "gpt-4o",
};

type Status = "idle" | "processing" | "analyzing" | "result" | "error";

// ─── Provider presets ────────────────────────────────────────────────────────

const PROVIDERS = [
  { name: "OpenAI", baseUrl: "https://api.openai.com/v1", model: "gpt-4o" },
  { name: "OpenRouter", baseUrl: "https://openrouter.ai/api/v1", model: "openai/gpt-4o" },
  { name: "Groq", baseUrl: "https://api.groq.com/openai/v1", model: "llama-3.2-90b-vision-preview" },
  { name: "Together AI", baseUrl: "https://api.together.xyz/v1", model: "meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo" },
  { name: "Custom", baseUrl: "", model: "" },
];

// ─── Result sections ────────────────────────────────────────────────────────

function SectionBlock({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Camera;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-neutral-500" />
        <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          {title}
        </h4>
      </div>
      <div className="text-sm text-neutral-200">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-neutral-600">{label}</dt>
      <dd className="text-sm text-neutral-200">{value}</dd>
    </div>
  );
}

function PromptResultDisplay({ result }: { result: AnalysisResult }) {
  const [copied, setCopied] = useState(false);
  const [copiedSimple, setCopiedSimple] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.fullPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const hasStructured =
    result.camera.movement ||
    result.visual.colorPalette ||
    result.characters.length > 0;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="flex flex-col gap-5">
          {result.summary ? (
            <p className="text-sm leading-relaxed text-neutral-100">{result.summary}</p>
          ) : null}

          {hasStructured ? (
            <>
              <div className="h-px bg-neutral-800" />

              {result.camera.movement ? (
                <SectionBlock icon={Camera} title="Camera">
                  <dl className="grid grid-cols-1 gap-2">
                    {result.camera.movement ? <Field label="Movement" value={result.camera.movement} /> : null}
                    {result.camera.angle ? <Field label="Angle" value={result.camera.angle} /> : null}
                    {result.camera.framing ? <Field label="Framing" value={result.camera.framing} /> : null}
                    {result.camera.lens ? <Field label="Lens" value={result.camera.lens} /> : null}
                  </dl>
                </SectionBlock>
              ) : null}

              {result.visual.colorPalette ? (
                <SectionBlock icon={Palette} title="Visual Direction">
                  <dl className="grid grid-cols-1 gap-2">
                    {result.visual.colorPalette ? <Field label="Color palette" value={result.visual.colorPalette} /> : null}
                    {result.visual.lighting ? <Field label="Lighting" value={result.visual.lighting} /> : null}
                    {result.visual.mood ? <Field label="Mood" value={result.visual.mood} /> : null}
                    {result.visual.atmosphere ? <Field label="Atmosphere" value={result.visual.atmosphere} /> : null}
                  </dl>
                </SectionBlock>
              ) : null}

              {result.characters.length > 0 ? (
                <SectionBlock icon={Users} title="Characters">
                  <div className="flex flex-col gap-3">
                    {result.characters.map((char, i) => (
                      <div key={i} className="rounded-lg bg-neutral-900/60 p-3">
                        <dl className="grid grid-cols-1 gap-2">
                          {char.description ? <Field label="Description" value={char.description} /> : null}
                          {char.clothing ? <Field label="Clothing" value={char.clothing} /> : null}
                          {char.action ? <Field label="Action" value={char.action} /> : null}
                          {char.expression ? <Field label="Expression" value={char.expression} /> : null}
                        </dl>
                      </div>
                    ))}
                  </div>
                </SectionBlock>
              ) : null}

              {result.scenes.setting ? (
                <SectionBlock icon={MapPin} title="Scenes">
                  <dl className="grid grid-cols-1 gap-2">
                    {result.scenes.setting ? <Field label="Setting" value={result.scenes.setting} /> : null}
                    {result.scenes.environment ? <Field label="Environment" value={result.scenes.environment} /> : null}
                    {result.scenes.props ? <Field label="Props" value={result.scenes.props} /> : null}
                  </dl>
                </SectionBlock>
              ) : null}

              {result.aesthetics.style ? (
                <SectionBlock icon={Sparkles} title="Aesthetics">
                  <dl className="grid grid-cols-1 gap-2">
                    {result.aesthetics.style ? <Field label="Style" value={result.aesthetics.style} /> : null}
                    {result.aesthetics.genre ? <Field label="Genre" value={result.aesthetics.genre} /> : null}
                    {result.aesthetics.references ? <Field label="References" value={result.aesthetics.references} /> : null}
                    {result.aesthetics.tone ? <Field label="Tone" value={result.aesthetics.tone} /> : null}
                  </dl>
                </SectionBlock>
              ) : null}

              {result.sequence.length > 0 ? (
                <SectionBlock icon={Film} title="Shot Sequence">
                  <div className="flex flex-col gap-2">
                    {result.sequence.map((shot, i) => (
                      <div key={i} className="flex gap-3 rounded-lg bg-neutral-900/60 p-2.5">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-xs font-semibold text-neutral-400">
                          {i + 1}
                        </span>
                        <div className="flex flex-col gap-0.5">
                          {shot.shot ? <p className="text-xs font-semibold">{shot.shot}</p> : null}
                          {shot.action ? <p className="text-xs text-neutral-400">{shot.action}</p> : null}
                          {shot.duration ? <p className="text-[11px] text-neutral-600">{shot.duration}</p> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionBlock>
              ) : null}

              {result.transitions.length > 0 ? (
                <SectionBlock icon={Scissors} title="Transitions">
                  <div className="flex flex-col gap-2">
                    {result.transitions.map((tr, i) => (
                      <div key={i} className="rounded-lg bg-neutral-900/60 p-2.5">
                        <p className="text-xs font-semibold text-emerald-400">{tr.type}</p>
                        {tr.description ? <p className="text-xs text-neutral-400">{tr.description}</p> : null}
                      </div>
                    ))}
                  </div>
                </SectionBlock>
              ) : null}

              <div className="h-px bg-neutral-800" />
            </>
          ) : null}

          {/* Template prompt */}
          {result.templatePrompt ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Film className="h-4 w-4 text-emerald-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Effect Template
                </h4>
              </div>
              <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3">
                <p className="text-sm leading-relaxed text-neutral-100">
                  {result.templatePrompt}
                </p>
              </div>
              <p className="text-[11px] text-neutral-600">
                Reusable effect — works with any reference image. Paste this with your own photo.
              </p>
            </div>
          ) : null}

          {/* Simple prompt */}
          {result.simplePrompt ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Simple Prompt
                </h4>
              </div>
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                <p className="text-sm leading-relaxed text-neutral-100">
                  {result.simplePrompt}
                </p>
              </div>
            </div>
          ) : null}

          {/* Full prompt */}
          {result.fullPrompt ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Clipboard className="h-4 w-4 text-neutral-500" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Full Generation Prompt
                </h4>
              </div>
              <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-3">
                <p className="text-sm leading-relaxed">{result.fullPrompt}</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="shrink-0 border-t border-neutral-800 p-3">
        <div className="flex flex-col gap-2">
          {result.templatePrompt ? (
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(result.templatePrompt);
                  setCopiedTemplate(true);
                  setTimeout(() => setCopiedTemplate(false), 2000);
                } catch { /* ignore */ }
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-300 transition-colors hover:bg-emerald-500/20"
            >
              {copiedTemplate ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiedTemplate ? "Copied!" : "Copy effect template"}
            </button>
          ) : null}
          {result.simplePrompt ? (
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(result.simplePrompt);
                  setCopiedSimple(true);
                  setTimeout(() => setCopiedSimple(false), 2000);
                } catch { /* ignore */ }
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm font-medium text-neutral-200 transition-colors hover:bg-neutral-800"
            >
              {copiedSimple ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiedSimple ? "Copied!" : "Copy simple prompt"}
            </button>
          ) : null}
          <button
            onClick={handleCopy}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-emerald-400"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy full prompt"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Settings panel ──────────────────────────────────────────────────────────

function SettingsPanel({
  settings,
  onSave,
  onClose,
}: {
  settings: AppSettings;
  onSave: (s: AppSettings) => void;
  onClose: () => void;
}) {
  const [local, setLocal] = useState(settings);
  const [showKey, setShowKey] = useState(false);

  const handleProviderChange = (name: string) => {
    const provider = PROVIDERS.find((p) => p.name === name);
    if (provider && name !== "Custom") {
      setLocal((prev) => ({ ...prev, baseUrl: provider.baseUrl, model: provider.model }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-[10vh] backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-semibold">API Settings</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Provider
            </label>
            <select
              value={PROVIDERS.find((p) => p.baseUrl === local.baseUrl)?.name ?? "Custom"}
              onChange={(e) => handleProviderChange(e.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-emerald-500"
            >
              {PROVIDERS.map((p) => (
                <option key={p.name} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
              API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={local.apiKey}
                onChange={(e) => setLocal((prev) => ({ ...prev, apiKey: e.target.value }))}
                placeholder="sk-..."
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 pr-10 text-sm text-neutral-100 outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1 text-[11px] text-neutral-600">
              Stored only in your browser. Never sent anywhere except the API endpoint you choose.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Base URL
            </label>
            <input
              type="text"
              value={local.baseUrl}
              onChange={(e) => setLocal((prev) => ({ ...prev, baseUrl: e.target.value }))}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Model
            </label>
            <input
              type="text"
              value={local.model}
              onChange={(e) => setLocal((prev) => ({ ...prev, model: e.target.value }))}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-emerald-500"
            />
            <p className="mt-1 text-[11px] text-neutral-600">
              Must be a vision-capable model (gpt-4o, claude-3.5-sonnet, etc.)
            </p>
          </div>

          <button
            onClick={() => { onSave(local); onClose(); }}
            className="mt-2 w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-emerald-400"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const framesRef = useRef<string[]>([]);

  // Load settings from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        setHasKey(Boolean(parsed.apiKey));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveSettings = (s: AppSettings) => {
    setSettings(s);
    setHasKey(Boolean(s.apiKey));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {
      // ignore
    }
  };

  const handleFileSelect = async (file: File) => {
    setStatus("processing");
    setError(null);
    setResult(null);

    try {
      const isVideo = file.type.startsWith("video/");
      setMediaType(isVideo ? "video" : "image");

      const processed = isVideo
        ? await extractVideoFrames(file)
        : await processImage(file);

      framesRef.current = processed.frames;

      if (processed.frames[0]) {
        setPreviewUrl(processed.frames[0]);
      }

      setStatus("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process media.");
      setStatus("error");
      setPreviewUrl(null);
      framesRef.current = [];
    }
  };

  const handleAnalyze = async () => {
    const frames = framesRef.current;
    if (frames.length === 0) return;

    if (!hasKey || !settings.apiKey) {
      setShowSettings(true);
      return;
    }

    setStatus("analyzing");
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frames,
          mediaType,
          apiKey: settings.apiKey,
          baseUrl: settings.baseUrl,
          model: settings.model,
        }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          response.status === 413
            ? "Payload too large. Try a shorter video or fewer frames."
            : `Server returned an unexpected response (status ${response.status}). The video may be too large — try a shorter clip.`,
        );
      }

      if (!data.ok) {
        throw new Error(data.error?.message ?? "Analysis failed.");
      }

      setResult(data.result as AnalysisResult);
      setStatus("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
      setStatus("error");
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    framesRef.current = [];
    setResult(null);
    setStatus("idle");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const canAnalyze = framesRef.current.length > 0 && status !== "processing" && status !== "analyzing";
  const showSample = status === "idle" && !previewUrl;

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            <span className="text-sm font-semibold tracking-tight">Prompt Reverse</span>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 rounded-lg border border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:border-neutral-600 hover:bg-neutral-900"
          >
            <Key className="h-3.5 w-3.5" />
            {hasKey ? "API Key Set" : "Set API Key"}
            <span className={`h-1.5 w-1.5 rounded-full ${hasKey ? "bg-emerald-400" : "bg-amber-400"}`} />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
          {/* Title */}
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Upload a video or image — get the exact prompt to recreate it
            </h1>
            <p className="text-sm text-neutral-400">
              AI analyzes every frame and writes camera directions, visual style, characters, scenes, and the full shot sequence.
            </p>
          </div>

          {/* Upload + Result grid */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.2fr]">
            {/* Left — upload */}
            <div className="flex flex-col gap-4">
              <div
              className="flex flex-col gap-4 rounded-xl border border-neutral-800 bg-neutral-900 p-4"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_TYPES}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleFileSelect(file);
                    e.target.value = "";
                  }}
                />

                {/* Upload zone */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-neutral-700 bg-neutral-950/50 p-6 text-center transition-colors hover:border-neutral-600 hover:bg-neutral-900/50"
                >
                  {previewUrl ? (
                    <div className="relative w-full">
                      <img
                        src={previewUrl}
                        alt="Selected media"
                        className="mx-auto max-h-[200px] rounded-lg object-contain"
                      />
                      <span className="mt-2 block text-xs text-neutral-500">
                        {mediaType === "video" ? "Video frames extracted" : "Image loaded"} — click to replace
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800">
                        <Upload className="h-5 w-5 text-neutral-400" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-neutral-200">Upload Image or Video</span>
                        <span className="text-xs text-neutral-500">JPG, PNG, WebP, MP4, MOV, WebM</span>
                      </div>
                    </>
                  )}
                </button>

                {/* Media type badge + remove */}
                {previewUrl && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 rounded-full bg-neutral-800 px-2.5 py-1 text-xs font-medium text-neutral-300">
                      {mediaType === "video" ? <Video className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                      {mediaType}
                      {mediaType === "video" ? ` · ${framesRef.current.length} frames` : ""}
                    </span>
                    <button
                      onClick={handleRemove}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-neutral-300"
                    >
                      <X className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                )}

                {/* Status */}
                {status === "processing" && (
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-700 border-t-emerald-400" />
                    {mediaType === "video" ? "Extracting key frames from video…" : "Processing image…"}
                  </div>
                )}

                {error && (
                  <p className="text-sm text-red-400" role="alert">{error}</p>
                )}

                {/* Analyze button */}
                <button
                  disabled={!canAnalyze}
                  onClick={() => void handleAnalyze()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-black transition-all hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {status === "analyzing" ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                      Analyzing…
                    </>
                  ) : status === "processing" ? (
                    "Processing…"
                  ) : !hasKey ? (
                    <>
                      <Key className="h-4 w-4" />
                      Set API Key First
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Analyze
                    </>
                  )}
                </button>

                {!hasKey && (
                  <p className="text-center text-[11px] text-neutral-600">
                    You need a vision-capable LLM API key to analyze media.
                  </p>
                )}
              </div>

              {/* How it works */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                <h3 className="mb-3 text-sm font-semibold">How it works</h3>
                <div className="flex flex-col gap-3">
                  {[
                    { icon: Upload, title: "Upload media", desc: "Image or video — frames are extracted automatically" },
                    { icon: Sparkles, title: "AI analyzes every frame", desc: "Camera, lighting, color, characters, and editing" },
                    { icon: Copy, title: "Get your prompt", desc: "Copy a complete, structured generation prompt" },
                  ].map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-800">
                        <step.icon className="h-3.5 w-3.5 text-emerald-400" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-neutral-200">{step.title}</span>
                        <span className="text-xs text-neutral-500">{step.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — result */}
            <div className="h-[500px] overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 lg:h-auto lg:min-h-[600px]">
              {status === "analyzing" ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-700 border-t-emerald-400" />
                  <p className="text-sm text-neutral-400">
                    Analyzing every frame — identifying camera, lighting, characters, and scene details…
                  </p>
                </div>
              ) : status === "error" && !result ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                  <p className="text-sm text-red-400">{error ?? "Analysis failed."}</p>
                  <button
                    onClick={handleRemove}
                    className="rounded-lg border border-neutral-700 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
                  >
                    Try again
                  </button>
                </div>
              ) : status === "result" && result ? (
                <PromptResultDisplay result={result} />
              ) : showSample ? (
                <PromptResultDisplay result={SAMPLE_RESULT} />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                  <Film className="h-10 w-10 text-neutral-700" />
                  <p className="text-sm text-neutral-500">
                    Upload a video or image and click Analyze to see the reverse-engineered prompt here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showSettings && (
        <SettingsPanel
          settings={settings}
          onSave={saveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
