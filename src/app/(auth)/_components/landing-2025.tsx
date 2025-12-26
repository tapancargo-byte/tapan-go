"use client";

import {
	motion,
	useScroll,
	useTransform,
} from "framer-motion";
import {
	ArrowRight,
	Globe,
	MoveRight,
	Package,
	Search,
	ShieldCheck,
	Truck,
	Zap,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

// --- Custom Components ---

const Badge = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
	<div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
		{children}
	</div>
);

const SectionHeading = ({
	badge,
	title,
	description,
	centered = false,
}: {
	badge: string;
	title: string;
	description: string;
	centered?: boolean;
}) => (
	<div className={`space-y-4 mb-12 ${centered ? "text-center" : ""}`}>
		<Badge className="bg-primary/10 text-primary border-primary/20 uppercase tracking-widest px-4 py-1">
			{badge}
		</Badge>
		<h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
			{title}
		</h2>
		<p className="text-muted-foreground text-lg max-w-2xl mx-auto md:mx-0">
			{description}
		</p>
	</div>
);

// --- Sections ---

function Navbar() {
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 20);
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<nav
			className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/80 backdrop-blur-xl border-b py-4" : "bg-transparent py-6"
				}`}
		>
			<div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
						<Truck className="text-primary-foreground h-6 w-6" />
					</div>
					<span className="text-2xl font-black tracking-tighter">TAPAN</span>
				</div>

				<div className="hidden lg:flex items-center gap-10 text-sm font-bold uppercase tracking-widest text-muted-foreground">
					<Link href="#services" className="hover:text-primary transition-colors">
						Services
					</Link>
					<Link href="#track" className="hover:text-primary transition-colors">
						Tracking
					</Link>
					<Link href="#solutions" className="hover:text-primary transition-colors">
						Solutions
					</Link>
				</div>

				<div className="flex items-center gap-4">
					<Link href="/login">
						<Button variant="ghost" className="font-bold">
							Portal
						</Button>
					</Link>
					<Button className="rounded-full px-8 shadow-xl shadow-primary/20">
						Get Quote
					</Button>
				</div>
			</div>
		</nav>
	);
}

function Hero() {
	const { scrollY } = useScroll();
	const y1 = useTransform(scrollY, [0, 500], [0, 100]);
	const opacity = useTransform(scrollY, [0, 400], [1, 0]);

	return (
		<section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-[#020617]">
			{/* Animated Background Gradients */}
			<div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
			<div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 blur-[100px] rounded-full" />

			<div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 relative z-10 w-full">
				<div className="lg:col-span-7 space-y-8">
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs font-bold uppercase tracking-[0.2em]"
					>
						<span className="w-2 h-2 rounded-full bg-primary animate-ping" />
						Edge-to-Edge Logistics Control
					</motion.div>

					<motion.h1
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1, duration: 0.8 }}
						className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter"
					>
						FUTURE <br />
						<span className="text-primary italic font-serif serif">CARGO</span> <br />
						SYSTEMS.
					</motion.h1>

					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="text-xl text-slate-400 max-w-xl leading-relaxed font-medium"
					>
						Enterprise-grade logistics infrastructure powered by real-time intelligence.
						Specializing in the Delhi-Imphal supply chain corridor for over two decades.
					</motion.p>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="flex flex-wrap gap-4 pt-4"
					>
						<Button size="xl" className="h-16 px-10 rounded-2xl text-lg font-bold">
							Initiate Booking <ArrowRight className="ml-3 h-5 w-5" />
						</Button>
						<Button size="xl" variant="outline" className="h-16 px-10 rounded-2xl text-lg font-bold border-white/10 text-white hover:bg-white/5">
							Network Map
						</Button>
					</motion.div>
				</div>

				<div className="lg:col-span-5 relative hidden lg:block">
					<motion.div style={{ y: y1, opacity }} className="relative">
						<div className="relative z-10 rounded-[3rem] overflow-hidden border border-white/10 bg-slate-900 aspect-[4/5] shadow-2xl">
							<video
								autoPlay
								loop
								muted
								playsInline
								className="w-full h-full object-cover opacity-60 mix-blend-luminosity"
							>
								<source src="https://v0.one/storage/v1/object/public/videos/cargo-truck-night.mp4" type="video/mp4" />
							</video>

							<div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-slate-950 to-transparent">
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<p className="text-primary font-black uppercase tracking-widest text-xs">Live Ops</p>
										<div className="flex gap-1">
											{[1, 2, 3].map(i => (
												<div key={i} className="w-1 h-1 rounded-full bg-primary" />
											))}
										</div>
									</div>
									<h3 className="text-2xl font-bold text-white">Route X-04 Status</h3>
									<div className="grid grid-cols-2 gap-4">
										<div className="bg-white/5 p-3 rounded-xl border border-white/5">
											<p className="text-[10px] text-slate-500 uppercase font-black mb-1">Temp</p>
											<p className="text-white font-mono text-lg">-4°C</p>
										</div>
										<div className="bg-white/5 p-3 rounded-xl border border-white/5">
											<p className="text-[10px] text-slate-500 uppercase font-black mb-1">Load</p>
											<p className="text-white font-mono text-lg">94%</p>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Floating Element */}
						<motion.div
							animate={{ y: [0, -20, 0] }}
							transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
							className="absolute -right-8 top-20 z-20 bg-primary p-6 rounded-3xl shadow-3xl shadow-primary/40 text-black"
						>
							<Package className="h-8 w-8 mb-2" />
							<p className="text-xs uppercase font-black tracking-widest opacity-80">Pending</p>
							<p className="text-2xl font-black">2.4k</p>
						</motion.div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}

function Services() {
	const services = [
		{
			title: "Heavy-Haul Network",
			description: "Industrial strength transport for machinery and raw materials with specialized flatbed fleets.",
			icon: Truck,
			color: "blue",
		},
		{
			title: "Critical Cold Chain",
			description: "Temperature controlled environments for high-value pharma and perishables with 24/7 monitoring.",
			icon: Zap,
			color: "amber",
		},
		{
			title: "Secure Last Mile",
			description: "Precise urban distribution with armored delivery vehicles and signature-encrypted tracking.",
			icon: ShieldCheck,
			color: "emerald",
		},
	];

	return (
		<section id="services" className="py-32 bg-background">
			<div className="max-w-7xl mx-auto px-6">
				<SectionHeading
					badge="Capabilities"
					title="Industrial Logistics. Redefined."
					description="We combine operational excellence with technical innovation to solve the cargo industry's toughest challenges."
				/>

				<div className="grid md:grid-cols-3 gap-8">
					{services.map((s, i) => (
						<motion.div
							key={i}
							whileHover={{ y: -10 }}
							className="group relative p-10 rounded-[3rem] bg-muted/50 border border-border/60 hover:border-primary/40 transition-all duration-500"
						>
							<div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
								<s.icon className="h-8 w-8" />
							</div>
							<h3 className="text-2xl font-bold mb-4">{s.title}</h3>
							<p className="text-muted-foreground leading-relaxed mb-6">
								{s.description}
							</p>
							<Link href="#" className="inline-flex items-center text-sm font-black uppercase tracking-widest text-primary gap-2 hover:gap-4 transition-all">
								Details <MoveRight className="h-4 w-4" />
							</Link>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}

function Tracking() {
	return (
		<section id="track" className="py-32 bg-slate-950 relative overflow-hidden">
			{/* Scanline Effect */}
			<div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,163,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none z-10" />

			<div className="max-w-7xl mx-auto px-6 relative z-20">
				<div className="grid lg:grid-cols-2 gap-20 items-center">
					<div className="space-y-8">
						<SectionHeading
							badge="Real-time Engine"
							title="Know exactly where your cargo is 24/7."
							description="Enter your consignment ID below to access the deep-tracking dashboard featuring GPS positioning, temperature logs, and estimated arrival."
						/>

						<div className="relative group p-1.5 rounded-3xl bg-white/5 border border-white/10 focus-within:border-primary/50 transition-all duration-500">
							<Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-500 group-focus-within:text-primary transition-colors" />
							<input
								type="text"
								placeholder="Consignment Ref..."
								className="w-full h-16 pl-16 pr-44 bg-transparent border-none focus:ring-0 text-white text-lg font-mono placeholder:text-slate-600"
							/>
							<Button className="absolute right-1.5 top-1.5 bottom-1.5 px-8 rounded-2xl font-black uppercase tracking-widest">
								Track NOW
							</Button>
						</div>

						<div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
							<div className="space-y-1">
								<p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Global Reach</p>
								<p className="text-4xl font-bold text-white tracking-tighter">110+</p>
								<p className="text-sm text-slate-400">Hub locations</p>
							</div>
							<div className="space-y-1">
								<p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Throughput</p>
								<p className="text-4xl font-bold text-white tracking-tighter">240k</p>
								<p className="text-sm text-slate-400">Containers/Year</p>
							</div>
						</div>
					</div>

					<div className="relative">
						<div className="rounded-[4rem] overflow-hidden border border-white/10 shadow-3xl bg-slate-900 group">
							<Image
								src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=2000"
								alt="Control center"
								width={1000}
								height={1200}
								className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-700"
							/>

							<div className="absolute inset-0 flex items-center justify-center">
								<motion.div
									animate={{ scale: [1, 1.1, 1] }}
									transition={{ duration: 2, repeat: Infinity }}
									className="w-24 h-24 rounded-full bg-primary/20 backdrop-blur-3xl border border-primary/40 flex items-center justify-center"
								>
									<div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-2xl shadow-primary">
										<Zap className="h-6 w-6 text-black" />
									</div>
								</motion.div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

function Contact() {
	return (
		<section id="contact" className="py-32 bg-background">
			<div className="max-w-3xl mx-auto px-6 text-center space-y-10">
				<h2 className="text-5xl font-black tracking-tighter">READY TO SHIP?</h2>
				<p className="text-xl text-muted-foreground leading-relaxed">
					Connect with our logistics engineers to build a custom supply chain
					solution for your enterprise. Rapid response guaranteed.
				</p>
				<div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
					<Button size="xl" className="w-full sm:w-auto px-12 h-16 text-lg font-black rounded-2xl">
						Connect with Sales
					</Button>
					<Button size="xl" variant="outline" className="w-full sm:w-auto px-12 h-16 text-lg font-black rounded-2xl border-border">
						Documentation
					</Button>
				</div>
			</div>
		</section>
	);
}

function Footer() {
	return (
		<footer className="py-20 bg-background border-t">
			<div className="max-w-7xl mx-auto px-6">
				<div className="grid md:grid-cols-4 gap-12 mb-20">
					<div className="space-y-6">
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
								<Truck className="text-primary-foreground h-5 w-5" />
							</div>
							<span className="text-xl font-bold tracking-tighter">TAPAN</span>
						</div>
						<p className="text-muted-foreground text-sm leading-relaxed">
							Enterprise logistics infrastructure for the next generation of trade.
						</p>
					</div>

					<div className="space-y-6">
						<h4 className="font-bold text-sm tracking-widest uppercase">Network</h4>
						<ul className="space-y-4 text-sm text-muted-foreground">
							<li><Link href="#" className="hover:text-primary transition-colors">Route Map</Link></li>
							<li><Link href="#" className="hover:text-primary transition-colors">Hub Locations</Link></li>
							<li><Link href="#" className="hover:text-primary transition-colors">Fleet Stats</Link></li>
						</ul>
					</div>

					<div className="space-y-6">
						<h4 className="font-bold text-sm tracking-widest uppercase">Company</h4>
						<ul className="space-y-4 text-sm text-muted-foreground">
							<li><Link href="#" className="hover:text-primary transition-colors">About Ops</Link></li>
							<li><Link href="#" className="hover:text-primary transition-colors">Security Specs</Link></li>
							<li><Link href="#" className="hover:text-primary transition-colors">Support Portal</Link></li>
						</ul>
					</div>

					<div className="space-y-6">
						<h4 className="font-bold text-sm tracking-widest uppercase">Legal</h4>
						<ul className="space-y-4 text-sm text-muted-foreground">
							<li><Link href="#" className="hover:text-primary transition-colors">Terms of Op</Link></li>
							<li><Link href="#" className="hover:text-primary transition-colors">Privacy Shield</Link></li>
							<li><Link href="#" className="hover:text-primary transition-colors">Compliance</Link></li>
						</ul>
					</div>
				</div>

				<div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t">
					<p className="text-sm text-muted-foreground font-medium">© 2026 Tapan Associate S&L. All rights reserved.</p>
					<div className="flex items-center gap-6">
						<div className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-primary/5 transition-colors cursor-pointer">
							<Globe className="h-4 w-4" />
						</div>
						<div className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-primary/5 transition-colors cursor-pointer">
							<ShieldCheck className="h-4 w-4" />
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}

// --- Main Component ---

export function Landing2025() {
	const servicesRef = useRef<HTMLElement>(null);
	const trackRef = useRef<HTMLElement>(null);
	const contactRef = useRef<HTMLElement>(null);

	return (
		<div className="bg-background text-foreground selection:bg-primary/20 selection:text-primary antialiased font-sans">
			<Navbar />
			<main>
				<Hero />
				<section ref={servicesRef}>
					<Services />
				</section>
				<section ref={trackRef}>
					<Tracking />
				</section>
				<section ref={contactRef}>
					<Contact />
				</section>
			</main>
			<Footer />
		</div>
	);
}
