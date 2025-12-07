
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { invoiceId: string } }) {
  const { invoiceId } = params;
  const url = `https://wa.me/1234567890?text=Invoice%20${invoiceId}`;
  return NextResponse.json({ success: true, url });
}
