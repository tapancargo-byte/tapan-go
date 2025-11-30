import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

interface PublicSupportBody {
  email?: string;
  name?: string | null;
  shipmentRef?: string | null;
  subject?: string | null;
  description?: string | null;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PublicSupportBody;

    const email = (body.email ?? "").trim().toLowerCase();
    const subjectInput = (body.subject ?? "").trim();
    const description = (body.description ?? "").trim();
    const name = (body.name ?? "").trim();
    const shipmentRef = (body.shipmentRef ?? "").trim();

    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    if (!subjectInput) {
      return NextResponse.json({ error: "subject is required" }, { status: 400 });
    }

    if (!description) {
      return NextResponse.json(
        { error: "description is required" },
        { status: 400 }
      );
    }

    // Find or create customer by email.
    const { data: existingCustomer, error: customerError } = await supabaseAdmin
      .from("customers")
      .select("id, name, email")
      .eq("email", email)
      .maybeSingle();

    if (customerError) {
      console.error("supabaseAdmin customers lookup error", customerError);
      return NextResponse.json(
        { error: customerError.message ?? "Failed to look up customer" },
        { status: 500 }
      );
    }

    let customerId: string | null = (existingCustomer?.id as string | undefined) ?? null;

    if (!customerId) {
      const insertPayload: any = { email };
      if (name) insertPayload.name = name;

      const { data: inserted, error: insertError } = await supabaseAdmin
        .from("customers")
        .insert(insertPayload)
        .select("id, name, email")
        .single();

      if (insertError || !inserted) {
        console.error("supabaseAdmin customers insert error", insertError);
        return NextResponse.json(
          { error: insertError?.message ?? "Failed to create customer" },
          { status: 500 }
        );
      }

      customerId = inserted.id as string;
    } else if (name && !existingCustomer?.name) {
      // Optionally attach a name when we first learn it for an email-only customer.
      try {
        await supabaseAdmin
          .from("customers")
          .update({ name })
          .eq("id", customerId)
          .select("id")
          .maybeSingle();
      } catch (updateErr) {
        console.warn("supabaseAdmin customers name update error", updateErr);
      }
    }

    // Compose subject, optionally include shipment reference and a short summary
    let subject = subjectInput;
    if (shipmentRef) {
      subject = `[${shipmentRef}] ${subjectInput}`;
    }

    const combinedSubject =
      description.length > 160
        ? `${subject} — ${description.slice(0, 157)}…`
        : `${subject} — ${description}`;

    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from("support_tickets")
      .insert({
        subject: combinedSubject,
        status: "open",
        priority: "medium",
        customer_id: customerId,
      } as any)
      .select("id, subject, status, priority, created_at")
      .single();

    if (ticketError || !ticket) {
      console.error(
        "supabaseAdmin public support ticket insert error",
        ticketError
      );
      return NextResponse.json(
        { error: ticketError?.message ?? "Failed to create support ticket" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ticketId: ticket.id,
      subject: ticket.subject,
      status: ticket.status,
      createdAt: ticket.created_at,
    });
  } catch (err: any) {
    console.error("/api/public/support error", err);
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
