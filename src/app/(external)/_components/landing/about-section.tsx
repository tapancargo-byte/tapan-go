"use client";

import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import unstoppableData from "@/public/assets/unstoppable.json";

export function AboutSection() {
	return (
		<section
			id="about"
			className="py-24 bg-background border-b border-border relative overflow-hidden"
		>
			{/* Industrial Grid Background */}
			<div className="absolute inset-0 bg-[linear-gradient(rgba(204,255,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(204,255,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

			<div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center relative z-10">
				<div className="space-y-8">
					<div className="inline-block px-4 py-2 bg-secondary border-l-4 border-primary text-xs font-mono uppercase tracking-widest text-primary font-bold">
						Est. 2009
					</div>

					<h2 className="text-4xl md:text-6xl font-black uppercase leading-none transform -skew-x-2 font-heading">
						15 Years of <br />
						<span className="text-primary">Unstoppable</span> <br />
						Momentum.
					</h2>

					<p className="text-xl text-muted-foreground leading-relaxed font-mono">
						Tapan Associate Cargo (TAC) has been the lifeline of trade between
						New Delhi and Imphal. We don't just move boxes; we engineer the flow
						of commerce across India's toughest terrains.
					</p>

					<div className="pt-8 grid grid-cols-2 gap-8 border-t border-border">
						<div>
							<div className="text-4xl font-black text-foreground">40+</div>
							<div className="text-xs uppercase tracking-widest text-muted-foreground mt-1 font-bold">
								Daily Sorties
							</div>
						</div>
						<div>
							<div className="text-4xl font-black text-foreground">99.9%</div>
							<div className="text-xs uppercase tracking-widest text-muted-foreground mt-1 font-bold">
								Satisfaction
							</div>
						</div>
					</div>

					<Button
						variant="outline"
						className="h-12 px-8 uppercase tracking-widest font-bold text-xs border-primary text-primary hover:bg-primary hover:text-black rounded-none transition-all"
						asChild
					>
						<Link href="/about">
							Our Full Story <ArrowRight className="ml-2 w-4 h-4" />
						</Link>
					</Button>
				</div>

				<div className="relative h-full min-h-[400px] border-4 border-secondary bg-secondary/20 flex items-center justify-center overflow-hidden">
					<div className="absolute inset-0 p-8">
						<Lottie
							animationData={unstoppableData}
							loop={true}
							className="w-full h-full object-contain opacity-80 mix-blend-multiply dark:mix-blend-screen"
						/>
					</div>
				</div>
			</div>
		</section>
	);
}
