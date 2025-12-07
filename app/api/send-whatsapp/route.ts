
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Mock successful send
    return NextResponse.json({ 
      success: true, 
      message: "WhatsApp message sent",
      messageId: "wamid." + Math.random().toString(36).substring(7)
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
