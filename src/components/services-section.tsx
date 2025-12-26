"use client";

import { Building2, Globe, Package, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const services = [
	{
		icon: Package,
		title: "Domestic Cargo",
		description:
			"Reliable nationwide delivery with real-time tracking and secure handling.",
		color: "primary",
	},
	{
		icon: Globe,
		title: "International Freight",
		description:
			"Global logistics solutions with customs clearance and documentation support.",
		color: "secondary",
	},
	{
		icon: Zap,
		title: "Express Delivery",
		description:
			"Time-critical shipments with guaranteed same-day and next-day delivery options.",
		color: "primary",
	},
	{
		icon: Building2,
		title: "Enterprise Logistics",
		description:
			"Tailored supply chain solutions for large-scale business operations.",
		color: "secondary",
	},
];

export function ServicesSection() {
	return (
		<section id="services" className="py-24 bg-muted/30">
			<div className="max-w-7xl mx-auto px-6">
				<div className="text-center mb-16">
					<span className="inline-block px-4 py-1.5 rounded-full bg-card text-muted-foreground text-sm font-medium mb-4 border border-border">
						What We Offer
					</span>
					<h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
						Our Services
					</h2>
					<p className="text-muted-foreground max-w-xl mx-auto">
						Comprehensive logistics solutions designed to meet your every
						shipping need.
					</p>
				</div>

				<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
					{services.map((service, _index) => (
						<div
							key={service.title}
							className="group bg-card rounded-2xl p-6 border border-border hover:border-border/80 hover:shadow-lg transition-all duration-300 cursor-pointer"
						>
							<div
								className={cn(
									"w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-colors",
									service.color === "primary"
										? "bg-primary/10 text-primary group-hover:bg-primary/20"
										: "bg-muted text-muted-foreground group-hover:bg-muted/80",
								)}
							>
								<service.icon className="w-6 h-6" />
							</div>
							<h3 className="text-lg font-semibold text-foreground mb-2">
								{service.title}
							</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								{service.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
