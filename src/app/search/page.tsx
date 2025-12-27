"use client";

import Link from "next/link";
import { useState } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import ProcessorIcon from "@/components/icons/proccesor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface SearchShipment { id: string; shipment_ref: string | null; origin: string; destination: string; status: string; }
interface SearchBarcode { id: string; barcode_number: string | null; shipment_id: string | null; status: string; }
interface SearchInvoice { id: string; invoice_ref: string | null; amount: number; status: string; }
interface SearchCustomer { id: string; name: string | null; email: string | null; phone: string | null; }
interface SearchManifest { id: string; manifest_ref: string | null; origin_hub: string; destination: string; status: string; }

interface SearchResult {
	shipments: SearchShipment[];
	barcodes: SearchBarcode[];
	invoices: SearchInvoice[];
	customers: SearchCustomer[];
	manifests: SearchManifest[];
}

export default function GlobalSearchPage() {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<SearchResult | null>(null);
	const [loading, setLoading] = useState(false);

	const handleSearch = async () => {
		const q = query.trim();
		if (!q) return;
		setLoading(true);
		try {
			const res = await fetch("/api/search", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ q }),
			});
			const json = await res.json();
			setResults(json as SearchResult);
		} catch (error) {
			console.error("Global search failed", error);
			setResults(null);
		} finally {
			setLoading(false);
		}
	};

	const hasResults =
		results &&
		(results.shipments.length ||
			results.barcodes.length ||
			results.invoices.length ||
			results.customers.length ||
			results.manifests.length);

	return (
		<DashboardPageLayout
			header={{
				title: "Global Search",
				description:
					"Quickly find shipments, barcodes, invoices, customers, and manifests",
				icon: ProcessorIcon,
			}}
		>
			<div className="flex flex-col gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Search</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col sm:flex-row gap-3 items-end">
							<div className="flex-1">
								<Input
									placeholder="Search shipments, barcodes, invoices, customers, manifests..."
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									onKeyDown={(e) => e.key === "Enter" && handleSearch()}
									className="bg-input text-foreground"
								/>
							</div>
							<Button onClick={handleSearch} disabled={loading}>
								{loading ? "Searching..." : "Search"}
							</Button>
						</div>
					</CardContent>
				</Card>

				{results && (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Shipments */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									<span>Shipments</span>
									<span className="text-xs text-muted-foreground">
										{results.shipments.length} result(s)
									</span>
								</CardTitle>
							</CardHeader>
							<CardContent>
								{results.shipments.length ? (
									<ul className="space-y-2 text-sm">
										{results.shipments.map((s) => (
											<li key={s.id}>
												<Link
													href={`/shipments?q=${encodeURIComponent(
														(s.shipment_ref as string | null) ?? s.id,
													)}`}
													className="p-2 rounded border border-border flex justify-between items-center hover:bg-accent/40 outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 block w-full"
												>
													<div>
														<div className="font-mono text-xs">
															{s.shipment_ref}
														</div>
														<div className="text-xs text-muted-foreground">
															{s.origin} → {s.destination}
														</div>
													</div>
													<Badge className="text-xs px-2 py-0.5">
														{s.status?.toString().toUpperCase() ?? "UNKNOWN"}
													</Badge>
												</Link>
											</li>
										))}
									</ul>
								) : (
									<p className="text-xs text-muted-foreground">
										No shipments found.
									</p>
								)}
							</CardContent>
						</Card>

						{/* Barcodes */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									<span>Barcodes</span>
									<span className="text-xs text-muted-foreground">
										{results.barcodes.length} result(s)
									</span>
								</CardTitle>
							</CardHeader>
							<CardContent>
								{results.barcodes.length ? (
									<ul className="space-y-2 text-sm">
										{results.barcodes.map((b) => (
											<li key={b.id}>
												<Link
													href={`/barcodes?q=${encodeURIComponent(
														(b.barcode_number as string | null) ?? b.id,
													)}`}
													className="p-2 rounded border border-border flex justify-between items-center hover:bg-accent/40 outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 block w-full"
												>
													<div>
														<div className="font-mono text-xs">
															{b.barcode_number}
														</div>
														<div className="text-xs text-muted-foreground">
															Shipment: {b.shipment_id ?? "N/A"}
														</div>
													</div>
													<Badge className="text-xs px-2 py-0.5">
														{b.status?.toString().toUpperCase() ?? "UNKNOWN"}
													</Badge>
												</Link>
											</li>
										))}
									</ul>
								) : (
									<p className="text-xs text-muted-foreground">
										No barcodes found.
									</p>
								)}
							</CardContent>
						</Card>

						{/* Invoices */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									<span>Invoices</span>
									<span className="text-xs text-muted-foreground">
										{results.invoices.length} result(s)
									</span>
								</CardTitle>
							</CardHeader>
							<CardContent>
								{results.invoices.length ? (
									<ul className="space-y-2 text-sm">
										{results.invoices.map((inv) => (
											<li key={inv.id}>
												<Link
													href={`/invoices?q=${encodeURIComponent(
														(inv.invoice_ref as string | null) ?? inv.id,
													)}`}
													className="p-2 rounded border border-border flex justify-between items-center hover:bg-accent/40 outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 block w-full"
												>
													<div>
														<div className="font-mono text-xs">
															{inv.invoice_ref ?? inv.id}
														</div>
														<div className="text-xs text-muted-foreground">
															Amount: ₹{Number(inv.amount ?? 0).toLocaleString()}
														</div>
													</div>
													<Badge className="text-xs px-2 py-0.5">
														{inv.status?.toString().toUpperCase() ?? "UNKNOWN"}
													</Badge>
												</Link>
											</li>
										))}
									</ul>
								) : (
									<p className="text-xs text-muted-foreground">
										No invoices found.
									</p>
								)}
							</CardContent>
						</Card>

						{/* Customers */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									<span>Customers</span>
									<span className="text-xs text-muted-foreground">
										{results.customers.length} result(s)
									</span>
								</CardTitle>
							</CardHeader>
							<CardContent>
								{results.customers.length ? (
									<ul className="space-y-2 text-sm">
										{results.customers.map((c) => (
											<li key={c.id}>
												<Link
													href={`/customers?q=${encodeURIComponent(
														((c.name as string | null) ?? c.email ?? "") as string,
													)}`}
													className="p-2 rounded border border-border flex justify-between items-center hover:bg-accent/40 outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 block w-full"
												>
													<div>
														<div className="text-xs font-semibold">{c.name}</div>
														<div className="text-xs text-muted-foreground">
															{c.email} · {c.phone}
														</div>
													</div>
												</Link>
											</li>
										))}
									</ul>
								) : (
									<p className="text-xs text-muted-foreground">
										No customers found.
									</p>
								)}
							</CardContent>
						</Card>

						{/* Manifests */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									<span>Manifests</span>
									<span className="text-xs text-muted-foreground">
										{results.manifests.length} result(s)
									</span>
								</CardTitle>
							</CardHeader>
							<CardContent>
								{results.manifests.length ? (
									<ul className="space-y-2 text-sm">
										{results.manifests.map((m) => (
											<li key={m.id}>
												<Link
													href={`/aircargo?q=${encodeURIComponent(
														(m.manifest_ref as string | null) ?? m.id,
													)}`}
													className="p-2 rounded border border-border flex justify-between items-center hover:bg-accent/40 outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 block w-full"
												>
													<div>
														<div className="font-mono text-xs">
															{m.manifest_ref ?? m.id}
														</div>
														<div className="text-xs text-muted-foreground">
															{m.origin_hub} → {m.destination}
														</div>
													</div>
													<Badge className="text-xs px-2 py-0.5">
														{m.status?.toString().toUpperCase() ?? "UNKNOWN"}
													</Badge>
												</Link>
											</li>
										))}
									</ul>
								) : (
									<p className="text-xs text-muted-foreground">
										No manifests found.
									</p>
								)}
							</CardContent>
						</Card>
					</div>
				)}

				{results && !hasResults && !loading && (
					<Card>
						<CardContent className="py-8 text-center text-sm text-muted-foreground">
							No results found.
						</CardContent>
					</Card>
				)}
			</div>
		</DashboardPageLayout>
	);
}
