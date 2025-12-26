import { NextResponse } from "next/server";

export async function POST(_req: Request) {
	return NextResponse.json({ success: true, message: "Presence simulated" });
}

export async function GET(_req: Request) {
	return NextResponse.json({ success: true, message: "Presence simulated" });
}
