import { streamText, type UIMessage, convertToModelMessages } from "ai";
import { perplexity } from "@ai-sdk/perplexity";
import { performTracking } from "@/app/api/public/track/route";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

interface ChatRequestBody {
  messages: UIMessage[];
  model?: string;
  webSearch?: boolean;
}

const DEFAULT_MODEL_BASE = process.env.TAPAN_ASSOCIATE_MODEL || "sonar-pro";

const BASE_SYSTEM_PROMPT = [
  "You are the official AI assistant for Tapan Associate (Tapan Go / Tapan Cargo).",
  "You must only answer questions that are directly related to Tapan logistics:",
  "- shipments, barcodes, invoices, and tracking references",
  "- Tapan hubs (Imphal/IMF, New Delhi/DEL), services, and network",
  "- how to use the public landing page, Track your shipment, and Get in touch sections",
  "- raising or checking support tickets.",
  "If a question is not about Tapan Associate logistics, politely say you can only help with Tapan shipments, tracking, invoices, and support, and do NOT answer the unrelated topic.",
  "When a user provides a shipment reference, barcode, or invoice reference, you may look up live data using the Tapan tracking system and summarise it for the customer.",
  "When a user wants help from the ops team, direct them to the ticket form in the Get in touch section and summarise what information they should provide.",
  "Do not mention or rely on random external websites or songs. Keep answers short, clear, and specific to Tapan Associate.",
].join(" ");

function normalizePerplexityBaseName(baseName?: string): string {
  const cleaned = (baseName ?? DEFAULT_MODEL_BASE).trim() || DEFAULT_MODEL_BASE;
  // Accept values like 'sonar-pro' or 'perplexity/sonar-pro' and strip any prefix.
  if (cleaned.startsWith("perplexity/")) {
    return cleaned.slice("perplexity/".length) || DEFAULT_MODEL_BASE;
  }
  return cleaned;
}

function resolvePerplexityModel(baseName?: string, webSearch?: boolean) {
  if (webSearch) {
    // Sonar is the search-grounded model for web answers.
    return perplexity("sonar");
  }

  const modelName = normalizePerplexityBaseName(baseName);
  return perplexity(modelName);
}

function getLatestUserText(messages: UIMessage[]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg: any = messages[i];
    if (msg.role !== "user") continue;

    if (typeof msg.content === "string") return msg.content;

    if (Array.isArray(msg.parts)) {
      const textPart = msg.parts.find((p: any) => typeof p.text === "string");
      if (textPart) return textPart.text as string;
    }
  }
  return null;
}

function extractTrackingRefFromText(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  // Require at least one digit so we don't trigger on every sentence.
  if (!/\d/.test(trimmed)) return null;

  // If the whole message looks like a single reference token, use it.
  if (!/\s/.test(trimmed) && /[A-Z0-9-]{6,}/i.test(trimmed) && trimmed.length <= 64) {
    return trimmed;
  }

  const match = trimmed.match(/\b[A-Z0-9-]{6,}\b/gi);
  return match?.[0] ?? null;
}

async function buildTrackingContext(messages: UIMessage[]): Promise<string> {
  try {
    const latest = getLatestUserText(messages);
    if (!latest) return "";

    const ref = extractTrackingRefFromText(latest);
    if (!ref) return "";

    const tracking = await performTracking(ref);

    if ((tracking as any)?.error && "status" in (tracking as any)) {
      return ` Tracking lookup: For reference "${ref}", no shipment, barcode, or invoice records were found in the Tapan system. When you answer, clearly explain that this reference is not found and suggest checking the reference or raising a ticket from the Get in touch section.`;
    }

    const data: any = tracking;
    const pieces: string[] = [];

    if (data.shipment) {
      pieces.push(
        `Shipment status: ${data.shipment.status ?? "unknown"}, progress: ${
          typeof data.shipment.progress === "number" ? `${data.shipment.progress}%` : "n/a"
        }, route: ${data.shipment.origin ?? "?"} -> ${data.shipment.destination ?? "?"}.`,
      );

      if (data.shipment.eta || data.shipment.ata) {
        if (data.shipment.ata) {
          pieces.push(`Delivered at ${data.shipment.ata}.`);
        } else {
          pieces.push(`Estimated arrival ${data.shipment.eta}.`);
        }
      }
    }

    if (data.invoice) {
      pieces.push(
        `Invoice ${data.invoice.invoice_ref} amount ${data.invoice.amount}, status ${
          data.invoice.status ?? "unknown"
        }.`,
      );
    }

    const barcodeCount = Array.isArray(data.barcodes) ? data.barcodes.length : 0;
    const scanCount = Array.isArray(data.scans) ? data.scans.length : 0;

    pieces.push(
      `There are ${barcodeCount} package barcodes and ${scanCount} recorded scans for this reference.`,
    );

    const lookupType = (data.lookup?.type as string | undefined) ?? "unknown";

    return [
      `Tracking lookup result for reference "${ref}" (type: ${lookupType}).`,
      ...pieces,
      "Summarise this data clearly for the customer in simple language.",
    ].join(" ");
  } catch (err) {
    console.error("AI chat tracking lookup error", err);
    return "";
  }
}

export async function POST(req: Request) {
  const { messages, model, webSearch }: ChatRequestBody = await req.json();

  const trackingContext = await buildTrackingContext(messages);

  const result = streamText({
    model: resolvePerplexityModel(model, webSearch),
    messages: convertToModelMessages(messages),
    system: `${BASE_SYSTEM_PROMPT}${trackingContext ? ` ${trackingContext}` : ""}`,
  });

  // For a focused customer experience, do not stream raw sources or reasoning parts.
  return result.toUIMessageStreamResponse();
}
