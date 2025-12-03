import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/api/withAuth";
import { withValidation } from "@/lib/api/withValidation";
import { withRateLimit } from "@/lib/rateLimit";
import { queueInvoiceGeneration } from "@/lib/queues/setup";

const queueInvoiceSchema = z.object({
  invoiceId: z.string().uuid("Invalid invoice ID"),
});

/**
 * Queue invoice PDF generation
 * POST /api/invoices/queue
 * 
 * This endpoint queues the invoice for PDF generation in the background
 * instead of generating it synchronously
 */
export const POST = withRateLimit(
  "api",
  withAuth(
    withValidation(queueInvoiceSchema, async (req, data, context) => {
      const { userId, userRole } = context;
      const { invoiceId } = data;

      try {
        // Queue the job
        const job = await queueInvoiceGeneration(invoiceId);

        return NextResponse.json({
          success: true,
          jobId: job.id,
          message: "Invoice generation queued",
          estimatedTime: "1-2 minutes",
        });
      } catch (error: any) {
        console.error("Error queuing invoice:", error);
        return NextResponse.json(
          {
            error: "Failed to queue invoice generation",
            code: "QUEUE_ERROR",
            details: error.message,
          },
          { status: 500 }
        );
      }
    }),
    { allowedRoles: ["admin", "operator"] }
  ),
  (req) => {
    // Use userId as rate limit identifier
    return req.headers.get("x-user-id") || "anonymous";
  }
);
