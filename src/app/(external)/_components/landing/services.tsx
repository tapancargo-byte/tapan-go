"use client";

import {
	Globe,
	Package,
	ShieldCheck,
	Truck,
	Warehouse,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const services = [
	{
		title: "Air Expedite",
		description:
			"Priority air cargo for time-critical consignments. 24-48hr nationwide delivery.",
		icon: Zap,
		className: "md:col-span-2",
		gradient: "from-primary/20 to-primary/5",
		href: "/services/air",
	},
	{
		title: "Surface Heavy",
		description:
			"Cost-optimized heavy haulage for industrial machinery and bulk goods.",
		icon: Truck,
		className: "md:col-span-1",
		gradient: "from-accent/20 to-accent/5",
		href: "/services/surface",
	},
	{
		title: "Secure Logistics",
		description:
			"Armed escort and GPS-monitored transport for high-value assets.",
		icon: ShieldCheck,
		className: "md:col-span-1",
		gradient: "from-green-500/20 to-green-500/5",
		href: "/services/secure",
	},
	{
		title: "Warehousing",
		description:
			"Strategic storage nodes in Imphal and Delhi with JIT inventory management.",
		icon: Warehouse,
		className: "md:col-span-2",
		gradient: "from-orange-500/20 to-orange-500/5",
		href: "/services/warehousing",
	},
	{
		title: "Customs Brokerage",
		description:
			"Expert handling of regulatory documentation for seamless cross-border flow.",
		icon: Globe,
		className: "md:col-span-1",
		gradient: "from-blue-500/20 to-blue-500/5",
		href: "/services/customs",
	},
	{
		title: "Last Mile Tech",
		description:
			"App-enabled delivery agents ensuring precision doorstep handover.",
		icon: Package,
		className: "md:col-span-2",
		gradient: "from-purple-500/20 to-purple-500/5",
		href: "/services/last-mile",
	},
];

export function Services() {
	return (
		<section
			id="services"
			className="py-32 bg-background relative overflow-hidden"
		>
			{/* Ambient Background */}
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

			<div className="max-w-7xl mx-auto px-6 relative z-10">
				<div className="mb-20 space-y-4">
					<h2 className="text-4xl md:text-5xl font-black font-heading tracking-tight">
						OPERATIONAL <span className="text-primary">CAPABILITIES</span>
					</h2>
					<p className="text-xl text-muted-foreground max-w-2xl">
						A full-spectrum logistics ecosystem designed for scale, speed, and
						security.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{services.map((service) => (
						<div
							key={service.title}
							className={cn(
								"group relative p-8 border border-border bg-card hover:border-primary transition-all duration-300 overflow-hidden",
								service.className,
							)}
						>
							{/* Hover Gradient Background */}
							<div
								className={cn(
									"absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300",
									service.gradient,
								)}
							/>

							<div className="relative z-10 flex flex-col h-full justify-between">
								<div className="mb-8">
									<div className="w-12 h-12 bg-secondary border border-border flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-black transition-colors duration-300">
										<service.icon className="w-6 h-6 text-foreground group-hover:text-black" />
									</div>
									<h3 className="text-2xl font-bold mb-3 font-heading uppercase">
										{service.title}
									</h3>
									<p className="text-muted-foreground leading-relaxed font-mono text-sm">
										{service.description}
									</p>
								</div>

								<Link
									href={service.href || "#"}
									className="flex items-center gap-2 text-xs font-bold text-primary opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 uppercase tracking-widest cursor-pointer"
								>
									Learn more <span className="text-lg">→</span>
								</Link>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
