import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      id?: string;
      name?: string | null;
      email?: string | null;
      phone?: string | null;
      city?: string | null;
    };

    const { id, name, email, phone, city } = body;

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    const payload: Record<string, string | null> = {};

    if (typeof name === "string") payload.name = name.trim();
    if (typeof email === "string") payload.email = email.trim() || null;
    if (typeof phone === "string") payload.phone = phone.trim() || null;
    if (typeof city === "string") payload.city = city.trim() || null;

    const { data, error } = await supabaseAdmin
      .from("customers")
      .update(payload)
      .eq("id", id)
      .select("id, name, email, phone, city")
      .maybeSingle();

    if (error) {
      console.error("supabaseAdmin update customer error", error);
      return NextResponse.json(
        {
          error: error.message ?? "Failed to update customer",
          details: error,
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ customer: data });
  } catch (err: any) {
    console.error("/api/customers/update error", err);
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
