"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
	AlertCircle,
	ArrowRight,
	Calculator,
	Calendar as CalendarIcon,
	Check,
	CheckCircle2,
	ChevronRight,
	Clock,
	FileText,
	Info,
	Loader2,
	MapPin,
	Package,
	Phone,
	Plane,
	Plus,
	RefreshCw,
	Save,
	Ship,
	Truck,
	User,
	Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	ScrollArea,
	ScrollBar,
} from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import type { Customer, Invoice, ShipmentRate } from "@/types/database";

const invoiceFormSchema = z.object({
	invoiceDate: z.date({
		required_error: "Invoice date is required",
	}),
	shipperName: z.string().min(2, "Shipper name is required"),
	shipperAddress: z.string().min(5, "Shipper address is required"),
	shipperPhone: z.string().min(10, "Valid phone number required"),
	consigneeName: z.string().min(2, "Consignee name is required"),
	consigneeAddress: z.string().min(5, "Consignee address is required"),
	consigneePhone: z.string().min(10, "Valid phone number required"),
	customerId: z.string().optional(),
	origin: z.string().min(2, "Origin is required"),
	destination: z.string().min(2, "Destination is required"),
	pieces: z.number().min(1, "Pieces must be at least 1"),
	actualWeight: z.number().min(0.1, "Weight must be at least 0.1"),
	chargedWeight: z.number().min(0.1, "Weight must be at least 0.1"),
	rate: z.number().min(0, "Rate must be 0 or more"),
	transportMode: z.enum(["air", "surface", "express", "train"]).default("air"),
	paymentMode: z.string().optional(),
	freightAmount: z.number().min(0).default(0),
	pickupCharge: z.number().min(0).default(0),
	packingCharge: z.number().min(0).default(0),
	docketCharge: z.number().min(0).default(0),
	deliveryCharge: z.number().min(0).default(0),
	insuranceCharge: z.number().min(0).default(0),
	gstPercent: z.number().min(0).max(100).default(0),
	otherCharge: z.number().min(0).default(0),
	advancePaid: z.number().min(0).default(0),
	notes: z.string().optional(),
	remarks: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

interface InvoiceDialogEnhancedProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	editingInvoice?: Invoice | null;
	customers: Customer[];
	onSave?: (data: any) => Promise<void>;
	rates?: ShipmentRate[];
	onQuickCreateCustomer: (type: "shipper" | "consignee" | "billing") => Promise<Customer | null>;
}

export function InvoiceDialogEnhanced({
	isOpen,
	onOpenChange,
	editingInvoice,
	customers,
	onSave,
	rates = [],
	onQuickCreateCustomer,
}: InvoiceDialogEnhancedProps) {
	const [isCreating, setIsCreating] = useState(false);
	const [rateLookupStatus, setRateLookupStatus] = useState<"idle" | "searching" | "found" | "not_found">("idle");
	const [matchedRate, setMatchedRate] = useState<ShipmentRate | null>(null);

	const form = useForm<InvoiceFormValues>({
		resolver: zodResolver(invoiceFormSchema),
		defaultValues: {
			invoiceDate: new Date(),
			shipperName: "",
			shipperAddress: "",
			shipperPhone: "",
			consigneeName: "",
			consigneeAddress: "",
			consigneePhone: "",
			origin: "",
			destination: "",
			pieces: 1,
			actualWeight: 0,
			chargedWeight: 0,
			rate: 0,
			transportMode: "air",
			paymentMode: "to_pay",
			freightAmount: 0,
			pickupCharge: 0,
			packingCharge: 0,
			docketCharge: 80,
			deliveryCharge: 0,
			insuranceCharge: 0,
			gstPercent: 0,
			otherCharge: 0,
			advancePaid: 0,
			notes: "",
			remarks: "",
		},
	});

	// Reset form when editing starts
	useEffect(() => {
		if (editingInvoice) {
			form.reset({
				invoiceDate: new Date(editingInvoice.invoiceDate),
				shipperName: editingInvoice.shipperName || "",
				shipperAddress: editingInvoice.shipperAddress || "",
				shipperPhone: editingInvoice.shipperPhone || "",
				consigneeName: editingInvoice.consigneeName || "",
				consigneeAddress: editingInvoice.consigneeAddress || "",
				consigneePhone: editingInvoice.consigneePhone || "",
				customerId: editingInvoice.customerId || "",
				origin: editingInvoice.origin || "",
				destination: editingInvoice.destination || "",
				pieces: editingInvoice.pieces || 1,
				actualWeight: editingInvoice.actualWeight || 0,
				chargedWeight: editingInvoice.chargedWeight || 0,
				rate: editingInvoice.rate || 0,
				transportMode: (editingInvoice.transportMode as any) || "air",
				paymentMode: editingInvoice.paymentMode || "to_pay",
				freightAmount: editingInvoice.freightAmount || 0,
				pickupCharge: editingInvoice.pickupCharge || 0,
				packingCharge: editingInvoice.packingCharge || 0,
				docketCharge: editingInvoice.docketCharge || 0,
				deliveryCharge: editingInvoice.deliveryCharge || 0,
				insuranceCharge: editingInvoice.insuranceCharge || 0,
				gstPercent: editingInvoice.gstPercent || 0,
				otherCharge: editingInvoice.otherCharge || 0,
				advancePaid: editingInvoice.advancePaid || 0,
				notes: editingInvoice.notes || "",
				remarks: editingInvoice.remarks || "",
			});
		} else {
			form.reset();
		}
	}, [editingInvoice, form]);

	// Watch for rate lookup dependencies
	const origin = form.watch("origin");
	const destination = form.watch("destination");
	const transportMode = form.watch("transportMode");
	const chargedWeight = form.watch("chargedWeight");
	const rateValue = form.watch("rate");

	// Rate lookup effect
	useEffect(() => {
		if (origin && destination && transportMode) {
			setRateLookupStatus("searching");
			const found = rates.find(
				(r) =>
					r.origin.toLowerCase() === origin.toLowerCase() &&
					r.destination.toLowerCase() === destination.toLowerCase() &&
					r.transportMode === transportMode,
			);

			if (found) {
				setMatchedRate(found);
				setRateLookupStatus("found");
				form.setValue("rate", found.ratePerKg, { shouldDirty: true });
				if (found.baseFee) {
					form.setValue("docketCharge", found.baseFee, { shouldDirty: true });
				}
			} else {
				setMatchedRate(null);
				setRateLookupStatus("not_found");
			}
		}
	}, [origin, destination, transportMode, rates, form]);

	// Calculation effect
	useEffect(() => {
		const freight = (chargedWeight || 0) * (rateValue || 0);
		form.setValue("freightAmount", Math.round(freight), { shouldDirty: true });
	}, [chargedWeight, rateValue, form]);

	const onSubmit = async (data: InvoiceFormValues) => {
		setIsCreating(true);
		try {
			if (onSave) {
				await onSave(data);
			}
			onOpenChange(false);
			toast.success(editingInvoice ? "Invoice updated" : "Invoice created successfully");
		} catch (error) {
			console.error("Save error:", error);
			toast.error("Failed to save invoice");
		} finally {
			setIsCreating(false);
		}
	};

	const onInvalid = (errors: any) => {
		console.error("Form errors:", errors);
		toast.error("Please fill all required fields correctly");
	};

	// Calculate totals for UI summary
	const calcFreight = (form.watch("chargedWeight") || 0) * (form.watch("rate") || 0);
	const subtotal =
		calcFreight +
		(form.watch("pickupCharge") || 0) +
		(form.watch("packingCharge") || 0) +
		(form.watch("docketCharge") || 0) +
		(form.watch("deliveryCharge") || 0) +
		(form.watch("insuranceCharge") || 0) +
		(form.watch("otherCharge") || 0);
	
	const gstAmount = (subtotal * (form.watch("gstPercent") || 0)) / 100;
	const total = subtotal + gstAmount;
	const balanceDue = total - (form.watch("advancePaid") || 0);

	const calculatedTotals = {
		freight: calcFreight,
		pickup: form.watch("pickupCharge") || 0,
		packing: form.watch("packingCharge") || 0,
		docket: form.watch("docketCharge") || 0,
		insurance: form.watch("insuranceCharge") || 0,
		other: form.watch("otherCharge") || 0,
		gstPercent: form.watch("gstPercent") || 0,
		gstAmount: gstAmount,
		total: total,
		advance: form.watch("advancePaid") || 0,
		balanceDue: balanceDue,
	};

	const canEdit = true; // For now

	const SectionHeader = ({ icon: Icon, title }: { icon: any; title: string }) => (
		<div className="flex items-center gap-2 mb-4">
			<div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
				<Icon className="w-4 h-4 text-primary" />
			</div>
			<h3 className="text-sm font-semibold text-foreground">{title}</h3>
		</div>
	);

	const AddNewButton = ({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) => (
		<Button
			type="button"
			variant="ghost"
			size="sm"
			className="h-6 px-2 text-[10px] text-primary hover:text-primary/80 hover:bg-primary/5"
			onClick={onClick}
			disabled={disabled}
		>
			<Plus className="w-3 h-3 mr-1" /> Add New
		</Button>
	);

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
				<DialogContent className="max-w-[1000px] p-0 overflow-hidden bg-background rounded-xl">
					<DialogHeader className="px-6 py-4 border-b bg-muted/30">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-primary/10 rounded-lg">
									<FileText className="h-5 w-5 text-primary" />
								</div>
								<div>
									<DialogTitle className="text-xl font-bold">
										{editingInvoice ? "Edit Invoice" : "Create New Invoice"}
									</DialogTitle>
									<DialogDescription className="text-xs">
										Enter shipment details and calculate charges
									</DialogDescription>
								</div>
							</div>
							{editingInvoice && (
								<Badge variant="outline" className="h-6">
									REF: {editingInvoice.invoiceRef}
								</Badge>
							)}
						</div>
					</DialogHeader>

					<ScrollArea className="max-h-[75vh] p-6">
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
									{/* Shipper Details */}
									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<SectionHeader icon={User} title="Shipper Details" />
											<AddNewButton
												disabled={!canEdit}
												onClick={async () => {
													const created = await onQuickCreateCustomer("shipper");
													if (created) {
														form.setValue("shipperName", created.name, {
															shouldDirty: true,
														});
														form.setValue("shipperAddress", created.address || "", {
															shouldDirty: true,
														});
														form.setValue("shipperPhone", created.phone || "", {
															shouldDirty: true,
														});
													}
												}}
											/>
										</div>

										<FormField
											control={form.control}
											name="shipperName"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-xs font-medium">
														Name / Business
													</FormLabel>
													<FormControl>
														<Input
															placeholder="Enter shipper name"
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
											name="shipperAddress"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-xs font-medium">
														Address
													</FormLabel>
													<FormControl>
														<Textarea
															placeholder="Pickup address"
															className="min-h-[80px] resize-none"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<div className="grid grid-cols-2 gap-4">
											<FormField
												control={form.control}
												name="invoiceDate"
												render={({ field }) => (
													<FormItem className="flex flex-col">
														<FormLabel className="text-xs font-medium">
															Invoice Date
														</FormLabel>
														<Popover>
															<PopoverTrigger asChild>
																<FormControl>
																	<Button
																		variant={"outline"}
																		className={cn(
																			"h-9 pl-3 text-left font-normal",
																			!field.value && "text-muted-foreground",
																		)}
																	>
																		{field.value ? (
																			format(field.value, "PPP")
																		) : (
																			<span>Pick a date</span>
																		)}
																		<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
																	</Button>
																</FormControl>
															</PopoverTrigger>
															<PopoverContent
																className="w-auto p-0"
																align="start"
															>
																<Calendar
																	mode="single"
																	selected={field.value}
																	onSelect={field.onChange}
																	disabled={(date) =>
																		date > new Date() ||
																		date < new Date("1900-01-01")
																	}
																	initialFocus
																/>
															</PopoverContent>
														</Popover>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name="shipperPhone"
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

									{/* Consignee Details */}
									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<SectionHeader icon={MapPin} title="Consignee Details" />
											<AddNewButton
												disabled={!canEdit}
												onClick={async () => {
													const created =
														await onQuickCreateCustomer("consignee");
													if (created) {
														form.setValue("consigneeName", created.name, {
															shouldDirty: true,
														});
														form.setValue(
															"consigneeAddress",
															created.address || "",
															{ shouldDirty: true },
														);
														form.setValue("consigneePhone", created.phone || "", {
															shouldDirty: true,
														});
													}
												}}
											/>
										</div>

										<FormField
											control={form.control}
											name="consigneeName"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-xs font-medium">
														Recipient Name
													</FormLabel>
													<FormControl>
														<Input
															placeholder="Enter consignee name"
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
											name="consigneeAddress"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-xs font-medium">
														Delivery Address
													</FormLabel>
													<FormControl>
														<Textarea
															placeholder="Destination address"
															className="min-h-[80px] resize-none"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<div className="grid grid-cols-2 gap-4">
											<FormField
												control={form.control}
												name="remarks"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-xs font-medium">
															GSTIN (Optional)
														</FormLabel>
														<FormControl>
															<Input
																placeholder="18AABCU9603R1ZM"
																className="h-9 uppercase"
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
	);
}
