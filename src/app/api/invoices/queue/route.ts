import { NextResponse } from "next/server";
import { z } from "zod";
import { withRateLimit } from "@/lib/rateLimit";

const _queueInvoiceSchema = z.object({
	invoiceId: z.string().uuid("Invalid invoice ID"),
});

/**
 * Queue invoice PDF generation
 * POST /api/invoices/queue
 *
 * This endpoint queues the invoice for PDF generation in the background
 * instead of generating it synchronously
 */
// import { queueInvoiceGeneration } from "@/lib/queues/setup";

export const POST = withRateLimit(
	"api",
	async (_req) => {
		return NextResponse.json(
			{ error: "Queue service disabled" },
			{ status: 503 },
		);
	},
	(req) => {
		// Use userId as rate limit identifier
		return req.headers.get("x-user-id") || "anonymous";
	},
);
