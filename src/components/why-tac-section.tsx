"use client";

import { Bot, Calendar, Globe2, MapPin } from "lucide-react";

const stats = [
	{
		icon: Calendar,
		value: "15+",
		label: "Years of Experience",
		description: "Trusted logistics partner since 2010",
	},
	{
		icon: Globe2,
		value: "50+",
		label: "Countries Served",
		description: "Global reach with local expertise",
	},
	{
		icon: MapPin,
		value: "24/7",
		label: "Real-Time Tracking",
		description: "Live updates on every shipment",
	},
	{
		icon: Bot,
		value: "AI",
		label: "Powered Support",
		description: "Intelligent assistance anytime",
	},
];

export function WhyTacSection() {
	return (
		<section className="py-24 bg-white">
			<div className="max-w-7xl mx-auto px-6">
				<div className="text-center mb-16">
					<span className="inline-block px-4 py-1.5 rounded-full bg-muted text-muted-foreground text-sm font-medium mb-4">
						Why Choose Us
					</span>
					<h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
						Why TAC?
					</h2>
					<p className="text-muted-foreground max-w-xl mx-auto">
						Building trust through technology, reliability, and unmatched
						service excellence.
					</p>
				</div>

				<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
					{stats.map((stat) => (
						<div key={stat.label} className="text-center group">
							<div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
								<stat.icon className="w-7 h-7 text-primary-foreground" />
							</div>
							<div className="text-4xl font-bold text-foreground mb-1">
								{stat.value}
							</div>
							<div className="text-sm font-semibold text-foreground/80 mb-1">
								{stat.label}
							</div>
							<p className="text-xs text-muted-foreground">
								{stat.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
