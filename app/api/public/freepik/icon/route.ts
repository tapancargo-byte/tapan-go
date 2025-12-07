import { NextResponse } from "next/server";
import { generateIconFromText, previewIconFromText } from "@/lib/freepik";

interface TextToIconBody {
  prompt?: string;
  mode?: "preview" | "generate";
  // Allow additional Freepik-specific options to be passed through
  [key: string]: any;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as TextToIconBody;

    const prompt = (body.prompt ?? "").toString().trim();
    if (!prompt) {
      return NextResponse.json({ ok: false, error: "prompt is required" }, { status: 400 });
    }

    const mode: "preview" | "generate" = body.mode === "preview" ? "preview" : "generate";

    // Pass through any extra options to Freepik; avoid sending mode twice.
    const { mode: _ignoredMode, ...rest } = body;
    const payload = { prompt, ...rest };

    const result =
      mode === "preview"
        ? await previewIconFromText(payload)
        : await generateIconFromText(payload);

    return NextResponse.json({ ok: true, mode, result });
  } catch (err: any) {
    console.error("/api/public/freepik/icon error", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}
