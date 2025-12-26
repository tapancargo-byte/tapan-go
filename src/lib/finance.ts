import type {
	AgingBucket,
	ARBucket,
	ARSummary,
} from "@/features/invoices/types";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function getARStats(): Promise<ARSummary> {
	const [invoicesRes, paymentsRes] = await Promise.all([
		supabaseAdmin.from("invoices").select("id, amount, status, due_date"),
		supabaseAdmin
			.from("invoice_payments")
			.select("invoice_id, amount, created_at, payment_date"),
	]);

	if (invoicesRes.error) {
		console.error("Error fetching invoices:", invoicesRes.error);
		throw new Error("Failed to fetch invoices");
	}

	const invoices = (invoicesRes.data as any[]) ?? [];
	const payments = (paymentsRes.data as any[]) ?? [];

	if (paymentsRes.error && paymentsRes.error.code !== "PGRST205") {
		console.warn(
			"Error fetching payments (ignoring if missing table):",
			paymentsRes.error,
		);
	}

	const paidMap = new Map<string, number>();

	// Momentum calc
	const now = new Date();
	const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
	const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

	let collectedLast7Days = 0;
	let collectedPrior7Days = 0;

	payments.forEach((row) => {
		const invoiceId = (row.invoice_id as string | null) ?? null;
		const amount = Number((row.amount as number | null) ?? 0);
		const dateStr = (row.payment_date as string) || (row.created_at as string);

		if (invoiceId) {
			const existing = paidMap.get(invoiceId) ?? 0;
			paidMap.set(invoiceId, existing + amount);
		}

		if (dateStr) {
			const paymentDate = new Date(dateStr);
			if (paymentDate >= sevenDaysAgo) {
				collectedLast7Days += amount;
			} else if (paymentDate >= fourteenDaysAgo) {
				collectedPrior7Days += amount;
			}
		}
	});

	// Calculate momentum (percentage change)
	let momentum = 0;
	if (collectedPrior7Days > 0) {
		momentum =
			((collectedLast7Days - collectedPrior7Days) / collectedPrior7Days) * 100;
	} else if (collectedLast7Days > 0) {
		momentum = 100; // infinite growth from 0
	}

	let totalInvoiced = 0;
	let totalPaid = 0;
	let totalOutstanding = 0;

	const emptyBucket = (): ARBucket => ({
		invoiceCount: 0,
		invoiceAmount: 0,
		outstanding: 0,
	});

	const buckets = {
		paid: emptyBucket(),
		pending: emptyBucket(),
		overdue: emptyBucket(),
		partially_paid: emptyBucket(),
		other: emptyBucket(),
	};

	const emptyAgingBucket = (): AgingBucket => ({ count: 0, amount: 0 });
	const aging = {
		current: emptyAgingBucket(),
		days1to30: emptyAgingBucket(),
		days31to60: emptyAgingBucket(),
		days61plus: emptyAgingBucket(),
	};

	invoices.forEach((row) => {
		const id = row.id as string;
		const amount = Number(row.amount ?? 0);
		const status = (row.status as string) ?? "pending";
		const dueDateStr = row.due_date as string | null;

		const paid = paidMap.get(id) ?? 0;
		const outstanding = Math.max(amount - paid, 0);

		totalInvoiced += amount;
		totalPaid += Math.min(paid, amount);
		totalOutstanding += outstanding;

		let bucketKey: keyof typeof buckets;
		// Map status to bucket
		if (status === "paid") bucketKey = "paid";
		else if (status === "pending") bucketKey = "pending";
		else if (status === "overdue") bucketKey = "overdue";
		else if (status === "partially_paid") bucketKey = "partially_paid";
		else bucketKey = "other";

		const bucket = buckets[bucketKey];
		bucket.invoiceCount += 1;
		bucket.invoiceAmount += amount;
		bucket.outstanding += outstanding;

		// Aging logic
		if (outstanding > 0) {
			let daysPastDue = 0;
			if (dueDateStr) {
				const dueDate = new Date(dueDateStr);
				daysPastDue = Math.floor(
					(now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
				);
			}

			if (daysPastDue <= 0) {
				aging.current.count += 1;
				aging.current.amount += outstanding;
			} else if (daysPastDue <= 30) {
				aging.days1to30.count += 1;
				aging.days1to30.amount += outstanding;
			} else if (daysPastDue <= 60) {
				aging.days31to60.count += 1;
				aging.days31to60.amount += outstanding;
			} else {
				aging.days61plus.count += 1;
				aging.days61plus.amount += outstanding;
			}
		}
	});

	return {
		totalInvoiced,
		totalPaid,
		totalOutstanding,
		buckets,
		aging,
		collectionsMomentum: Math.round(momentum),
	};
}
