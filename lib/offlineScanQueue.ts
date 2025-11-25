const STORAGE_KEY = "tapan-go-offline-scans";

interface QueuedScan {
  id: string;
  barcode: string;
  scanType: string;
  location?: string | null;
  operatorId?: string | null;
  createdAt: string;
}

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function loadQueue(): QueuedScan[] {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as QueuedScan[];
  } catch {
    return [];
  }
}

function saveQueue(queue: QueuedScan[]) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // ignore
  }
}

export function enqueueScan(scan: Omit<QueuedScan, "id" | "createdAt">) {
  const queue = loadQueue();
  const entry: QueuedScan = {
    id: `scan-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    createdAt: new Date().toISOString(),
    barcode: scan.barcode,
    scanType: scan.scanType,
    location: scan.location ?? null,
    operatorId: scan.operatorId ?? null,
  };
  queue.push(entry);
  saveQueue(queue);
}

export async function flushOfflineScans() {
  if (typeof window === "undefined") return;
  if (!navigator.onLine) return;

  let queue = loadQueue();
  if (!queue.length) return;

  const remaining: QueuedScan[] = [];

  for (const item of queue) {
    try {
      const res = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barcode: item.barcode,
          scanType: item.scanType,
          location: item.location ?? undefined,
          operatorId: item.operatorId ?? undefined,
        }),
      });

      if (!res.ok) {
        // keep it in the queue to retry later
        remaining.push(item);
      }
    } catch {
      // network error: keep this and the rest for later
      remaining.push(item);
    }
  }

  saveQueue(remaining);
}
