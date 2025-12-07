import { OpenRouter } from "@openrouter/sdk";

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  throw new Error("Missing OPENROUTER_API_KEY env var for OpenRouter SDK");
}

export const TAPAN_ASSOCIATE_MODEL =
  process.env.OPENROUTER_MODEL ?? "x-ai/grok-4.1-fast:free";

export const openrouterClient = new OpenRouter({
  apiKey,
});
