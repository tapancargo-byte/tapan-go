import { notFound } from "next/navigation";
import { ClientPrintButton } from "@/components/invoices/client-print-button";
import { CustomerInvoice } from "@/components/invoices/customer-invoice";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

interface InvoicePrintPageProps {
	params: { invoiceId: string };
}

export default async function PrintCustomerInvoicePage({
	params,
}: InvoicePrintPageProps) {
	const invoiceId = params.invoiceId;

	// Fetch Invoice
	const { data: invoice, error: invoiceError } = await supabaseAdmin
		.from("invoices")
		.select(
			"id, invoice_ref, customer_id, consignor_id, consignee_id, amount, status, invoice_date, due_date, origin, destination, pieces, charged_weight, declared_value, payment_mode, freight_amount, other_charge, gst_amount",
		) // Added specific charge fields
		.eq("id", invoiceId)
		.maybeSingle();

	if (invoiceError || !invoice) {
		if (invoiceError) console.error("Invoice fetch error", invoiceError);
		notFound();
	}

	// Fetch Parties
	const { data: consignor } = await supabaseAdmin
		.from("customers")
		.select("id, name, phone, city, address_line_1, address_line_2")
		.eq("id", (invoice as any).consignor_id)
		.maybeSingle();

	const { data: consignee } = await supabaseAdmin
		.from("customers")
		.select("id, name, phone, city, address_line_1, address_line_2")
		.eq("id", (invoice as any).consignee_id)
		.maybeSingle();

	// Construct the object for the component
	const invoiceData = {
		id: invoice.id,
		invoiceRef: invoice.invoice_ref ?? invoice.id,
		dateOfBooking: invoice.invoice_date,
		consignor: {
			name: consignor?.name ?? "N/A",
			address: [
				consignor?.address_line_1,
				consignor?.address_line_2,
				consignor?.city,
			]
				.filter(Boolean)
				.join(", "),
			phone: consignor?.phone,
		},
		consignee: {
			name: consignee?.name ?? "N/A",
			address: [
				consignee?.address_line_1,
				consignee?.address_line_2,
				consignee?.city,
			]
				.filter(Boolean)
				.join(", "),
			phone: consignee?.phone,
		},
		origin: invoice.origin ?? "",
		destination: invoice.destination ?? "",
		pieces: invoice.pieces ?? 0,
		weight: 0,
		chargedWeight: invoice.charged_weight ?? 0,
		declaredValue: invoice.declared_value ?? 0,
		totalAmount: invoice.amount ?? 0,
		paymentMode: invoice.payment_mode ?? "PREPAID",
		freightAmount: invoice.freight_amount ?? 0,
		otherCharges: invoice.other_charge ?? 0,
		gstAmount: (invoice as any).gst_amount ?? 0,
	};

	return (
		<div className="bg-white min-h-screen p-8 flex justify-center text-black">
			<style>{`
        @media print {
          @page { size: auto; margin: 0mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none; }
        }
      `}</style>
			<div className="w-full max-w-[1000px]">
				<div className="no-print mb-4 flex justify-end gap-2">
					<ClientPrintButton
						label="Print Invoice"
						className="bg-blue-600 text-white hover:bg-blue-700"
					/>
				</div>
				<CustomerInvoice invoice={invoiceData} />
			</div>
		</div>
	);
}
