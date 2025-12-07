"use server";

const FREEPIK_API_BASE = "https://api.freepik.com/v1";

function getFreepikApiKey(): string {
  const key = process.env.FREEPIK_API_KEY;
  if (!key) {
    throw new Error("FREEPIK_API_KEY is not set. Add it to your environment or .env.local.");
  }
  return key;
}

async function freepikRequest<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const apiKey = getFreepikApiKey();
  const url = path.startsWith("http") ? path : `${FREEPIK_API_BASE}${path}`;

  const headers: HeadersInit = {
    "x-freepik-api-key": apiKey,
    "Content-Type": "application/json",
    ...(init.headers || {}),
  };

  const res = await fetch(url, {
    ...init,
    headers,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Freepik API error ${res.status}: ${text}`);
  }

  // Most Freepik endpoints return JSON; callers can override generics if needed.
  return (await res.json()) as T;
}

export async function searchIcons(params: Record<string, string | number | boolean>) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    searchParams.set(key, String(value));
  }
  return freepikRequest(`/icons?${searchParams.toString()}`);
}

export async function getIconById(id: string) {
  return freepikRequest(`/icons/${encodeURIComponent(id)}`);
}

export async function downloadIconById(id: string, options: { format?: string; size?: string } = {}) {
  const { format = "png", size } = options;
  const searchParams = new URLSearchParams();
  if (size) searchParams.set("size", size);
  const path = `/icons/${encodeURIComponent(id)}/download${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  return freepikRequest(path);
}

export async function generateIconFromText(body: any) {
  // POST /v1/ai/text-to-icon
  return freepikRequest("/ai/text-to-icon", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function previewIconFromText(body: any) {
  // POST /v1/ai/text-to-icon/preview
  return freepikRequest("/ai/text-to-icon/preview", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function renderGeneratedIcon(taskId: string, format: "png" | "svg" = "png") {
  // POST /v1/ai/text-to-icon/{task-id}/render/{format}
  return freepikRequest(`/ai/text-to-icon/${encodeURIComponent(taskId)}/render/${format}`, {
    method: "POST",
  });
}

export async function classifyImageAiGenerated(formData: FormData) {
  // POST /v1/ai/classifier/image (multipart/form-data)
  const apiKey = getFreepikApiKey();
  const res = await fetch(`${FREEPIK_API_BASE}/ai/classifier/image`, {
    method: "POST",
    headers: {
      "x-freepik-api-key": apiKey,
    },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Freepik classifier error ${res.status}: ${text}`);
  }

  return (await res.json()) as any;
}
