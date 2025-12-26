"use client";

import {
	Calculator,
	FileText,
	Loader2,
	MapPin,
	Phone,
	Plane,
	Plus,
	RefreshCw,
	Ship,
	Truck,
	User,
	Zap,
} from "lucide-react";
import * as React from "react";
import type { UseFormReturn } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { UIInvoice } from "@/features/invoices/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import type { InvoiceFormValues } from "@/lib/validations";

interface Rate {
	id: string;
	origin: string;
	destination: string;
	ratePerKg: number;
	baseFee: number;
	serviceType: string;
}

interface InvoiceDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	canEdit: boolean;
	isCreating: boolean;
	editingInvoice: UIInvoice | null;
	customers: { id: string; name: string }[];
	rates: Rate[];
	form: UseFormReturn<InvoiceFormValues>;
	onSubmit: (values: InvoiceFormValues) => void;
	onQuickCreateCustomer: (
		target: "billing" | "consignor" | "consignee",
	) => Promise<{ id: string; name: string } | null>;
	onNewInvoiceClick: () => void;
	onExportCsv: () => void;
}

function SectionHeader({
	icon: Icon,
	title,
}: {
	icon: React.ElementType;
	title: string;
}) {
	return (
		<div className="flex items-center gap-2 mb-4">
			<div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
				<Icon className="w-4 h-4 text-primary" />
			</div>
			<h3 className="text-sm font-semibold text-foreground">{title}</h3>
		</div>
	);
}

function AddNewButton({
	onClick,
	disabled,
}: {
	onClick: () => void;
	disabled?: boolean;
}) {
	return (
		<button
			type="button"
			className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
			disabled={disabled}
			onClick={onClick}
		>
			<Plus className="w-3 h-3" />
			Add new
		</button>
	);
}

