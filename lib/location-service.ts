"use client";

import type { LocationScope } from "@/types/auth";

/**
 * Response from ipapi.co API
 * See: https://ipapi.co/api/
 */
export interface IpApiResponse {
    ip: string;
    city: string | null;
    region: string | null;
    region_code: string | null;
    country_code: string;
    country_name: string;
    continent_code: string;
    postal: string | null;
    latitude: number;
    longitude: number;
    timezone: string;
    utc_offset: string;
    country_calling_code: string;
    currency: string;
    currency_name: string;
    languages: string;
    asn: string;
    org: string;
    error?: boolean;
    reason?: string;
}

export interface DetectedLocation {
    scope: LocationScope;
    city: string | null;
    region: string | null;
    country: string;
    countryCode: string;
    timezone: string;
    ip: string;
    confidence: "high" | "medium" | "low";
}

// Cache location data to avoid repeated API calls
let cachedLocation: DetectedLocation | null = null;

// Northeast Indian states that map to Imphal office
const NORTHEAST_STATES = [
    "Manipur",
    "Nagaland",
    "Mizoram",
    "Assam",
    "Meghalaya",
    "Tripura",
    "Arunachal Pradesh",
    "Sikkim",
];

// Northeast region codes
const NORTHEAST_REGION_CODES = [
    "MN", // Manipur
    "NL", // Nagaland
    "MZ", // Mizoram
    "AS", // Assam
    "ML", // Meghalaya
    "TR", // Tripura
    "AR", // Arunachal Pradesh
    "SK", // Sikkim
];

/**
 * Maps ipapi.co response to internal LocationScope
 * - Northeast India → Imphal
 * - Rest of India → New Delhi
 * - International → All locations view
 */
function mapToLocationScope(data: IpApiResponse): {
    scope: LocationScope;
    confidence: "high" | "medium" | "low";
} {
    // Check for India
    if (data.country_code === "IN") {
        const region = data.region || "";
        const regionCode = data.region_code || "";

        // Check if in Northeast India
        if (
            NORTHEAST_STATES.some(
                (state) => region.toLowerCase() === state.toLowerCase()
            ) ||
            NORTHEAST_REGION_CODES.includes(regionCode.toUpperCase())
        ) {
            return { scope: "imphal", confidence: "high" };
        }

        // All other Indian regions → New Delhi (headquarters)
        return { scope: "newdelhi", confidence: "high" };
    }

    // International users → All locations view
    return { scope: "all", confidence: "medium" };
}

/**
 * Detects user location based on IP address using ipapi.co API
 *
 * @param forceRefresh - If true, bypasses cache and fetches fresh data
 * @returns DetectedLocation or null if detection fails
 *
 * @example
 * const location = await detectUserLocation();
 * if (location) {
 *   console.log(`Detected: ${location.city}, ${location.region}`);
 *   console.log(`Mapped to: ${location.scope}`);
 * }
 */
export async function detectUserLocation(
    forceRefresh = false
): Promise<DetectedLocation | null> {
    // Return cached location if available and not forcing refresh
    if (cachedLocation && !forceRefresh) {
        return cachedLocation;
    }

    try {
        const response = await fetch("https://ipapi.co/json/", {
            signal: AbortSignal.timeout(3000), // 3 second timeout
        });

        if (!response.ok) {
            console.warn(
                `[location-service] API returned status ${response.status}`
            );
            return null;
        }

        const data: IpApiResponse = await response.json();

        // Check for API error response
        if (data.error) {
            console.warn(`[location-service] API error: ${data.reason}`);
            return null;
        }

        const { scope, confidence } = mapToLocationScope(data);

        const detectedLocation: DetectedLocation = {
            scope,
            city: data.city,
            region: data.region,
            country: data.country_name,
            countryCode: data.country_code,
            timezone: data.timezone,
            ip: data.ip,
            confidence,
        };

        // Cache the result
        cachedLocation = detectedLocation;

        return detectedLocation;
    } catch (error) {
        // Handle timeout or network errors silently
        if (error instanceof Error) {
            if (error.name === "TimeoutError" || error.name === "AbortError") {
                console.warn("[location-service] Request timed out");
            } else {
                console.warn("[location-service] Failed to detect location:", error.message);
            }
        }
        return null;
    }
}

/**
 * Clears the cached location data
 * Useful when user wants to re-detect location
 */
export function clearLocationCache(): void {
    cachedLocation = null;
}

/**
 * Gets the cached location without making an API call
 * Returns null if no location is cached
 */
export function getCachedLocation(): DetectedLocation | null {
    return cachedLocation;
}
