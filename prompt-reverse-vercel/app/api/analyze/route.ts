import { NextRequest, NextResponse } from "next/server";
import { ANALYSIS_SYSTEM_PROMPT, buildUserMessage } from "@/lib/prompt-template";
import { emptyResult, type AnalysisResult } from "@/lib/analysis-types";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { frames, mediaType, apiKey, baseUrl, model } = body as {
      frames: string[];
      mediaType: "image" | "video";
      apiKey: string;
      baseUrl: string;
      model: string;
    };

    if (!apiKey || !apiKey.trim()) {
      return NextResponse.json(
        { ok: false, error: { code: "no_api_key", message: "Please enter your API key in Settings." } },
        { status: 400 },
      );
    }

    if (!frames || frames.length === 0) {
      return NextResponse.json(
        { ok: false, error: { code: "no_frames", message: "No frames to analyze." } },
        { status: 400 },
      );
    }

    const apiBase = (baseUrl || "https://api.openai.com/v1").replace(/\/+$/, "");
    const modelName = model || "gpt-4o";

    const messages = [
      { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
      ...buildUserMessage(frames, mediaType),
    ];

    const response = await fetch(`${apiBase}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages,
        max_tokens: 4000,
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      let errMessage = `API returned ${response.status}`;
      try {
        const errJson = JSON.parse(errText);
        errMessage = errJson.error?.message || errMessage;
      } catch {
        if (errText.length < 200) errMessage = errText;
      }
      return NextResponse.json(
        { ok: false, error: { code: "api_error", message: errMessage } },
        { status: response.status },
      );
    }

    const data = await response.json();
    const content: string = data.choices?.[0]?.message?.content ?? "";

    const cleaned = content
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();

    let result: AnalysisResult;
    try {
      result = JSON.parse(cleaned) as AnalysisResult;
    } catch {
      result = emptyResult(content);
    }

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { ok: false, error: { code: "server_error", message } },
      { status: 500 },
    );
  }
}
