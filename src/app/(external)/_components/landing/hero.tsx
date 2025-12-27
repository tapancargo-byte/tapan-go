"use client";

import { ArrowRight, Search } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

import secureLogistics from "../../../../../public/assets/secure-logistics.json";

export function Hero() {
	const router = useRouter();
	const [trackId, setTrackId] = useState("");

	const handleTrack = (e: React.FormEvent) => {
		e.preventDefault();
		if (trackId.trim()) {
			router.push(`/search?q=${encodeURIComponent(trackId)}`);
		}
	};

	return (
		<section className="relative min-h-[90vh] flex items-center pt-32 pb-20 bg-background border-b border-border">
			<div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center w-full">
				{/* Left: Text Content */}
				<div className="lg:col-span-7 space-y-8">
					<div className="inline-flex items-center gap-3">
						<div className="px-3 py-1 bg-primary text-black text-xs font-bold uppercase tracking-widest transform skew-x-[-10deg]">
							Live Ops: 24/7
						</div>
					</div>

					<h1 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter uppercase font-heading transform -skew-x-2 text-foreground">
						Logistics, <br />
						<span className="text-primary">Re-Engineered.</span>
					</h1>

					<p className="text-xl text-muted-foreground max-w-lg font-mono">
						Connecting the Northeast Corridor with 15+ years of unbroken
						reliability. Speed. Precision. Flash.
					</p>

					<div className="flex flex-wrap gap-4 pt-4">
						<Button
							size="xl"
							asChild
							className="h-14 px-8 rounded-none text-lg font-bold bg-primary text-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border border-transparent hover:border-primary transition-all skew-x-[-10deg]"
						>
							<Link href="/booking">
								<span className="skew-x-[10deg]">Initiate Booking</span>
							</Link>
						</Button>
						<Button
							size="xl"
							asChild
							variant="outline"
							className="h-14 px-8 rounded-none text-lg font-bold border-border hover:bg-primary hover:text-black transition-all skew-x-[-10deg]"
						>
							<Link href="/login">
								<span className="skew-x-[10deg]">Access Portal</span>
							</Link>
						</Button>
					</div>
				</div>

				{/* Right: The Solid Card / Lottie */}
				<div className="lg:col-span-5 relative">
					{/* Solid Tech Card Container */}
					<div className="relative border-4 border-primary/20 bg-card shadow-[10px_10px_0px_0px_rgba(204,255,0,0.1)] aspect-square flex flex-col">
						{/* Lottie Layer */}
						<div className="flex-1 relative overflow-hidden bg-muted dark:bg-black/50">
							<div className="absolute inset-0 opacity-100">
								<Lottie
									animationData={secureLogistics}
									loop={true}
									className="w-full h-full object-cover"
								/>
							</div>

							{/* Grid Overlay */}
							<div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
						</div>

						{/* Bottom Control Panel */}
						<div className="p-6 bg-secondary border-t border-border">
							<form onSubmit={handleTrack} className="flex gap-2 mb-4">
								<div className="relative flex-1">
									<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
									<label htmlFor="track-id-hero" className="sr-only">
										Tracking Number
									</label>
									<input
										id="track-id-hero"
										type="text"
										value={trackId}
										onChange={(e) => setTrackId(e.target.value)}
										placeholder="TRACK ID: TAC-ND-9821"
										className="w-full h-12 pl-10 pr-4 bg-background border border-border text-primary font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-all text-sm uppercase"
									/>
								</div>
								<Button
									type="submit"
									size="icon"
									className="h-12 w-12 bg-primary text-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-none"
								>
									<ArrowRight className="w-5 h-5" />
								</Button>
							</form>

							<div className="flex items-center justify-between font-mono text-xs text-muted-foreground uppercase tracking-widest">
								<div>
									Status:{" "}
									<span className="text-primary animate-pulse">Online</span>
								</div>
								<div>Latency: 12ms</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
