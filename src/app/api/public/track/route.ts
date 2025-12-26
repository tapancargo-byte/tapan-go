import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { withRateLimit } from "@/lib/rateLimit";
import { performTracking } from "@/lib/tracking";

interface TrackRequestBody {
	query?: string;
}

async function handleTrackPost(req: Request) {
	try {
		const { query } = (await req.json()) as TrackRequestBody;
		const trimmed = (query ?? "").trim();

		if (!trimmed) {
			return NextResponse.json({ error: "query is required" }, { status: 400 });
		}

		const result = await performTracking(trimmed);

		if ("error" in result) {
			return NextResponse.json(
				{ error: result.error },
				{ status: result.status },
			);
		}

		return NextResponse.json(result);
	} catch (err: any) {
		Sentry.captureException(err, {
			tags: { component: "api-track", operation: "track-post" },
		});
		return NextResponse.json(
			{ error: err?.message ?? "Unknown error" },
			{ status: 500 },
		);
	}
}

export const POST = withRateLimit("tracking", handleTrackPost);

async function handleTrackGet(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const queryParam =
			searchParams.get("query") ??
			searchParams.get("ref") ??
			searchParams.get("q") ??
			"";
		const trimmed = queryParam.trim();

		if (!trimmed) {
			return NextResponse.json({ error: "query is required" }, { status: 400 });
		}

		const result = await performTracking(trimmed);

		if ("error" in result) {
			return NextResponse.json(
				{ error: result.error },
				{ status: result.status },
			);
		}

		return NextResponse.json(result);
	} catch (err: any) {
		Sentry.captureException(err, {
			tags: { component: "api-track", operation: "track-get" },
		});
		return NextResponse.json(
			{ error: err?.message ?? "Unknown error" },
			{ status: 500 },
		);
	}
}

export const GET = withRateLimit("tracking", handleTrackGet);
