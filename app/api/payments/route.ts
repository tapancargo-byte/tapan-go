import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { paymentSchema } from "@/lib/validations";

const bodySchema = paymentSchema.extend({
  operatorId: z.string().uuid().optional(),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get("invoiceId");

    if (!invoiceId) {
      return NextResponse.json(
        { error: "invoiceId is required" },
        { status: 400 }
      );
    }

    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from("invoices")
      .select("id, amount, status")
      .eq("id", invoiceId)
      .maybeSingle();

    if (invoiceError) {
      throw invoiceError;
    }

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from("invoice_payments")
      .select(
        "id, invoice_id, amount, payment_date, payment_mode, reference, created_by, created_at"
      )
      .eq("invoice_id", invoiceId)
      .order("payment_date", { ascending: true });

    if (paymentsError) {
      throw paymentsError;
    }

    const totalPaid = (payments ?? []).reduce(
      (sum, row: any) => sum + Number(row.amount ?? 0),
      0
    );

    const invoiceTotal = Number((invoice as any).amount ?? 0);
    const outstanding = invoiceTotal - totalPaid;

    return NextResponse.json({
      payments: payments ?? [],
      totals: {
        invoiceTotal,
        totalPaid,
        outstanding,
        status: invoice.status ?? "pending",
      },
    });
  } catch (err: any) {
    console.error("/api/payments GET error", err);
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid payload",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { invoiceId, amount, paymentDate, paymentMode, reference, operatorId } =
      parsed.data;

    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from("invoices")
      .select("id, amount, status")
      .eq("id", invoiceId)
      .maybeSingle();

    if (invoiceError) {
      throw invoiceError;
    }

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("invoice_payments")
      .insert([
        {
          invoice_id: invoiceId,
          amount,
          payment_date: paymentDate ?? new Date().toISOString(),
          payment_mode: paymentMode,
          reference: reference ?? null,
          created_by: operatorId ?? null,
        },
      ])
      .select("id, invoice_id, amount, payment_date, payment_mode, reference, created_by, created_at")
      .single();

    if (paymentError) {
      throw paymentError;
    }

    const { data: paymentsAgg, error: aggError } = await supabaseAdmin
      .from("invoice_payments")
      .select("amount")
      .eq("invoice_id", invoiceId);

    if (aggError) {
      throw aggError;
    }

    const totalPaid = (paymentsAgg ?? []).reduce(
      (sum, row: any) => sum + Number(row.amount ?? 0),
      0
    );

    const invoiceTotal = Number((invoice as any).amount ?? 0);
    const outstanding = invoiceTotal - totalPaid;

    let nextStatus: string = invoice.status ?? "pending";
    if (outstanding <= 0) {
      nextStatus = "paid";
    } else if (totalPaid > 0 && outstanding > 0) {
      nextStatus = "partially_paid";
    }

    const { error: updateError } = await supabaseAdmin
      .from("invoices")
      .update({ status: nextStatus })
      .eq("id", invoiceId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      payment,
      totals: {
        invoiceTotal,
        totalPaid,
        outstanding,
        status: nextStatus,
      },
    });
  } catch (err: any) {
    console.error("/api/payments error", err);
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
