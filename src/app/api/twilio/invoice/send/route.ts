import { NextResponse } from "next/server";

export async function POST(_req: Request) {
	return NextResponse.json({
		success: true,
		message: "Mock SMS sent",
		to: "+1234567890",
	});
}
