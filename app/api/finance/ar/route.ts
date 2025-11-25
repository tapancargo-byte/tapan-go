import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

interface ARBucket {
  invoiceCount: number;
  invoiceAmount: number;
  outstanding: number;
}

interface ARSummaryResponse {
  totalInvoiced: number;
  totalPaid: number;
  totalOutstanding: number;
  buckets: {
    paid: ARBucket;
    pending: ARBucket;
    overdue: ARBucket;
    partially_paid: ARBucket;
    other: ARBucket;
  };
}

export async function GET() {
  try {
    const [invoicesRes, paymentsRes] = await Promise.all([
      supabaseAdmin
        .from("invoices")
        .select("id, amount, status"),
      supabaseAdmin
        .from("invoice_payments")
        .select("invoice_id, amount"),
    ]);

    if (invoicesRes.error) {
      throw invoicesRes.error;
    }
    if (paymentsRes.error && paymentsRes.error.code !== "PGRST205") {
      throw paymentsRes.error;
    }

    const invoices = (invoicesRes.data as any[]) ?? [];
    const payments = (paymentsRes.data as any[]) ?? [];

    if (paymentsRes.error && paymentsRes.error.code === "PGRST205") {
      console.warn(
        "/api/finance/ar: invoice_payments table missing; treating all invoices as unpaid",
        paymentsRes.error
      );
    }

    const invoiceMap = new Map<string, { amount: number; status: string }>();
    invoices.forEach((row) => {
      const id = (row.id as string | null) ?? null;
      if (!id) return;
      invoiceMap.set(id, {
        amount: Number((row.amount as number | null) ?? 0),
        status: (row.status as string | null) ?? "pending",
      });
    });

    const paidMap = new Map<string, number>();
    payments.forEach((row) => {
      const invoiceId = (row.invoice_id as string | null) ?? null;
      if (!invoiceId) return;
      const existing = paidMap.get(invoiceId) ?? 0;
      paidMap.set(invoiceId, existing + Number((row.amount as number | null) ?? 0));
    });

    let totalInvoiced = 0;
    let totalPaid = 0;
    let totalOutstanding = 0;

    const emptyBucket = (): ARBucket => ({
      invoiceCount: 0,
      invoiceAmount: 0,
      outstanding: 0,
    });

    const buckets: ARSummaryResponse["buckets"] = {
      paid: emptyBucket(),
      pending: emptyBucket(),
      overdue: emptyBucket(),
      partially_paid: emptyBucket(),
      other: emptyBucket(),
    };

    invoiceMap.forEach((invoice, id) => {
      const amount = invoice.amount;
      const paid = paidMap.get(id) ?? 0;
      const outstanding = Math.max(amount - paid, 0);

      totalInvoiced += amount;
      totalPaid += Math.min(paid, amount);
      totalOutstanding += outstanding;

      let bucketKey: keyof ARSummaryResponse["buckets"];
      switch (invoice.status) {
        case "paid":
          bucketKey = "paid";
          break;
        case "pending":
          bucketKey = "pending";
          break;
        case "overdue":
          bucketKey = "overdue";
          break;
        case "partially_paid":
          bucketKey = "partially_paid";
          break;
        default:
          bucketKey = "other";
          break;
      }

      const bucket = buckets[bucketKey];
      bucket.invoiceCount += 1;
      bucket.invoiceAmount += amount;
      bucket.outstanding += outstanding;
    });

    const payload: ARSummaryResponse = {
      totalInvoiced,
      totalPaid,
      totalOutstanding,
      buckets,
    };

    return NextResponse.json(payload);
  } catch (err: any) {
    console.error("/api/finance/ar error", err);
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
