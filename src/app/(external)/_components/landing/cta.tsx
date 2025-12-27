"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTA() {
	return (
		<section className="py-20 relative overflow-hidden">
			<div className="absolute inset-0 bg-primary/95">
				<div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:100px_100px] opacity-20" />
			</div>

			<div className="max-w-5xl mx-auto px-6 relative z-10 text-center space-y-10">
				<h2 className="text-4xl md:text-6xl font-black font-heading tracking-tight text-white">
					READY TO{" "}
					<span className="text-black bg-white px-2 italic">MOVE?</span>
				</h2>
				<p className="text-white/80 text-xl max-w-2xl mx-auto font-medium">
					Join 500+ enterprises leveraging the TAC logistics network for faster,
					safer, and smarter delivery.
				</p>

				<div className="flex flex-col sm:flex-row items-center justify-center gap-6">
					<Button
						size="xl"
						asChild
						className="h-16 px-12 rounded-none text-lg font-bold bg-white text-black hover:bg-primary hover:text-black shadow-[4px_4px_0px_#ccff00] transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none uppercase tracking-wider"
					>
						<Link href="/quote">Get Competitive Quote</Link>
					</Button>
					<Link
						href="/contact"
						className="flex items-center gap-2 text-white/80 font-bold uppercase text-sm tracking-widest cursor-pointer hover:text-primary transition-colors group"
						aria-label="Contact TAC Sales"
					>
						<span>Contact Sales</span>
						<ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
					</Link>
				</div>
			</div>
		</section>
	);
}