export function InvoiceDialogEnhanced({
	open,
	onOpenChange,
	canEdit,
	isCreating,
	editingInvoice,
	customers,
	rates,
	form,
	onSubmit,
	onQuickCreateCustomer,
	onNewInvoiceClick,
	onExportCsv,
}: InvoiceDialogProps) {
	const { toast } = useToast();
	const newInvoiceButtonRef = React.useRef<HTMLButtonElement | null>(null);
	const [rateLookupStatus, setRateLookupStatus] = React.useState<
		"idle" | "found" | "not_found"
	>("idle");
	const [matchedRate, setMatchedRate] = React.useState<Rate | null>(null);

	// Determine if we're in "create new" mode vs "edit existing" mode
	const isCreateMode = editingInvoice === null;

	// STRICT AUTO MODE: No manual entry allowed
	const _refMode = "auto";
	const [_previewRef, setPreviewRef] = React.useState<string>("");

	React.useEffect(() => {
		// Only run when dialog is open
		if (!open) return;

		if (isCreateMode) {
			// In strict auto mode, we just fetch the preview.
			// Ideally, the backend assigns it on save, but we show the "next" one for UX.
			supabase
				.rpc("preview_next_invoice_awb") // Use new function
				.then(({ data, error }) => {
					if (error) {
						console.error("Failed to fetch invoice ref:", error);
						// Don't set a hard error value, just let it be "Auto-generated"
						return;
					}
					if (data) {
						setPreviewRef(data);
						// Display only, don't necessarily set form value if we want backend to be authority,
						// but setting it helps UI.
						// form.setValue("invoiceRef", data);
					}
				});
		}
	}, [open, isCreateMode]);

	// Barcode Scanner removed (was used for manual entry)

	const origin = form.watch("origin");
	const destination = form.watch("destination");
	const transportMode = form.watch("transportMode");
	const chargedWeight = form.watch("chargedWeight");
	const rateValue = form.watch("rate");

	// Auto-lookup rate when origin, destination, or transport mode changes
	React.useEffect(() => {
		if (!origin || !destination) {
			setRateLookupStatus("idle");
			setMatchedRate(null);
			return;
		}

		// Find matching rate based on origin, destination, and transport mode
		const normalizedOrigin = origin.toLowerCase().trim();
		const normalizedDestination = destination.toLowerCase().trim();
		const mode = transportMode || "surface"; // default to surface

		// Helper function for fuzzy city matching
		const citiesMatch = (input: string, rateCity: string): boolean => {
			const inputWords = input.split(/[\s,.-]+/).filter((w) => w.length > 1);
			const rateCityLower = rateCity.toLowerCase().trim();
			const rateCityWords = rateCityLower
				.split(/[\s,.-]+/)
				.filter((w) => w.length > 1);

			// Direct inclusion check
			if (rateCityLower.includes(input) || input.includes(rateCityLower))
				return true;

			// Word-based matching (e.g., "New Delhi" matches "Delhi")
			for (const word of inputWords) {
				if (
					rateCityLower.includes(word) ||
					rateCityWords.some((rw) => rw.includes(word) || word.includes(rw))
				) {
					return true;
				}
			}
			return false;
		};

		const modeMatches = (serviceType: string) => {
			if (mode === "air") return serviceType === "air";
			if (mode === "express") return serviceType === "express";
			return serviceType === "surface" || serviceType === "standard";
		};

		const laneDirectMatches = (rOrigin: string, rDest: string) =>
			citiesMatch(normalizedOrigin, rOrigin) &&
			citiesMatch(normalizedDestination, rDest);

		const laneReverseMatches = (rOrigin: string, rDest: string) =>
			citiesMatch(normalizedOrigin, rDest) &&
			citiesMatch(normalizedDestination, rOrigin);

		// Prefer direct match first (origin → destination), then reverse (destination → origin)
		const foundDirect = rates.find((r) => {
			const rOrigin = r.origin.toLowerCase().trim();
			const rDest = r.destination.toLowerCase().trim();
			const rService = r.serviceType?.toLowerCase() || "standard";
			return laneDirectMatches(rOrigin, rDest) && modeMatches(rService);
		});

		const foundReverse = !foundDirect
			? rates.find((r) => {
					const rOrigin = r.origin.toLowerCase().trim();
					const rDest = r.destination.toLowerCase().trim();
					const rService = r.serviceType?.toLowerCase() || "standard";
					return laneReverseMatches(rOrigin, rDest) && modeMatches(rService);
				})
			: null;

		// If no match with mode, try without mode restriction (still prefer direct)
		const foundFallbackDirect =
			!foundDirect && !foundReverse
				? rates.find((r) => {
						const rOrigin = r.origin.toLowerCase().trim();
						const rDest = r.destination.toLowerCase().trim();
						return laneDirectMatches(rOrigin, rDest);
					})
				: null;

		const foundFallbackReverse =
			!foundDirect && !foundReverse && !foundFallbackDirect
				? rates.find((r) => {
						const rOrigin = r.origin.toLowerCase().trim();
						const rDest = r.destination.toLowerCase().trim();
						return laneReverseMatches(rOrigin, rDest);
					})
				: null;

		const matchedRateResult =
			foundDirect ||
			foundReverse ||
			foundFallbackDirect ||
			foundFallbackReverse;

		if (matchedRateResult) {
			setMatchedRate(matchedRateResult);
			setRateLookupStatus("found");
			// Auto-fill rate per kg
			form.setValue("rate", matchedRateResult.ratePerKg, { shouldDirty: true });
		} else {
			setMatchedRate(null);
			setRateLookupStatus("not_found");
		}
	}, [origin, destination, transportMode, rates, form]);

	// Auto-calculate freight when weight or rate changes
	React.useEffect(() => {
		const rate = rateValue || 0;
		const weight = chargedWeight || 0;

		if (rate > 0 && weight > 0) {
			const baseFee = matchedRate?.baseFee || 0;
			const freight = Math.round(weight * rate + baseFee);
			form.setValue("freightAmount", freight, { shouldDirty: true });
		}
	}, [chargedWeight, rateValue, matchedRate, form]);

	// Watch form values for auto-calculation
	const watchedValues = form.watch([
		"freightAmount",
		"pickupCharge",
		"packingCharge",
		"docketCharge",
		"deliveryCharge",
		"insuranceCharge",
		"gstPercent",
		"otherCharge",
		"advancePaid",
	]);

	// Auto-calculate totals (matching Tapan Associate invoice format)
	const calculatedTotals = React.useMemo(() => {
		const freight = Number(watchedValues[0]) || 0;
		const pickup = Number(watchedValues[1]) || 0;
		const packing = Number(watchedValues[2]) || 0;
		const docket = Number(watchedValues[3]) || 0;
		const delivery = Number(watchedValues[4]) || 0;
		const insurance = Number(watchedValues[5]) || 0;
		const gstPercent = Number(watchedValues[6]) || 0;
		const other = Number(watchedValues[7]) || 0;
		const advance = Number(watchedValues[8]) || 0;

		const subtotal =
			freight + pickup + packing + docket + delivery + insurance + other;
		const gstAmount = (subtotal * gstPercent) / 100;
		const total = subtotal + gstAmount;
		const balanceDue = Math.max(total - advance, 0);

		// Update GST amount in form
		if (gstAmount !== form.getValues("gstAmount")) {
			form.setValue("gstAmount", gstAmount, { shouldDirty: false });
		}
		// Update total amount in form
		if (total !== form.getValues("amount")) {
			form.setValue("amount", total, { shouldDirty: false });
		}
		// Update balance due in form
		if (balanceDue !== form.getValues("balanceDue")) {
			form.setValue("balanceDue", balanceDue, { shouldDirty: false });
		}

		return {
			freight,
			pickup,
			packing,
			docket,
			delivery,
			insurance,
			gstPercent,
			gstAmount,
			other,
			subtotal,
			total,
			advance,
			balanceDue,
		};
	}, [watchedValues, form]);

	const onInvalid = React.useCallback(
		(errors: Record<string, any>) => {
			// Find the first field name (depth-first)
			const findFirstFieldName = (
				obj: any,
				path: string[] = [],
			): string | null => {
				if (!obj || typeof obj !== "object") return null;
				for (const key of Object.keys(obj)) {
					const val = obj[key];
					if (val && typeof val === "object") {
						// react-hook-form field error typically has { message, type, ref }
						if (typeof val.message === "string")
							return [...path, key].join(".");
						const nested = findFirstFieldName(val, [...path, key]);
						if (nested) return nested;
					}
				}
				return null;
			};

			const firstName =
				findFirstFieldName(errors) || Object.keys(errors ?? {})[0] || null;

			if (firstName) {
				const escape = (name: string) => {
					const css = (globalThis as any).CSS;
					if (css && typeof css.escape === "function") return css.escape(name);
					return name.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
				};

				const selector = `[name="${escape(firstName)}"]`;
				const el = document.querySelector(selector) as HTMLElement | null;
				if (el) {
					el.scrollIntoView({ behavior: "smooth", block: "center" });
					(el as any).focus?.();
				}
			}

			toast({
				title: "Please check required fields",
				description:
					"Some required fields are missing or invalid. Scroll to the highlighted field and try again.",
				variant: "destructive",
			});
		},
		[toast],
	);

	return (
		<>
			{/* Action Buttons - Outside Dialog */}
			<div className="flex items-center gap-2">
				<Button
					type="button"
					className="bg-primary hover:bg-primary/90 gap-2"
					disabled={!canEdit}
					ref={newInvoiceButtonRef}
					onClick={onNewInvoiceClick}
				>
					<Plus className="w-4 h-4" />
					New Invoice
				</Button>
				<Button type="button" variant="outline" onClick={onExportCsv}>
					Export CSV
				</Button>
			</div>

			<Dialog
				open={open}
				onOpenChange={(nextOpen) => {
					if (!nextOpen) {
						(document.activeElement as HTMLElement | null)?.blur?.();
					}
					onOpenChange(nextOpen);
				}}
			>
				<DialogContent
					className="w-[96vw] max-w-7xl sm:max-w-7xl max-h-[90vh] p-0 gap-0 overflow-hidden"
					onCloseAutoFocus={(e) => {
						if (newInvoiceButtonRef.current) {
							e.preventDefault();
							newInvoiceButtonRef.current.focus();
						}
					}}
				>
					<DialogHeader className="px-6 py-4 border-b bg-muted/30">
						<DialogTitle className="flex items-center gap-2 text-lg">
							<FileText className="w-5 h-5 text-primary" />
							{editingInvoice ? "Edit Invoice" : "Create New Invoice"}
						</DialogTitle>
						<DialogDescription>
							{editingInvoice
								? "Update the invoice details below. Changes will be saved immediately."
								: "Fill in the invoice details. The total will be calculated automatically."}
						</DialogDescription>
					</DialogHeader>

					<ScrollArea className="max-h-[calc(90vh-200px)]">
						<Form {...form}>
							<form
								className="p-6 space-y-6"
								onSubmit={form.handleSubmit(onSubmit, onInvalid)}
								id="invoice-form"
							>
								{/* Header Section - Consignment Details */}
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
									<div className="col-span-1 md:col-span-1">
										<FormLabel className="text-xs font-medium mb-1.5 block">
											Consignment No. (Auto)
										</FormLabel>
										<div className="flex gap-2">
											<div className="flex-1">
												<FormField
													control={form.control}
													name="invoiceRef"
													render={({ field }) => (
														<FormItem>
															<FormControl>
																<div className="relative">
																	<Input
																		placeholder="Auto-generated"
																		readOnly={true}
																		className="h-9 font-mono bg-muted/40 text-muted-foreground"
																		{...field}
																		value={field.value || "Auto-generated"}
																	/>
																</div>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>
										</div>
									</div>

									<FormField
										control={form.control}
										name="dateOfBooking"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-xs font-medium">
													Date of Booking
												</FormLabel>
												<FormControl>
													<Input type="date" className="h-9" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="natureOfQuantity"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-xs font-medium">
													Nature of Quantity
												</FormLabel>
												<FormControl>
													<Select
														value={field.value || ""}
														onValueChange={field.onChange}
													>
														<SelectTrigger className="h-9">
															<SelectValue placeholder="Select..." />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="documents">
																Documents
															</SelectItem>
															<SelectItem value="parcel">Parcel</SelectItem>
															<SelectItem value="others">Others</SelectItem>
															<SelectItem value="fragile">Fragile</SelectItem>
															<SelectItem value="electronics">
																Electronics
															</SelectItem>
														</SelectContent>
													</Select>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="declaredValue"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-xs font-medium">
													Declared Value
												</FormLabel>
												<FormControl>
													<Input
														placeholder="e.g. USED, ₹5000"
														className="h-9"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<Separator />

								{/* CONSIGNOR Section */}
								<div>
									<SectionHeader icon={User} title="Consignor (Shipper)" />
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-3">
											<FormField
												control={form.control}
												name="consignorId"
												render={({ field }) => (
													<FormItem>
														<div className="flex items-center justify-between">
															<FormLabel className="text-xs font-medium">
																Select Existing
															</FormLabel>
															<AddNewButton
																disabled={!canEdit}
																onClick={async () => {
																	const created =
																		await onQuickCreateCustomer("consignor");
																	if (created) {
																		form.setValue("consignorId", created.id, {
																			shouldDirty: true,
																		});
																		form.setValue(
																			"consignorName",
																			created.name,
																			{ shouldDirty: true },
																		);
																	}
																}}
															/>
														</div>
														<FormControl>
															<Select
																value={field.value || ""}
																onValueChange={(val) => {
																	field.onChange(val);
																	const customer = customers.find(
																		(c) => c.id === val,
																	);
																	if (customer) {
																		form.setValue(
																			"consignorName",
																			customer.name,
																			{ shouldDirty: true },
																		);
																	}
																}}
															>
																<SelectTrigger className="h-9">
																	<SelectValue placeholder="Select consignor..." />
																</SelectTrigger>
																<SelectContent>
																	{customers.map((c) => (
																		<SelectItem key={c.id} value={c.id}>
																			{c.name}
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name="consignorName"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-xs font-medium flex items-center gap-1">
															<User className="h-3 w-3" /> Name
														</FormLabel>
														<FormControl>
															<Input
																placeholder="MR JOHNSON"
																className="h-9"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
										<div className="space-y-3">
											<FormField
												control={form.control}
												name="consignorAddress"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-xs font-medium flex items-center gap-1">
															<MapPin className="h-3 w-3" /> Address
														</FormLabel>
														<FormControl>
															<Input
																placeholder="SAFDARJUNG NEW DELHI - 110029"
																className="h-9"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name="consignorPhone"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-xs font-medium flex items-center gap-1">
															<Phone className="h-3 w-3" /> Phone
														</FormLabel>
														<FormControl>
															<Input
																placeholder="9873530487"
																className="h-9"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
									</div>
								</div>

								<Separator />

								{/* CONSIGNEE Section */}
								<div>
									<SectionHeader icon={User} title="Consignee (Receiver)" />
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-3">
											<FormField
												control={form.control}
												name="consigneeId"
												render={({ field }) => (
													<FormItem>
														<div className="flex items-center justify-between">
															<FormLabel className="text-xs font-medium">
																Select Existing
															</FormLabel>
															<AddNewButton
																disabled={!canEdit}
																onClick={async () => {
																	const created =
																		await onQuickCreateCustomer("consignee");
																	if (created) {
																		form.setValue("consigneeId", created.id, {
																			shouldDirty: true,
																		});
																		form.setValue(
																			"consigneeName",
																			created.name,
																			{ shouldDirty: true },
																		);
																	}
																}}
															/>
														</div>
														<FormControl>
															<Select
																value={field.value || ""}
																onValueChange={(val) => {
																	field.onChange(val);
																	const customer = customers.find(
																		(c) => c.id === val,
																	);
																	if (customer) {
																		form.setValue(
																			"consigneeName",
																			customer.name,
																			{ shouldDirty: true },
																		);
																	}
																}}
															>
																<SelectTrigger className="h-9">
																	<SelectValue placeholder="Select consignee..." />
																</SelectTrigger>
																<SelectContent>
																	{customers.map((c) => (
																		<SelectItem key={c.id} value={c.id}>
																			{c.name}
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name="consigneeName"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-xs font-medium flex items-center gap-1">
															<User className="h-3 w-3" /> Name
														</FormLabel>
														<FormControl>
															<Input
																placeholder="MISS DIANA"
																className="h-9"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
										<div className="space-y-3">
											<FormField
												control={form.control}
												name="consigneeAddress"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-xs font-medium flex items-center gap-1">
															<MapPin className="h-3 w-3" /> Address
														</FormLabel>
														<FormControl>
															<Input
																placeholder="SINGJAMEI IMF - 795001"
																className="h-9"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name="consigneePhone"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-xs font-medium flex items-center gap-1">
															<Phone className="h-3 w-3" /> Phone
														</FormLabel>
														<FormControl>
															<Input
																placeholder="9863428811"
																className="h-9"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
									</div>
								</div>

								<Separator />

								{/* Billing Customer - Hidden but required */}
								<FormField
									control={form.control}
									name="customerId"
									render={({ field }) => (
										<FormItem>
											<div className="flex items-center justify-between">
												<FormLabel className="text-xs font-medium">
													Billing Customer
												</FormLabel>
												<AddNewButton
													disabled={!canEdit}
													onClick={async () => {
														const created =
															await onQuickCreateCustomer("billing");
														if (created) {
															form.setValue("customerId", created.id, {
																shouldDirty: true,
															});
														}
													}}
												/>
											</div>
											<FormControl>
												<Select
													value={field.value || ""}
													onValueChange={(val) => field.onChange(val)}
												>
													<SelectTrigger className="h-9" name={field.name}>
														<SelectValue placeholder="Select customer..." />
													</SelectTrigger>
													<SelectContent>
														{customers.map((c) => (
															<SelectItem key={c.id} value={c.id}>
																{c.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Separator />

								{/* Courier Details & Rate */}
								<div>
									<div className="flex items-center justify-between mb-4">
										<div className="flex items-center gap-2">
											<div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
												<Truck className="w-4 h-4 text-primary" />
											</div>
											<h3 className="text-sm font-semibold text-foreground">
												Courier Details & Rate
											</h3>
										</div>
										{/* Rate Lookup Status */}
										{rateLookupStatus === "found" && matchedRate && (
											<Badge
												variant="default"
												className="bg-green-500/10 text-green-600 border-green-200 gap-1"
											>
												<Zap className="w-3 h-3" />
												Rate found: ₹{matchedRate.ratePerKg}/kg + ₹
												{matchedRate.baseFee} base
											</Badge>
										)}
										{rateLookupStatus === "not_found" &&
											origin &&
											destination && (
												<Badge
													variant="outline"
													className="text-amber-600 border-amber-200 gap-1"
												>
													<RefreshCw className="w-3 h-3" />
													No rate found - enter manually
												</Badge>
											)}
									</div>

									{/* Transport Mode Toggle */}
									<div className="mb-4">
										<FormField
											control={form.control}
											name="transportMode"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-xs font-medium mb-2 block">
														Transport Mode
													</FormLabel>
													<div className="flex gap-2">
														<Button
															type="button"
															variant={
																field.value === "air" ? "default" : "outline"
															}
															size="sm"
															className={cn(
																"flex-1 gap-2 h-10",
																field.value === "air" &&
																	"bg-blue-600 hover:bg-blue-700",
															)}
															onClick={() => field.onChange("air")}
														>
															<Plane className="w-4 h-4" />
															Air Cargo
														</Button>
														<Button
															type="button"
															variant={
																field.value === "express"
																	? "default"
																	: "outline"
															}
															size="sm"
															className={cn(
																"flex-1 gap-2 h-10",
																field.value === "express" &&
																	"bg-amber-600 hover:bg-amber-700",
															)}
															onClick={() => field.onChange("express")}
														>
															<Zap className="w-4 h-4" />
															Express
														</Button>
														<Button
															type="button"
															variant={
																field.value === "surface"
																	? "default"
																	: "outline"
															}
															size="sm"
															className={cn(
																"flex-1 gap-2 h-10",
																field.value === "surface" &&
																	"bg-emerald-600 hover:bg-emerald-700",
															)}
															onClick={() => field.onChange("surface")}
														>
															<Ship className="w-4 h-4" />
															Surface
														</Button>
													</div>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
										<FormField
											control={form.control}
											name="origin"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-xs font-medium">
														Origin
													</FormLabel>
													<FormControl>
														<Input
															placeholder="Delhi"
															className="h-9"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="destination"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-xs font-medium">
														Destination
													</FormLabel>
													<FormControl>
														<Input
															placeholder="Manipur"
															className="h-9"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="pieces"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-xs font-medium">
														No. of Pieces
													</FormLabel>
													<FormControl>
														<Input
															type="number"
															min="1"
															placeholder="1"
															className="h-9"
															value={field.value ?? ""}
															onChange={(e) =>
																field.onChange(
																	e.target.value
																		? Number(e.target.value)
																		: undefined,
																)
															}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="actualWeight"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-xs font-medium">
														Actual Weight (Kg)
													</FormLabel>
													<FormControl>
														<Input
															type="number"
															min="0"
															step="0.1"
															placeholder="1"
															className="h-9"
															value={field.value ?? ""}
															onChange={(e) =>
																field.onChange(
																	e.target.value
																		? Number(e.target.value)
																		: undefined,
																)
															}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="chargedWeight"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-xs font-medium">
														Charged Weight (Kg)
													</FormLabel>
													<FormControl>
														<Input
															type="number"
															min="0"
															step="0.1"
															placeholder="1"
															className="h-9"
															value={field.value ?? ""}
															onChange={(e) =>
																field.onChange(
																	e.target.value
																		? Number(e.target.value)
																		: undefined,
																)
															}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="rate"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-xs font-medium">
														Rate (₹)
													</FormLabel>
													<FormControl>
														<Input
															type="number"
															min="0"
															placeholder="180"
															className="h-9"
															value={field.value ?? ""}
															onChange={(e) =>
																field.onChange(
																	e.target.value
																		? Number(e.target.value)
																		: undefined,
																)
															}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="paymentMode"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-xs font-medium">
														Payment Mode
													</FormLabel>
													<FormControl>
														<Select
															value={field.value ?? ""}
															onValueChange={(val) =>
																field.onChange(val || undefined)
															}
														>
															<SelectTrigger className="h-9">
																<SelectValue placeholder="Select..." />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="to_pay">To Pay</SelectItem>
																<SelectItem value="paid">Paid</SelectItem>
																<SelectItem value="cash">Cash</SelectItem>
																<SelectItem value="upi">UPI</SelectItem>
																<SelectItem value="bank_transfer">
																	Bank Transfer
																</SelectItem>
																<SelectItem value="cheque">Cheque</SelectItem>
																<SelectItem value="on_account">
																	On Account
																</SelectItem>
															</SelectContent>
														</Select>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="remarks"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-xs font-medium">
														Remarks
													</FormLabel>
													<FormControl>
														<Input
															placeholder="DUE"
															className="h-9"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</div>

								<Separator />

								{/* Payment Details Section - Matching Tapan Associate format */}
								<div>
									<SectionHeader icon={Calculator} title="Payment Details" />
									<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
										{/* Left Column - Charge Inputs */}
										<div className="grid grid-cols-2 gap-3">
											<FormField
												control={form.control}
												name="freightAmount"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-xs font-medium">
															Freight (₹)
														</FormLabel>
														<FormControl>
															<Input
																type="number"
																min="0"
																placeholder="180"
																className="h-9"
																value={field.value ?? ""}
																onChange={(e) =>
																	field.onChange(
																		e.target.value
																			? Number(e.target.value)
																			: undefined,
																	)
																}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="pickupCharge"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-xs font-medium">
															Pickup Charge (₹)
														</FormLabel>
														<FormControl>
															<Input
																type="number"
																min="0"
																placeholder="100"
																className="h-9"
																value={field.value ?? ""}
																onChange={(e) =>
																	field.onChange(
																		e.target.value
																			? Number(e.target.value)
																			: undefined,
																	)
																}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="packingCharge"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-xs font-medium">
															Packing (₹)
														</FormLabel>
														<FormControl>
															<Input
																type="number"
																min="0"
																placeholder="50"
																className="h-9"
																value={field.value ?? ""}
																onChange={(e) =>
																	field.onChange(
																		e.target.value
																			? Number(e.target.value)
																			: undefined,
																	)
																}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="docketCharge"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-xs font-medium">
															Docket Charges (₹)
														</FormLabel>
														<FormControl>
															<Input
																type="number"
																min="0"
																placeholder="80"
																className="h-9"
																value={field.value ?? ""}
																onChange={(e) =>
																	field.onChange(
																		e.target.value
																			? Number(e.target.value)
																			: undefined,
																	)
																}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="deliveryCharge"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-xs font-medium">
															Delivery (₹)
														</FormLabel>
														<FormControl>
															<Input
																type="number"
																min="0"
																placeholder="0"
																className="h-9"
																value={field.value ?? ""}
																onChange={(e) =>
																	field.onChange(
																		e.target.value
																			? Number(e.target.value)
																			: undefined,
																	)
																}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="insuranceCharge"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-xs font-medium">
															Insurance Charge (₹)
														</FormLabel>
														<FormControl>
															<Input
																type="number"
																min="0"
																placeholder="0"
																className="h-9"
																value={field.value ?? ""}
																onChange={(e) =>
																	field.onChange(
																		e.target.value
																			? Number(e.target.value)
																			: undefined,
																	)
																}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="gstPercent"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-xs font-medium">
															GST (%)
														</FormLabel>
														<FormControl>
															<Input
																type="number"
																min="0"
																max="28"
																placeholder="0"
																className="h-9"
																value={field.value ?? ""}
																onChange={(e) =>
																	field.onChange(
																		e.target.value
																			? Number(e.target.value)
																			: undefined,
																	)
																}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="otherCharge"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-xs font-medium">
															Other Charges (₹)
														</FormLabel>
														<FormControl>
															<Input
																type="number"
																min="0"
																placeholder="0"
																className="h-9"
																value={field.value ?? ""}
																onChange={(e) =>
																	field.onChange(
																		e.target.value
																			? Number(e.target.value)
																			: undefined,
																	)
																}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="advancePaid"
												render={({ field }) => (
													<FormItem className="col-span-2">
														<FormLabel className="text-xs font-medium text-green-600">
															Advance Paid Amount (₹)
														</FormLabel>
														<FormControl>
															<Input
																type="number"
																min="0"
																placeholder="0"
																className="h-9 border-green-200 focus:border-green-500"
																value={field.value ?? ""}
																onChange={(e) =>
																	field.onChange(
																		e.target.value
																			? Number(e.target.value)
																			: undefined,
																	)
																}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>

										{/* Right Column - Auto-calculated Summary */}
										<div className="bg-muted/50 rounded-lg p-4 space-y-2 lg:sticky lg:top-4 h-fit">
											<h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
												Invoice Summary
											</h4>

											<div className="space-y-1.5 text-sm">
												<div className="flex justify-between">
													<span className="text-muted-foreground">Freight</span>
													<span>
														₹{calculatedTotals.freight.toLocaleString("en-IN")}
													</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">
														Pickup Charge
													</span>
													<span>
														₹{calculatedTotals.pickup.toLocaleString("en-IN")}
													</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">Packing</span>
													<span>
														₹{calculatedTotals.packing.toLocaleString("en-IN")}
													</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">
														Docket Charges
													</span>
													<span>
														₹{calculatedTotals.docket.toLocaleString("en-IN")}
													</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">
														Insurance Charge
													</span>
													<span>
														₹
														{calculatedTotals.insurance.toLocaleString("en-IN")}
													</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">
														GST ({calculatedTotals.gstPercent}%)
													</span>
													<span>
														₹
														{calculatedTotals.gstAmount.toLocaleString("en-IN")}
													</span>
												</div>
												{calculatedTotals.other > 0 && (
													<div className="flex justify-between">
														<span className="text-muted-foreground">Other</span>
														<span>
															₹{calculatedTotals.other.toLocaleString("en-IN")}
														</span>
													</div>
												)}
											</div>

											<Separator className="my-3" />

											<div className="flex justify-between text-base font-semibold">
												<span>Total</span>
												<span>
													₹{calculatedTotals.total.toLocaleString("en-IN")}
												</span>
											</div>

											<div className="flex justify-between text-sm text-green-600">
												<span>Advance Paid Amount</span>
												<span>
													₹{calculatedTotals.advance.toLocaleString("en-IN")}
												</span>
											</div>

											<Separator className="my-3" />

											<div className="flex justify-between items-center">
												<span className="font-bold text-lg">Balance</span>
												<span
													className={cn(
														"font-bold text-xl",
														calculatedTotals.balanceDue > 0
															? "text-orange-600"
															: "text-green-600",
													)}
												>
													₹{calculatedTotals.balanceDue.toLocaleString("en-IN")}
												</span>
											</div>
										</div>
									</div>
								</div>

								<Separator />

								{/* Notes */}
								<FormField
									control={form.control}
									name="notes"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-xs font-medium">
												Notes / Special Instructions
											</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Add any notes or special instructions that will appear on the invoice..."
													className="min-h-[80px] resize-none"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</form>
						</Form>
					</ScrollArea>

					<DialogFooter className="px-6 py-4 border-t bg-muted/30">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button
							type="button"
							onClick={form.handleSubmit(onSubmit, onInvalid)}
							className="min-w-[140px] bg-primary hover:bg-primary/90"
							disabled={isCreating || !canEdit}
						>
							{isCreating ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									{editingInvoice ? "Saving..." : "Creating..."}
								</>
							) : editingInvoice ? (
								"Save Changes"
							) : (
								"Create Invoice"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
