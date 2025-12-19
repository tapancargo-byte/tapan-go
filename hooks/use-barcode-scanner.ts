import { useEffect, useRef } from "react";

interface UseBarcodeScannerOptions {
    onScan: (barcode: string) => void;
    minLength?: number;
    timeThreshold?: number; // Time in ms between keystrokes to consider it a scan
    debug?: boolean;
    enabled?: boolean;
}

export function useBarcodeScanner({
    onScan,
    minLength = 3,
    timeThreshold = 2000, // Increased to 2000ms to handle React re-render delays
    debug = false,
    enabled = true,
}: UseBarcodeScannerOptions) {
    // Use ref to avoid buffer reset when onScan changes
    const onScanRef = useRef(onScan);
    onScanRef.current = onScan;

    useEffect(() => {
        if (!enabled) return;

        let buffer = "";
        let lastKeyTime = Date.now();

        const onKeyDown = (e: KeyboardEvent) => {
            const now = Date.now();
            const timeSinceLast = now - lastKeyTime;
            const isEnter = e.key === "Enter";

            // If keys are pressed too slowly, it's likely manual typing -> reset buffer
            // Exception: if buffer is empty, this is the first char
            if (buffer.length > 0 && timeSinceLast > timeThreshold && !isEnter) {
                if (debug) console.log("Barcode: Slow typing detected, resetting buffer");
                buffer = "";
            }

            if (isEnter) {
                if (buffer.length >= minLength) {
                    if (debug) console.log("Barcode Scanned:", buffer);
                    onScanRef.current(buffer);
                }
                buffer = "";
            } else {
                // Only append printable characters (length 1)
                if (e.key.length === 1) {
                    buffer += e.key;
                }
            }

            lastKeyTime = now;
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [minLength, timeThreshold, debug, enabled]);
}
