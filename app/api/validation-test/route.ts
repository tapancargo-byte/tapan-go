
import { NextResponse } from "next/server";
import { POST as SimulationPOST } from "@/app/api/simulation/route";

export const POST = SimulationPOST;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const tracking = searchParams.get("tracking");

  if (action === "generate_whatsapp_url" || action === "get_whatsapp_url") {
    if (!tracking) {
      return NextResponse.json({ error: "Missing tracking ref" }, { status: 400 });
    }
    const text = `Hi, here is your invoice ${tracking}`;
    const url = `https://wa.me/1234567890?text=${encodeURIComponent(text)}`;
    return NextResponse.json({ success: true, url });
  }

  if (action === "send_whatsapp_message") {
    return NextResponse.json({ success: true, messageId: "mock-msg-id" });
  }
  
  if (action === "send_whatsapp_message_invalid_credentials") {
     return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  return NextResponse.json({ status: "ok" });
}
