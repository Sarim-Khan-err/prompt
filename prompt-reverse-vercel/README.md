# Prompt Reverse — Video-to-Prompt AI

Upload any video or image and get a complete, production-ready prompt with camera directions, visual style, characters, scenes, and full shot sequence — reverse-engineered by AI.

## Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New → Project**
3. Import this repository (push to GitHub first, or use the Vercel CLI: `npx vercel`)
4. No environment variables needed — users enter their own API key in the app
5. Click **Deploy**

That's it. The app is self-contained.

## How it works

1. **User enters their API key** in Settings (stored only in the browser's localStorage)
2. **Upload** an image or video — for videos, key frames are extracted automatically in the browser
3. **AI analyzes** the frames using a vision-capable LLM (GPT-4o, Claude, etc.)
4. **Get a structured prompt** — camera, visual direction, characters, scenes, aesthetics, shot sequence, transitions, and a ready-to-paste full prompt

## Supported providers

Any OpenAI-compatible API that supports vision/image input:

| Provider | Base URL | Model |
|----------|----------|-------|
| OpenAI | `https://api.openai.com/v1` | `gpt-4o` |
| OpenRouter | `https://openrouter.ai/api/v1` | `openai/gpt-4o` |
| Groq | `https://api.groq.com/openai/v1` | `llama-3.2-90b-vision-preview` |
| Together AI | `https://api.together.xyz/v1` | `meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo` |
| Custom | Any OpenAI-compatible URL | Any vision model |

## Tech stack

- Next.js 16 (App Router, Edge Runtime)
- React 19
- Tailwind CSS v4
- Client-side video frame extraction (canvas API — no ffmpeg needed)
- Edge API route that forwards to the user's chosen LLM provider

## Privacy

- API keys are stored only in the user's browser (localStorage)
- Keys are sent only to the API endpoint the user configures
- No server-side storage — the app is stateless except for the user's browser

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000
