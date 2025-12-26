"use client";

import {
	motion,
} from "framer-motion";
import {
	CheckCircle2,
	Clock,
	Globe,
	Package,
	Phone,
	Search,
	ShieldCheck,
	Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

// --- Components ---

function Nav() {
	return (
		<nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
			<div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
				<div className="flex items-center gap-2.5">
					<div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
						<Truck className="text-primary-foreground h-6 w-6" />
					</div>
					<span className="text-xl font-bold tracking-tight">Tapan Cargo</span>
				</div>

				<div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
					<Link href="#services" className="hover:text-primary transition-colors">
						Services
					</Link>
					<Link href="#track" className="hover:text-primary transition-colors">
						Tracking
					</Link>
					<Link href="#contact" className="hover:text-primary transition-colors">
						Support
					</Link>
				</div>

				<div className="flex items-center gap-4">
					<Link
						href="/login"
						className="text-sm font-medium hover:text-primary transition-colors"
					>
						Sign In
					</Link>
					<Button className="rounded-full px-6">Get Started</Button>
				</div>
			</div>
		</nav>
	);
}

function Hero() {
	return (
		<section className="relative pt-32 pb-20 overflow-hidden">
			{/* Bg Gradient */}
			<div className="absolute top-0 right-0 w-[50%] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

			<div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
				<div className="space-y-8 relative z-10">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider"
					>
						<Globe className="h-3 w-3" />
						Pan-India Logistics Network
					</motion.div>

					<motion.h1
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
					>
						Moving <span className="text-primary">Cargo</span> with Precision and{" "}
						<span className="italic font-serif serif text-muted-foreground/40">
							Speed
						</span>
					</motion.h1>

					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="text-xl text-muted-foreground max-w-lg leading-relaxed"
					>
						Specialized transport solutions from Imphal to New Delhi. Reliability
						built over 20 years of nationwide operations.
					</motion.p>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="flex flex-wrap gap-4"
					>
						<Button size="lg" className="h-14 px-8 text-base">
							Book a Shipment
						</Button>
						<Button size="lg" variant="outline" className="h-14 px-8 text-base">
							View Rates
						</Button>
					</motion.div>

					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.5 }}
						className="flex items-center gap-6 pt-4"
					>
						<div className="flex -space-x-3">
							{[1, 2, 3, 4].map((i) => (
								<div
									key={i}
									className="w-10 h-10 rounded-full border-2 border-background bg-muted overflow-hidden"
								>
									<Image
										src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 20}`}
										alt="avatar"
										width={40}
										height={40}
										className="h-full w-full object-cover"
									/>
								</div>
							))}
						</div>
						<div className="text-sm">
							<p className="font-bold">5,000+ Active Clients</p>
							<p className="text-muted-foreground">Trusted by top manufacturers</p>
						</div>
					</motion.div>
				</div>

				<div className="relative">
					<motion.div
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
						className="relative z-10 rounded-3xl overflow-hidden border border-border/50 shadow-2xl bg-muted aspect-[4/3]"
					>
						<Image
							src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=2000"
							alt="Logistics center"
							layout="fill"
							className="object-cover"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

						<div className="absolute bottom-8 left-8 right-8 flex items-center justify-between text-white">
							<div>
								<p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">
									Real-time Status
								</p>
								<p className="text-xl font-bold">In Transit: Delhi Express</p>
							</div>
							<div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold border border-white/30">
								ETA: 2h 45m
							</div>
						</div>
					</motion.div>

					{/* Floating stats card */}
					<motion.div
						initial={{ x: 50, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						transition={{ delay: 0.6 }}
						className="absolute -right-8 top-12 z-20 bg-background border border-border p-6 rounded-2xl shadow-xl hidden xl:block"
					>
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
								<CheckCircle2 className="text-green-500 h-6 w-6" />
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Delivery Success</p>
								<p className="text-2xl font-bold">99.8%</p>
							</div>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}

function Stats() {
	return (
		<section className="py-20 bg-muted/30">
			<div className="max-w-7xl mx-auto px-6 grid items-center grid-cols-2 lg:grid-cols-4 gap-8">
				{[
					{ label: "Shipments / Year", value: "240k+" },
					{ label: "Fleet Size", value: "850+" },
					{ label: "Cities Served", value: "110+" },
					{ label: "Years Experience", value: "20+" },
				].map((stat, i) => (
					<div key={i} className="text-center space-y-2">
						<p className="text-4xl lg:text-5xl font-bold tracking-tight">
							{stat.value}
						</p>
						<p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
							{stat.label}
						</p>
					</div>
				))}
			</div>
		</section>
	);
}

function TrackingInput() {
	const [focused, setFocused] = useState(false);

	return (
		<section id="track" className="py-24">
			<div className="max-w-7xl mx-auto px-6">
				<div className="relative rounded-[3rem] bg-slate-950 p-8 md:p-16 overflow-hidden">
					{/* Decorative background */}
					<div className="absolute top-0 right-0 w-[40%] h-full bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

					<div className="relative z-10 flex flex-col items-center text-center space-y-8">
						<div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
							<Package className="text-white h-8 w-8" />
						</div>

						<div className="space-y-4">
							<h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
								Where is your shipment?
							</h2>
							<p className="text-slate-400 text-lg max-w-2xl">
								Enter your 12-digit consignment number to track your cargo in
								real-time across our network.
							</p>
						</div>

						<div
							className={cn(
								"w-full max-w-2xl relative transition-all duration-500 rounded-2xl md:rounded-full bg-white/10 backdrop-blur-md p-2 border",
								focused ? "border-primary ring-4 ring-primary/20" : "border-white/20",
							)}
						>
							<div className="flex flex-col md:flex-row items-center gap-2">
								<div className="relative flex-1 w-full">
									<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
									<input
										type="text"
										placeholder="e.g. 1000 4829 3920"
										onFocus={() => setFocused(true)}
										onBlur={() => setFocused(false)}
										className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-500 h-14 pl-12 text-lg"
									/>
								</div>
								<Button className="w-full md:w-auto md:px-8 h-14 rounded-2xl md:rounded-full text-lg">
									Track Cargo
								</Button>
							</div>
						</div>

						<div className="flex flex-wrap justify-center gap-6 text-slate-400 text-sm">
							<div className="flex items-center gap-2">
								<Clock className="h-4 w-4" /> Real-time Updates
							</div>
							<div className="flex items-center gap-2">
								<ShieldCheck className="h-4 w-4" /> Proof of Delivery
							</div>
							<div className="flex items-center gap-2">
								<Phone className="h-4 w-4" /> 24/7 Support
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

function Services() {
	const services = [
		{
			title: "Critical Express",
			description:
				"Next-day delivery between Imphal and Delhi for time-sensitive cargo.",
			icon: Clock,
			tag: "Speed",
		},
		{
			title: "Heavy Haulage",
			description:
				"Full truckload services for large scale manufacturing and industrial goods.",
			icon: Truck,
			tag: "Volume",
		},
		{
			title: "Secure Handling",
			description:
				"High-value shipment protection with advanced security and monitoring.",
			icon: ShieldCheck,
			tag: "Safety",
		},
		{
			title: "Storage Solutions",
			description:
				"Modern warehousing sites with inventory management and distribution.",
			icon: Globe,
			tag: "Scale",
		},
	];

	return (
		<section id="services" className="py-24 bg-muted/30">
			<div className="max-w-7xl mx-auto px-6">
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
					<div className="space-y-4">
						<h3 className="text-primary font-bold uppercase tracking-wider text-xs">
							Our Expertise
						</h3>
						<h2 className="text-4xl md:text-5xl font-bold tracking-tight">
							Logistics Reimagined.
						</h2>
					</div>
					<p className="text-muted-foreground max-w-md text-lg leading-relaxed">
						We provide a comprehensive range of transportation services tailored to
						your business needs.
					</p>
				</div>

				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
					{services.map((s, i) => (
						<div
							key={i}
							className="group p-8 rounded-[2rem] bg-background border border-border/60 hover:border-primary/40 hover:shadow-xl transition-all duration-300"
						>
							<div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
								<s.icon className="h-6 w-6 text-primary" />
							</div>
							<span className="text-[10px] uppercase font-black tracking-tighter text-primary/40 mb-2 block">
								{s.tag}
							</span>
							<h3 className="text-xl font-bold mb-3">{s.title}</h3>
							<p className="text-muted-foreground text-sm line-clamp-3">
								{s.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

function Footer() {
	return (
		<footer className="bg-background border-t border-border">
			<div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
					{/* Logo column */}
					<div className="col-span-2 space-y-6">
						<div className="flex items-center gap-2.5">
							<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
								<Truck className="text-primary-foreground h-5 w-5" />
							</div>
							<span className="text-lg font-bold tracking-tight">
								Tapan Cargo
							</span>
						</div>
						<p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
							The most reliable logistics partner for the Imphal-Delhi corridor since
							2003. Leading with innovation and trust.
						</p>
					</div>

					{/* Links */}
					<div className="space-y-6">
						<h4 className="font-bold text-sm uppercase tracking-widest">
							Platform
						</h4>
						<ul className="space-y-4 text-sm text-muted-foreground">
							<li>
								<Link href="/login" className="hover:text-primary transition-colors">
									Dashboard
								</Link>
							</li>
							<li>
								<Link href="#track" className="hover:text-primary transition-colors">
									Shipment Tracking
								</Link>
							</li>
							<li>
								<Link href="#" className="hover:text-primary transition-colors">
									Rate Calculator
								</Link>
							</li>
						</ul>
					</div>

					<div className="space-y-6">
						<h4 className="font-bold text-sm uppercase tracking-widest">
							Company
						</h4>
						<ul className="space-y-4 text-sm text-muted-foreground">
							<li>
								<Link href="#" className="hover:text-primary transition-colors">
									About Us
								</Link>
							</li>
							<li>
								<Link href="#" className="hover:text-primary transition-colors">
									Careers
								</Link>
							</li>
							<li>
								<Link href="#" className="hover:text-primary transition-colors">
									Contact Sales
								</Link>
							</li>
						</ul>
					</div>
				</div>

				<div className="pt-8 border-t border-border/60 flex flex-col md:flex-row justify-between items-center gap-6">
					<p className="text-sm text-muted-foreground">
						© 2026 Tapan Associate Logistics. All rights reserved.
					</p>
					<div className="flex gap-8 text-sm text-muted-foreground font-medium">
						<Link href="#" className="hover:text-primary transition-colors">
							Privacy Policy
						</Link>
						<Link href="#" className="hover:text-primary transition-colors">
							Terms of Service
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}

// --- Page Component ---

export function LandingPage() {
	return (
		<main className="min-h-screen">
			<Nav />
			<Hero />
			<Stats />
			<Services />
			<TrackingInput />
			<Footer />
		</main>
	);
}

function cn(...inputs: (string | undefined | null | boolean)[]) {
	return inputs.filter(Boolean).join(" ");
}
