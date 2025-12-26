"use client";

import {
	BarChart3,
	Clock,
	Headphones,
	Shield,
	Truck,
	Warehouse,
} from "lucide-react";
import { cn } from "@/lib/utils";

const solutions = [
	{
		icon: Truck,
		title: "Fleet Management",
		description:
			"End-to-end visibility of your entire fleet with GPS tracking, route optimization, and driver management.",
		features: [
			"Real-time GPS tracking",
			"Route optimization",
			"Driver performance analytics",
		],
		color: "primary",
	},
	{
		icon: Warehouse,
		title: "Warehouse Solutions",
		description:
			"Streamline inventory management with automated stock tracking and intelligent storage systems.",
		features: [
			"Inventory automation",
			"Smart storage allocation",
			"Pick & pack optimization",
		],
		color: "secondary",
	},
	{
		icon: BarChart3,
		title: "Analytics & Reporting",
		description:
			"Data-driven insights to optimize operations, reduce costs, and improve delivery performance.",
		features: [
			"Custom dashboards",
			"Predictive analytics",
			"Cost optimization reports",
		],
		color: "primary",
	},
	{
		icon: Shield,
		title: "Secure Handling",
		description:
			"Temperature-controlled and high-security transport for sensitive and valuable cargo.",
		features: [
			"Cold chain logistics",
			"High-value cargo security",
			"Compliance documentation",
		],
		color: "secondary",
	},
	{
		icon: Clock,
		title: "Same-Day Delivery",
		description:
			"Ultra-fast delivery network for time-critical shipments within metro areas.",
		features: [
			"4-hour delivery windows",
			"Priority handling",
			"Real-time notifications",
		],
		color: "primary",
	},
	{
		icon: Headphones,
		title: "Dedicated Support",
		description:
			"24/7 customer support with dedicated account managers for enterprise clients.",
		features: [
			"24/7 availability",
			"Dedicated account manager",
			"Priority escalation",
		],
		color: "secondary",
	},
];

export function SolutionsSection() {
	return (
		<section id="solutions" className="py-24 bg-white">
			<div className="max-w-7xl mx-auto px-6">
				<div className="text-center mb-16">
					<span className="inline-block px-4 py-1.5 rounded-full bg-muted text-muted-foreground text-sm font-medium mb-4">
						Industry Solutions
					</span>
					<h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
						Tailored Solutions for Every Need
					</h2>
					<p className="text-muted-foreground max-w-2xl mx-auto">
						From small businesses to large enterprises, our customizable
						logistics solutions adapt to your unique requirements and scale with
						your growth.
					</p>
				</div>

				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{solutions.map((solution) => (
						<div
							key={solution.title}
							className="group bg-card rounded-2xl p-6 border border-border hover:border-border/80 hover:shadow-xl transition-all duration-300"
						>
							<div
								className={cn(
									"w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-colors",
									solution.color === "primary"
										? "bg-primary/10 text-primary group-hover:bg-primary/20"
										: "bg-muted text-muted-foreground group-hover:bg-muted/80",
								)}
							>
								<solution.icon className="w-6 h-6" />
							</div>

							<h3 className="text-lg font-semibold text-foreground mb-2">
								{solution.title}
							</h3>
							<p className="text-sm text-muted-foreground leading-relaxed mb-4">
								{solution.description}
							</p>

							<ul className="space-y-2">
								{solution.features.map((feature) => (
									<li
										key={feature}
										className="flex items-center gap-2 text-xs text-muted-foreground"
									>
										<span className="w-1 h-1 rounded-full bg-primary" />
										{feature}
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
