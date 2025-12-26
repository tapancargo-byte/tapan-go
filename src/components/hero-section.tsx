"use client";

import Lottie from "lottie-react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import operationsHubVisual from "@/public/assets/operations-hub-visual.json";

export function HeroSection() {
	return (
		<section className="relative min-h-screen flex items-center pt-20">
			<div className="absolute inset-0 bg-background" />

			<div className="relative max-w-7xl mx-auto px-6 py-20 w-full">
				<div className="grid lg:grid-cols-2 gap-16 items-center">
					<div className="space-y-8">
						<div className="inline-flex items-center gap-2 px-4 py-2 border border-border">
							<span className="w-1.5 h-1.5 bg-accent" />
							<span className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
								Enterprise Logistics
							</span>
						</div>

						<h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.05] tracking-tight text-balance">
							Delivering Trust
							<br />
							Across Every Mile.
						</h1>

						<p className="text-lg text-muted-foreground leading-relaxed max-w-md">
							Enterprise-grade cargo solutions with real-time tracking and
							seamless delivery worldwide.
						</p>

						<div className="flex flex-col sm:flex-row gap-4 pt-4">
							<Button className="bg-foreground hover:bg-foreground/90 text-background px-8 h-14 text-base font-medium group rounded-none">
								Track Shipment
								<ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
							</Button>
							<Button
								variant="outline"
								className="border-border hover:bg-muted text-foreground px-8 h-14 text-base font-medium bg-transparent rounded-none"
							>
								Get a Quote
							</Button>
						</div>
					</div>

					<div className="relative hidden lg:block">
						<div className="max-w-lg mx-auto">
							<div className="bg-background border border-border shadow-sm p-6">
								<div className="flex items-center justify-between mb-4">
									<div className="space-y-0.5">
										<p className="text-xs text-muted-foreground uppercase tracking-wide">
											Operations Hub
										</p>
										<p className="text-lg font-semibold text-foreground">
											Live Visibility
										</p>
									</div>
									<div className="px-2 py-1 border border-border text-xs font-semibold tracking-wide text-muted-foreground">
										LIVE
									</div>
								</div>

								<div className="bg-muted border border-border">
									<div className="h-[360px] w-full flex items-center justify-center">
										<div className="w-full max-w-[420px]">
											<Lottie
												animationData={operationsHubVisual}
												loop
												autoplay
											/>
										</div>
									</div>
								</div>

								<div className="mt-4 grid grid-cols-3 gap-3">
									<div className="border border-border bg-background p-3">
										<p className="text-xs text-muted-foreground">Status</p>
										<p className="text-sm font-semibold text-foreground">
											Active
										</p>
									</div>
									<div className="border border-border bg-background p-3">
										<p className="text-xs text-muted-foreground">Updates</p>
										<p className="text-sm font-semibold text-foreground">
											Real-time
										</p>
									</div>
									<div className="border border-border bg-background p-3">
										<p className="text-xs text-muted-foreground">Coverage</p>
										<p className="text-sm font-semibold text-foreground">
											Multi-route
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
