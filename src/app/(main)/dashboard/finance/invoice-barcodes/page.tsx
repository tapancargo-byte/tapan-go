"use client";

import { format } from "date-fns";
import { Printer } from "lucide-react";
import { useEffect, useState } from "react";
import InvoiceBarcode from "@/components/invoices/invoice-barcode";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { supabase } from "@/lib/supabaseClient";

interface InvoiceBarcodeData {
	id: string;
	invoice_ref: string;
	amount: number;
	created_at: string;
	customer_name: string;
	origin?: string; // Derived from first linked shipment
}

export default function InvoiceBarcodesPage() {
	const [invoices, setInvoices] = useState<InvoiceBarcodeData[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState("");

	useEffect(() => {
		fetchInvoices();
	}, [fetchInvoices]);

	const fetchInvoices = async () => {
		try {
			setLoading(true);
			// Fetch invoices with customer and linked shipments (via invoice_items)
			const { data, error } = await supabase
				.from("invoices")
				.select(`
          id,
          invoice_ref,
          amount,
          created_at,
          customers ( name ),
          invoice_items (
            shipments ( origin )
          )
        `)
				.order("created_at", { ascending: false })
				.limit(50);

			if (error) throw error;

			const mapped: InvoiceBarcodeData[] = (data || []).map((inv: any) => {
				// Find first origin from linked shipments
				const origin =
					inv.invoice_items?.[0]?.shipments?.origin || "Head Office";
				return {
					id: inv.id,
					invoice_ref: inv.invoice_ref,
					amount: inv.amount,
					created_at: inv.created_at,
					customer_name: inv.customers?.name || "Unknown",
					origin,
				};
			});

			setInvoices(mapped);
		} catch (err) {
			console.error("Error fetching invoice barcodes:", err);
		} finally {
			setLoading(false);
		}
	};

	const filtered = invoices.filter(
		(i) =>
			i.invoice_ref.toLowerCase().includes(filter.toLowerCase()) ||
			i.customer_name.toLowerCase().includes(filter.toLowerCase()),
	);

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between no-print">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						Invoice Barcodes
					</h1>
					<p className="text-muted-foreground">
						Registry of generated barcodes for invoice tracking and manifest
						creation.
					</p>
				</div>
				<Button variant="outline" onClick={() => window.print()}>
					<Printer className="w-4 h-4 mr-2" />
					Print Registry
				</Button>
			</div>

			<div className="flex items-center space-x-2 max-w-sm no-print">
				<Input
					placeholder="Filter by invoice ref or customer..."
					value={filter}
					onChange={(e) => setFilter(e.target.value)}
				/>
			</div>

			<Card>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[300px]">Barcode</TableHead>
							<TableHead>Invoice Details</TableHead>
							<TableHead>Origin / Location</TableHead>
							<TableHead className="text-right">Amount</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={4} className="h-24 text-center">
									Loading barcodes...
								</TableCell>
							</TableRow>
						) : filtered.length === 0 ? (
							<TableRow>
								<TableCell colSpan={4} className="h-24 text-center">
									No invoices found.
								</TableCell>
							</TableRow>
						) : (
							filtered.map((inv) => (
								<TableRow key={inv.id}>
									<TableCell>
										<div className="py-2">
											<InvoiceBarcode value={inv.invoice_ref} />
										</div>
									</TableCell>
									<TableCell>
										<div className="font-medium">{inv.invoice_ref}</div>
										<div className="text-sm text-muted-foreground">
											{inv.customer_name}
										</div>
										<div className="text-xs text-muted-foreground">
											{format(new Date(inv.created_at), "dd MMM yyyy")}
										</div>
									</TableCell>
									<TableCell>{inv.origin}</TableCell>
									<TableCell className="text-right font-mono">
										{new Intl.NumberFormat("en-IN", {
											style: "currency",
											currency: "INR",
										}).format(inv.amount)}
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</Card>

			<style jsx global>{`
        @media print {
          .no-print {
            display: none;
          }
          body {
            background: white;
            color: black;
          }
          .card {
            box-shadow: none;
            border: none;
          }
        }
      `}</style>
		</div>
	);
}
