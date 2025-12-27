"use client";

import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

import corridorData from "@/public/assets/corridor.json";

export function NetworkMap() {
	return (
		<section className="py-20 bg-muted/20 border-y border-border overflow-hidden relative">
			<div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-end">
				<div className="space-y-6 relative z-10">
					<span className="text-primary font-bold tracking-widest uppercase text-sm">
						The Corridor
					</span>
					<h2 className="text-4xl md:text-5xl font-black font-heading leading-tight">
						FROM THE CAPITAL <br />
						TO THE <span className="text-primary">FRONTIER.</span>
					</h2>
					<p className="text-muted-foreground text-lg max-w-md">
						Our specialized high-speed corridor connects{" "}
						<strong className="text-foreground">New Delhi</strong> directly to{" "}
						<strong className="text-foreground">Imphal</strong>, bridging the
						distance with unmatched efficiency.
					</p>

					<div className="pt-8 grid grid-cols-2 gap-8">
						<div>
							<div className="text-3xl font-black font-mono">2,400+</div>
							<div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
								Kilometers Covered
							</div>
						</div>
						<div>
							<div className="text-3xl font-black font-mono">48h</div>
							<div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
								Guaranteed Air Transit
							</div>
						</div>
					</div>
				</div>

				<div className="relative h-[400px] w-full bg-black border-2 border-primary/20 flex items-center justify-center overflow-hidden">
					<div className="absolute inset-0">
						<Lottie
							animationData={corridorData}
							loop={true}
							className="w-full h-full object-cover opacity-80"
						/>
					</div>

					{/* Grid Overlay */}
					<div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] pointer-events-none" />
				</div>
			</div>
		</section>
	);
}
