"use client";

import { CheckCircle2, Clock, Package, Search, Truck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const trackingSteps = [
	{ id: 1, label: "Booked", icon: Package, status: "complete" },
	{ id: 2, label: "Picked Up", icon: Package, status: "complete" },
	{ id: 3, label: "In Transit", icon: Truck, status: "current" },
	{ id: 4, label: "Delivered", icon: CheckCircle2, status: "pending" },
];

export function TrackingSection() {
	const [trackingNumber, setTrackingNumber] = useState("");
	const [showResult, setShowResult] = useState(false);

	const handleTrack = () => {
		if (trackingNumber.trim()) {
			setShowResult(true);
		}
	};

	return (
		<section id="tracking" className="py-24 bg-background">
			<div className="max-w-7xl mx-auto px-6">
				<div className="text-center mb-12">
					<span className="inline-block px-4 py-1.5 rounded-full bg-muted/80 text-muted-foreground text-sm font-medium mb-4">
						Real-Time Tracking
					</span>
					<h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
						Track Your Consignment
					</h2>
					<p className="text-muted-foreground max-w-xl mx-auto">
						Enter your consignment number to get instant updates on your
						shipment status.
					</p>
				</div>

				{/* Tracking Input Card */}
				<div className="max-w-2xl mx-auto">
					<div className="bg-muted/30 border border-border rounded-2xl p-8">
						<div className="flex flex-col sm:flex-row gap-4">
							<div className="relative flex-1">
								<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
								<Input
									type="text"
									placeholder="Enter Consignment Number"
									value={trackingNumber}
									onChange={(e) => setTrackingNumber(e.target.value)}
									className="pl-12 h-14 rounded-xl border-border bg-card text-base focus:ring-2 focus:ring-primary/20 focus:border-primary"
								/>
							</div>
							<Button
								onClick={handleTrack}
								className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8 h-14 text-base font-medium"
							>
								Track Now
							</Button>
						</div>

						{/* Result State */}
						{showResult && (
							<div className="mt-8 p-6 bg-card rounded-xl border border-border">
								<div className="flex items-center justify-between mb-6">
									<div>
										<p className="text-sm text-muted-foreground">Consignment</p>
										<p className="text-lg font-semibold text-foreground">
											{trackingNumber}
										</p>
									</div>
									<div className="flex items-center gap-2 px-3 py-1.5 bg-chart-2/10 text-chart-2 rounded-full">
										<Clock className="w-4 h-4" />
										<span className="text-sm font-medium">In Transit</span>
									</div>
								</div>

								{/* Timeline UI */}
								<div className="relative">
									<div className="flex items-center justify-between">
										{trackingSteps.map((step, _index) => (
											<div
												key={step.id}
												className="flex flex-col items-center relative z-10"
											>
												<div
													className={cn(
														"w-12 h-12 rounded-full flex items-center justify-center transition-all",
														step.status === "complete" &&
															"bg-chart-2 text-white",
														step.status === "current" &&
															"bg-chart-2/15 text-chart-2 ring-4 ring-chart-2/15",
														step.status === "pending" &&
															"bg-muted text-muted-foreground",
													)}
												>
													<step.icon className="w-5 h-5" />
												</div>
												<span
													className={cn(
														"text-xs mt-2 font-medium",
														step.status === "pending"
															? "text-muted-foreground"
															: "text-foreground/80",
													)}
												>
													{step.label}
												</span>
											</div>
										))}
									</div>
									{/* Progress Line */}
									<div className="absolute top-6 left-6 right-6 h-0.5 bg-border -z-0">
										<div className="h-full w-[60%] bg-chart-2 rounded-full" />
									</div>
								</div>

								<p className="text-sm text-muted-foreground text-center mt-6">
									Estimated delivery:{" "}
									<span className="font-medium text-foreground/80">
										Dec 18, 2025
									</span>
								</p>
							</div>
						)}

						{/* Placeholder State */}
						{!showResult && (
							<div className="mt-6 text-center text-sm text-muted-foreground">
								<p>Enter a consignment number to view tracking details</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
