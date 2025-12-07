import { NextResponse } from "next/server";

type ChatRole = "system" | "user" | "assistant";

interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface TapanAssociateRequest {
  messages: ChatMessage[];
  module?: string;
  context?: unknown;
  mode?: string;
}

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const TAPAN_ASSOCIATE_MODEL = process.env.TAPAN_ASSOCIATE_MODEL ?? "sonar-pro";
const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

if (!PERPLEXITY_API_KEY) {
  throw new Error("Missing PERPLEXITY_API_KEY env var for Perplexity API");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as TapanAssociateRequest;
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const module = body.module ?? "global";
    const { context, mode } = body;

    if (messages.length === 0) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 }
      );
    }

    let contextText: string | undefined;
    if (context !== undefined) {
      try {
        const json = JSON.stringify(context);
        contextText =
          json.length > 4000 ? json.slice(0, 4000) + " ...[truncated]" : json;
      } catch {
        contextText = undefined;
      }
    }

    const systemParts: string[] = [
      "You are Tapan Associate, an AI copilot embedded inside the Tapan Associate logistics dashboard.",
      "You help with air cargo manifests, alerts, analytics, shipments, customers, invoices, and warehouse operations.",
      "You must be concise, practical, and prefer bullet points. Focus on next actions.",
      "Never invent shipment IDs, customer data, or metrics that are not present in the conversation or provided context.",
      `Current module/section: ${module}.`,
    ];

    if (mode) {
      systemParts.push(`Requested mode: ${mode}.`);
    }

    if (contextText) {
      systemParts.push(
        "Here is structured JSON context from the UI. Use it when answering:",
        contextText
      );
    }

    const systemMessage: ChatMessage = {
      role: "system",
      content: systemParts.join("\n\n"),
    };

    const response = await fetch(PERPLEXITY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: TAPAN_ASSOCIATE_MODEL,
        messages: [systemMessage, ...messages],
      }),
    });

    if (!response.ok) {
      let message = `Perplexity API error: ${response.status}`;
      try {
        const data = (await response.json()) as any;
        const apiMessage =
          (data?.error && (data.error.message || data.error)) || data?.message;
        if (typeof apiMessage === "string" && apiMessage.trim()) {
          message = apiMessage;
        }
      } catch {
        // ignore JSON parse errors and fall back to generic message
      }
      return NextResponse.json({ error: message }, { status: response.status });
    }

    const data = (await response.json()) as any;
    const firstMessage = data.choices?.[0]?.message?.content ?? "";

    return NextResponse.json({
      content: firstMessage,
      usage: data.usage ?? null,
    });
  } catch (error: any) {
    console.error("/api/tapan-associate error", error);
    const message =
      typeof error?.message === "string"
        ? error.message
        : "Unexpected error calling Tapan Associate";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
