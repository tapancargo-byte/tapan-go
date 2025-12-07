import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      message: "TypeScript Compilation Successful",
    },
    { status: 200 },
  );
}
