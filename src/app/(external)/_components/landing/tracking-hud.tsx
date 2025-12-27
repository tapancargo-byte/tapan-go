"use client";

import { Box, MapPin, Truck } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

export function TrackingHUD() {
	const [trackingId, setTrackingId] = useState("");
	const [status, setStatus] = useState<"idle" | "loading" | "found">("idle");

	const handleTrack = () => {
		if (!trackingId.trim()) return;
		setStatus("loading");
	};

	React.useEffect(() => {
		let timeout: NodeJS.Timeout;
		if (status === "loading") {
			timeout = setTimeout(() => setStatus("found"), 1500);
		}
		return () => clearTimeout(timeout);
	}, [status]);

	return (
		<section
			id="track"
			className="py-32 relative bg-black text-white overflow-hidden border-y border-white/10"
		>
			{/* Industrial Grid Background */}
			<div className="absolute inset-0 bg-[linear-gradient(rgba(50,50,50,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(50,50,50,0.3)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

			<div className="max-w-4xl mx-auto px-6 relative z-10 text-center space-y-8">
				<h2 className="text-4xl md:text-5xl font-black font-heading tracking-tight uppercase">
					Live <span className="text-primary">Telemetry</span>
				</h2>
				<p className="text-neutral-400 text-lg max-w-xl mx-auto font-mono">
					Enter your AWB or Consignment Number to access real-time status.
				</p>

				<div className="max-w-md mx-auto relative">
					<div className="relative flex p-1 bg-black border border-white/30 focus-within:border-primary transition-colors">
						<label htmlFor="tracking-input" className="sr-only">
							Tracking Number
						</label>
						<input
							id="tracking-input"
							name="trackingId"
							value={trackingId}
							onChange={(e) => {
								setTrackingId(e.target.value);
								if (status !== "idle") setStatus("idle");
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									handleTrack();
								}
							}}
							placeholder="ENTER AWB NUMBER..."
							aria-label="Tracking Number"
							className="flex-1 bg-transparent border-none focus:outline-none px-6 text-lg font-mono text-white placeholder:text-neutral-600 font-bold tracking-widest uppercase"
						/>
						<Button
							onClick={handleTrack}
							disabled={status === "loading" || !trackingId.trim()}
							size="lg"
							className="rounded-none px-8 font-bold text-base bg-primary text-black hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{status === "loading" ? "SCANNING..." : "TRACK"}
						</Button>
					</div>
				</div>

				{/* HUD Result Simulation */}
				<div aria-live="polite" className="min-h-[20px]">
					{status === "found" && (
						<div className="mt-12 bg-black border border-primary/50 text-left animate-in fade-in slide-in-from-bottom-6 relative">
							{/* Decorative Corners */}
							<div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-primary" />
							<div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-primary" />
							<div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-primary" />
							<div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-primary" />

							<div className="p-8">
								{/* Mock Data Disclaimer */}
								<div className="absolute top-2 right-2 text-[10px] text-neutral-600 font-mono uppercase tracking-widest border border-neutral-800 px-2 py-1">
									Simulation Mode
								</div>

								<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-white/10">
									<div>
										<div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1 font-mono">
											Consignment {trackingId}
										</div>
										<div className="text-2xl font-black text-primary flex items-center gap-2 uppercase">
											<span className="relative flex h-3 w-3">
												<span className="animate-ping absolute inline-flex h-full w-full rounded-none bg-primary opacity-75"></span>
												<span className="relative inline-flex rounded-none h-3 w-3 bg-primary"></span>
											</span>
											In Transit
										</div>
									</div>
									<div className="text-right">
										<div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1 font-mono">
											ETA
										</div>
										<div className="text-2xl font-black font-mono">
											1400 HRS <span className="text-neutral-600">|</span> TODAY
										</div>
									</div>
								</div>

								<div className="pt-8 grid gap-8 relative">
									{/* Vertical Line */}
									<div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-neutral-800" />

									<div className="relative flex gap-6">
										<div className="relative z-10 w-10 h-10 bg-neutral-900 border border-neutral-700 flex items-center justify-center shrink-0">
											<Box className="w-5 h-5 text-neutral-400" />
										</div>
										<div className="pt-1">
											<div className="font-bold text-lg mb-1 uppercase">
												Shipment Picked Up
											</div>
											<div className="text-sm font-mono text-neutral-500">
												IMPHAL, MN • 0930 HRS
											</div>
										</div>
									</div>

									<div className="relative flex gap-6">
										<div className="relative z-10 w-10 h-10 bg-primary/20 border border-primary flex items-center justify-center shrink-0">
											<Truck className="w-5 h-5 text-primary" />
										</div>
										<div className="pt-1">
											<div className="font-bold text-lg mb-1 text-primary uppercase">
												En Route to Hub
											</div>
											<div className="text-sm font-mono text-neutral-500">
												GUWAHATI HIGHWAY • LIVE
											</div>
										</div>
									</div>

									<div className="relative flex gap-6 opacity-50">
										<div className="relative z-10 w-10 h-10 bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
											<MapPin className="w-5 h-5 text-neutral-600" />
										</div>
										<div className="pt-1">
											<div className="font-bold text-lg mb-1 uppercase">
												Out for Delivery
											</div>
											<div className="text-sm font-mono text-neutral-500">
												NEW DELHI • PENDING
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
