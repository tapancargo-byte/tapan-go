"use client";

import {
	Activity,
	ChevronRight,
	Container,
	Github,
	Globe,
	Linkedin,
	Search,
	ShieldCheck,
	Terminal,
	Timer,
	Truck,
	Twitter,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// --- Components ---

function Header() {
	return (
		<header className="fixed top-0 w-full z-40 border-b border-white/5 bg-[#000205]/80 backdrop-blur-xl">
			<div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
				<div className="flex items-center gap-2 group cursor-pointer">
					<div className="relative w-6 h-6 flex items-center justify-center overflow-hidden rounded bg-gradient-to-tr from-blue-600 to-indigo-600">
						<div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
						<span className="relative font-bold text-[10px] text-white">T</span>
					</div>
					<span className="font-medium tracking-tight text-sm text-gray-200">
						TAC Systems
					</span>
				</div>

				<nav className="hidden md:flex items-center gap-1 p-1 bg-white/5 rounded-full border border-white/5 backdrop-blur-md">
					<Link
						href="#overview"
						className="px-4 py-1.5 text-xs text-white bg-white/10 rounded-full shadow-sm border border-white/5 transition-all"
					>
						Overview
					</Link>
					<Link
						href="#fleet"
						className="px-4 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
					>
						Fleet
					</Link>
					<Link
						href="#network"
						className="px-4 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
					>
						Network
					</Link>
				</nav>

				<div className="flex items-center gap-3">
					<Link
						href="/login"
						className="text-xs text-gray-400 hover:text-white transition-colors"
					>
						Sign in
					</Link>
					<Link
						href="#track-consignment"
						className="bg-white text-black hover:bg-gray-200 px-3 py-1.5 rounded text-xs font-semibold tracking-tight transition-all shadow-[0_0_15px_rgba(255,255,255,0.3)]"
					>
						Track Cargo
					</Link>
				</div>
			</div>
		</header>
	);
}

function HeroSection() {
	return (
		<section className="relative max-w-[1200px] mx-auto px-6 z-10 pt-32 pb-12">
			{/* Background Grid Effect - simplified as inline SVG pattern or CSS utility */}
			<div className="absolute inset-0 -top-20 -z-10 h-[800px] w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(circle_at_center,black_40%,transparent_100%)]"></div>

			<div className="flex flex-col items-center text-center mb-16">
				<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-medium text-blue-400 mb-6 animate-in slide-in-from-bottom-4 fade-in duration-700">
					<span className="relative flex h-2 w-2">
						<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
						<span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
					</span>
					Live Network Status: Operational
				</div>

				<h1 className="text-5xl md:text-7xl font-semibold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50 mb-6 max-w-4xl mx-auto leading-[1.1] animate-in slide-in-from-bottom-6 fade-in duration-700 delay-100">
					Logistics for the
					<br />
					modern frontier.
				</h1>

				<p className="text-base text-gray-400 max-w-lg mx-auto font-light leading-relaxed mb-8 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200">
					Bridging the <span className="text-gray-200">Imphal — New Delhi</span>{" "}
					corridor with precision. Real-time telemetry, automated routing, and
					premium fleet management.
				</p>

				<div className="flex flex-wrap justify-center gap-3 w-full animate-in slide-in-from-bottom-10 fade-in duration-700 delay-300">
					<div className="relative group">
						<div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-200"></div>
						<Link
							href="/dashboard/shipments/new"
							className="relative bg-black border border-white/10 text-white px-8 py-3 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-white/5 transition-all"
						>
							Initialize Shipment
							<ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
						</Link>
					</div>
				</div>
			</div>

			{/* Hero Visual: The HUD Dashboard */}
			<div
				className="perspective-container max-w-5xl mx-auto mt-12 relative"
				style={{ perspective: "1000px" }}
			>
				{/* Decorative Glow Behind Dashboard */}
				<div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full opacity-40 z-0"></div>

				<div
					className="group rounded-xl p-1 relative z-10 bg-[#080C14] border border-white/10 shadow-[0_0_0_1px_rgba(0,0,0,1),0_20px_40px_-20px_rgba(0,0,0,0.5)] transition-transform duration-500 hover:rotate-0 [transform-style:preserve-3d]"
					style={{ transform: "rotateX(2deg) rotateY(-2deg) rotateZ(1deg)" }}
				>
					{/* Window Controls */}
					<div className="absolute top-4 left-4 flex gap-1.5 z-20">
						<div className="w-2.5 h-2.5 rounded-full bg-white/10 border border-white/5"></div>
						<div className="w-2.5 h-2.5 rounded-full bg-white/10 border border-white/5"></div>
						<div className="w-2.5 h-2.5 rounded-full bg-white/10 border border-white/5"></div>
					</div>

					{/* Dashboard Inner */}
					<div className="bg-[#030508] rounded-lg border border-white/5 overflow-hidden h-[400px] md:h-[500px] relative">
						{/* Map Layer */}
						<div className="absolute inset-0 opacity-40">
							<svg
								className="w-full h-full"
								preserveAspectRatio="none"
								aria-hidden="true"
							>
								<pattern
									id="grid"
									width="40"
									height="40"
									patternUnits="userSpaceOnUse"
								>
									<path
										d="M 40 0 L 0 0 0 40"
										fill="none"
										stroke="rgba(255,255,255,0.05)"
										strokeWidth="1"
									/>
								</pattern>
								<rect width="100%" height="100%" fill="url(#grid)" />
							</svg>
						</div>

						{/* Route Visual */}
						<div className="absolute inset-0 flex items-center justify-center">
							<svg
								width="100%"
								height="100%"
								viewBox="0 0 800 400"
								fill="none"
								className="w-full h-full"
								aria-hidden="true"
							>
								{/* Connection Line */}
								<path
									d="M 150 250 C 300 250, 400 150, 650 150"
									stroke="url(#lineGradient)"
									strokeWidth="2"
									fill="none"
								/>
								<defs>
									<linearGradient
										id="lineGradient"
										x1="150"
										y1="250"
										x2="650"
										y2="150"
										gradientUnits="userSpaceOnUse"
									>
										<stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
										<stop offset="50%" stopColor="#3b82f6" />
										<stop offset="100%" stopColor="#818cf8" stopOpacity="0.1" />
									</linearGradient>
								</defs>

								{/* Moving Particle - implemented with CSS animation in global styles or basic translation if not using keyframes. Since we can't easily add global keyframes, we'll assume they exist or simplify. Actually, we can add a style block for component-specific keyframes or use inline styles. Let's try inline styles for the animation. */}
								<circle r="3" fill="#fff">
									<animateMotion
										dur="3s"
										repeatCount="indefinite"
										path="M 150 250 C 300 250, 400 150, 650 150"
									/>
								</circle>

								{/* Nodes */}
								<g transform="translate(150, 250)">
									<circle
										r="4"
										fill="#1e293b"
										stroke="#3b82f6"
										strokeWidth="2"
									/>
									<text
										x="-40"
										y="5"
										fill="#64748b"
										fontFamily="monospace"
										fontSize="10"
										textAnchor="end"
									>
										DELHI
									</text>
									<rect
										x="-30"
										y="15"
										width="60"
										height="20"
										rx="4"
										fill="#0f172a"
										stroke="#1e293b"
										strokeWidth="1"
									/>
									<text
										x="0"
										y="28"
										fill="#94a3b8"
										fontFamily="monospace"
										fontSize="9"
										textAnchor="middle"
									>
										HUB-01
									</text>
								</g>

								<g transform="translate(650, 150)">
									<circle
										r="4"
										fill="#1e293b"
										stroke="#818cf8"
										strokeWidth="2"
									/>
									<circle
										r="12"
										fill="none"
										stroke="#818cf8"
										strokeOpacity="0.3"
										strokeWidth="1"
										className="animate-pulse"
									/>
									<text
										x="20"
										y="5"
										fill="#64748b"
										fontFamily="monospace"
										fontSize="10"
									>
										IMPHAL
									</text>
									<rect
										x="-30"
										y="-35"
										width="60"
										height="20"
										rx="4"
										fill="#0f172a"
										stroke="#1e293b"
										strokeWidth="1"
									/>
									<text
										x="0"
										y="-22"
										fill="#94a3b8"
										fontFamily="monospace"
										fontSize="9"
										textAnchor="middle"
									>
										HUB-04
									</text>
								</g>
							</svg>
						</div>

						{/* UI Overlays */}
						{/* Top Right Stats */}
						<div className="absolute top-6 right-6 w-48 bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg p-3">
							<div className="flex items-center justify-between mb-2">
								<span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
									Active Fleet
								</span>
								<Activity className="w-3 h-3 text-green-500" />
							</div>
							<div className="space-y-2">
								<div className="flex items-center justify-between text-xs">
									<span className="text-gray-400">Trucks in Transit</span>
									<span className="font-mono text-white">42</span>
								</div>
								<div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
									<div className="h-full bg-blue-500 w-[70%]"></div>
								</div>
								<div className="flex items-center justify-between text-xs pt-1">
									<span className="text-gray-400">Efficiency</span>
									<span className="font-mono text-green-400">98.4%</span>
								</div>
							</div>
						</div>

						{/* Bottom Left Console */}
						<div className="absolute bottom-6 left-6 w-64">
							<div className="bg-black/80 backdrop-blur border border-white/10 rounded-lg overflow-hidden">
								<div className="px-3 py-2 border-b border-white/5 bg-white/5 flex items-center gap-2">
									<Terminal className="w-3 h-3 text-gray-400" />
									<span className="text-[10px] font-mono text-gray-400">
										System Log
									</span>
								</div>
								<div className="p-3 font-mono text-[9px] text-gray-500 space-y-1.5 leading-tight">
									<div className="flex gap-2">
										<span className="text-blue-500">14:02:22</span>
										<span>Route optimization complete</span>
									</div>
									<div className="flex gap-2">
										<span className="text-blue-500">14:02:24</span>
										<span className="text-white">
											Batch #8829 dispatched to IMP
										</span>
									</div>
									<div className="flex gap-2">
										<span className="text-blue-500">14:02:45</span>
										<span>Weather alert: Clear</span>
									</div>
									<div className="flex gap-2 animate-pulse">
										<span className="text-green-500">{">>"}</span>
										<span className="text-gray-300">Awaiting input...</span>
									</div>
								</div>
							</div>
						</div>

						{/* Scanning Line Animation */}
						<div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-blue-500/5 to-transparent h-[10%] w-full animate-scan z-0 top-0"></div>
					</div>
				</div>
			</div>
		</section>
	);
}

function BentoGrid() {
	return (
		<section id="about" className="py-32 relative">
			<div className="max-w-[1200px] mx-auto px-6">
				<div className="mb-12">
					<h2 className="text-2xl font-semibold text-white tracking-tight">
						System Capabilities
					</h2>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 h-auto md:h-[400px]">
					{/* Large Card: Network Map */}
					<div className="md:col-span-6 lg:col-span-8 group relative overflow-hidden rounded-2xl border border-white/10 bg-[#080C14] hover:border-white/20 transition-all duration-500">
						<div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

						<div className="absolute top-0 right-0 p-8 z-10 text-right">
							<div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center ml-auto mb-4 border border-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform duration-500">
								<Globe className="w-5 h-5" />
							</div>
							<h3 className="text-lg font-medium text-white mb-1">
								Pan-India Coverage
							</h3>
							<p className="text-xs text-gray-500 max-w-[200px] ml-auto">
								Servicing 29 states with specialized priority lanes for the
								Northeast region.
							</p>
						</div>

						{/* Abstract Visual */}
						<div className="absolute bottom-0 left-0 w-full h-[60%]">
							<svg
								width="100%"
								height="100%"
								className="opacity-30"
								aria-hidden="true"
							>
								<path
									d="M0,100 Q400,200 800,50"
									stroke="#3b82f6"
									fill="none"
									strokeWidth="1"
								/>
								<path
									d="M0,120 Q400,220 800,70"
									stroke="#3b82f6"
									fill="none"
									strokeWidth="1"
									opacity="0.5"
								/>
								<path
									d="M0,140 Q400,240 800,90"
									stroke="#3b82f6"
									fill="none"
									strokeWidth="1"
									opacity="0.2"
								/>
							</svg>
						</div>
					</div>

					{/* Small Card 1: Time */}
					<div className="md:col-span-3 lg:col-span-4 group relative overflow-hidden rounded-2xl border border-white/10 bg-[#080C14] p-8 hover:border-white/20 transition-all duration-500 flex flex-col justify-between">
						<div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

						<div>
							<div className="flex items-center justify-between mb-6">
								<Timer className="w-5 h-5 text-indigo-400" />
								<span className="text-[10px] font-mono text-gray-500 bg-white/5 px-2 py-1 rounded">
									AVG. TRANSIT
								</span>
							</div>
							<div className="text-4xl font-mono font-medium text-white tracking-tighter mb-1">
								72<span className="text-lg text-gray-500 ml-1">h</span>
							</div>
							<p className="text-xs text-gray-400">Delhi to Imphal Express</p>
						</div>

						<div className="w-full bg-white/5 h-1.5 rounded-full mt-4 overflow-hidden">
							<div className="h-full bg-indigo-500 w-[85%] rounded-full"></div>
						</div>
					</div>

					{/* Small Card 2: Security */}
					<div className="md:col-span-3 lg:col-span-4 group relative overflow-hidden rounded-2xl border border-white/10 bg-[#080C14] p-8 hover:border-white/20 transition-all duration-500">
						<div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-green-500/20 transition-colors"></div>

						<ShieldCheck className="w-5 h-5 text-green-400 mb-6" />
						<h3 className="text-lg font-medium text-white mb-2">
							Zero Loss Policy
						</h3>
						<p className="text-xs text-gray-500 leading-relaxed mb-4">
							Advanced cargo insurance and real-time monitoring ensure 100%
							safety compliance.
						</p>
						<div className="flex -space-x-2">
							<div className="w-6 h-6 rounded-full border border-[#080C14] bg-gray-800 flex items-center justify-center text-[8px] text-gray-400">
								ID
							</div>
							<div className="w-6 h-6 rounded-full border border-[#080C14] bg-gray-700 flex items-center justify-center text-[8px] text-gray-300">
								SC
							</div>
							<div className="w-6 h-6 rounded-full border border-[#080C14] bg-gray-600 flex items-center justify-center text-[8px] text-white">
								+
							</div>
						</div>
					</div>

					{/* Medium Card: Tech */}
					<div className="md:col-span-6 lg:col-span-8 group relative overflow-hidden rounded-2xl border border-white/10 bg-[#080C14] p-8 hover:border-white/20 transition-all duration-500 flex flex-row items-center justify-between">
						<div className="z-10 relative">
							<div className="inline-block px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-400 mb-3 font-mono">
								API FIRST
							</div>
							<h3 className="text-lg font-medium text-white mb-2">
								Developer Friendly
							</h3>
							<p className="text-xs text-gray-500 max-w-sm">
								Integrate TAC directly into your ERP with our robust REST API.
							</p>
						</div>

						<div className="w-[200px] h-[100px] bg-[#030508] border border-white/5 rounded-lg p-3 font-mono text-[8px] text-gray-400 relative overflow-hidden shadow-2xl transform translate-x-4 group-hover:translate-x-0 transition-transform">
							<div className="text-purple-400">POST /v1/shipments</div>
							<div className="mt-2 text-gray-500">{`{`}</div>
							<div className="pl-2">"origin": "DEL",</div>
							<div className="pl-2">"dest": "IMF",</div>
							<div className="pl-2">"weight_kg": 450</div>
							<div className="text-gray-500">{`}`}</div>
							{/* Cursor */}
							<div className="absolute bottom-3 left-8 w-1.5 h-3 bg-purple-500 animate-pulse"></div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

function ServicesSection() {
	return (
		<section id="services" className="py-24 border-t border-white/5">
			<div className="max-w-[1200px] mx-auto px-6">
				<div className="grid md:grid-cols-3 gap-8">
					{/* Service 1 */}
					<div className="group">
						<div className="w-full h-[180px] rounded-xl bg-[#080C14] border border-white/10 mb-6 overflow-hidden relative">
							<div
								className="absolute inset-0 bg-neutral-900/50 opacity-10"
								style={{
									backgroundImage:
										"radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)",
									backgroundSize: "10px 10px",
								}}
							></div>
							{/* Truck Illustration  */}
							<div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-blue-600 to-transparent opacity-20"></div>
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
									<Truck className="w-8 h-8 text-blue-500" />
								</div>
							</div>
						</div>
						<h3 className="text-base font-medium text-white mb-2 group-hover:text-blue-400 transition-colors">
							Heavy Freight (FTL)
						</h3>
						<p className="text-xs text-gray-500 leading-relaxed max-w-xs">
							Dedicated 18-wheeler fleet for bulk industrial transport.
							Machinery, raw materials, and large-scale deployment.
						</p>
					</div>

					{/* Service 2 */}
					<div className="group">
						<div className="w-full h-[180px] rounded-xl bg-[#080C14] border border-white/10 mb-6 overflow-hidden relative">
							<div
								className="absolute inset-0 bg-neutral-900/50 opacity-10"
								style={{
									backgroundImage:
										"radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)",
									backgroundSize: "10px 10px",
								}}
							></div>
							<div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-indigo-600 to-transparent opacity-20"></div>
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
									<Zap className="w-8 h-8 text-indigo-500" />
								</div>
							</div>
						</div>
						<h3 className="text-base font-medium text-white mb-2 group-hover:text-indigo-400 transition-colors">
							Express Parcel
						</h3>
						<p className="text-xs text-gray-500 leading-relaxed max-w-xs">
							Next-day priority air cargo and expedited surface transport for
							time-sensitive e-commerce deliveries.
						</p>
					</div>

					{/* Service 3 */}
					<div className="group">
						<div className="w-full h-[180px] rounded-xl bg-[#080C14] border border-white/10 mb-6 overflow-hidden relative">
							<div
								className="absolute inset-0 bg-neutral-900/50 opacity-10"
								style={{
									backgroundImage:
										"radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)",
									backgroundSize: "10px 10px",
								}}
							></div>
							<div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-gray-600 to-transparent opacity-20"></div>
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="w-16 h-16 rounded-full bg-gray-500/10 flex items-center justify-center border border-gray-500/20 group-hover:scale-110 transition-transform">
									<Container className="w-8 h-8 text-gray-400" />
								</div>
							</div>
						</div>
						<h3 className="text-base font-medium text-white mb-2 group-hover:text-gray-300 transition-colors">
							Smart Warehousing
						</h3>
						<p className="text-xs text-gray-500 leading-relaxed max-w-xs">
							IoT-enabled storage facilities in Delhi and Imphal with automated
							inventory tracking and dispatch.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}

function TrackingSection() {
	const router = useRouter();
	const [trackingId, setTrackingId] = useState("");

	const handleTrack = () => {
		if (!trackingId.trim()) return;
		router.push(`/dashboard/shipments?ref=${encodeURIComponent(trackingId)}`);
	};

	return (
		<section id="track-consignment" className="py-24 relative overflow-hidden">
			<div className="absolute inset-0 bg-[#080C14] skew-y-1 transform origin-bottom-right z-0"></div>

			<div className="max-w-[800px] mx-auto px-6 relative z-10 text-center">
				<h3 className="text-2xl font-semibold text-white mb-4">
					Track Consignment
				</h3>
				<p className="text-sm text-gray-500 mb-8">
					Enter your 12-digit Waybill Number
				</p>

				<div className="relative group max-w-lg mx-auto">
					<div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
					<div className="relative flex items-center bg-[#000205] border border-white/10 rounded-lg p-1">
						<div className="pl-4 pr-2 text-gray-500">
							<Search className="w-4 h-4" />
						</div>
						<input
							type="text"
							placeholder="TAC-8829-X-DEL"
							aria-label="Tracking Number"
							className="w-full bg-transparent text-white text-sm px-2 py-3 focus:outline-none font-mono placeholder:text-gray-700"
							value={trackingId}
							onChange={(e) => setTrackingId(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleTrack()}
						/>
						<button
							type="button"
							onClick={handleTrack}
							aria-label="Locate Consignment"
							className="bg-white hover:bg-gray-200 text-black px-6 py-2 rounded-md text-xs font-semibold transition-colors"
						>
							Locate
						</button>
					</div>
				</div>

				<div className="mt-8 flex justify-center gap-8 opacity-30 grayscale items-center">
					<span className="text-xl font-bold font-serif">GOOGLE</span>
					<span className="text-xl font-bold font-serif">AMAZON</span>
				</div>
			</div>
		</section>
	);
}

function Footer() {
	return (
		<footer className="border-t border-white/5 bg-[#000205] py-16 text-sm relative z-10">
			<div className="max-w-[1200px] mx-auto px-6">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-10">
					<div className="col-span-2 md:col-span-1">
						<div className="flex items-center gap-2 mb-6">
							<div className="w-5 h-5 bg-white rounded flex items-center justify-center">
								<span className="text-black font-bold text-[10px]">T</span>
							</div>
							<span className="font-bold text-white tracking-wide">TAC</span>
						</div>
						<p className="text-gray-600 text-xs leading-relaxed max-w-xs">
							Redefining logistics between the Capital and the Northeast through
							technology and infrastructure.
						</p>
					</div>

					<div className="flex flex-col gap-4">
						<h4 className="text-xs font-semibold text-white uppercase tracking-wider">
							Platform
						</h4>
						<Link
							href="/platform/api"
							className="text-xs text-gray-500 hover:text-white transition-colors"
						>
							Tracking API
						</Link>
						<Link
							href="/platform/partners"
							className="text-xs text-gray-500 hover:text-white transition-colors"
						>
							Partner Network
						</Link>
						<Link
							href="/platform/stats"
							className="text-xs text-gray-500 hover:text-white transition-colors"
						>
							Fleet Stats
						</Link>
					</div>

					<div className="flex flex-col gap-4">
						<h4 className="text-xs font-semibold text-white uppercase tracking-wider">
							Company
						</h4>
						<Link
							href="/about"
							className="text-xs text-gray-500 hover:text-white transition-colors"
						>
							About Us
						</Link>
						<Link
							href="/careers"
							className="text-xs text-gray-500 hover:text-white transition-colors"
						>
							Careers
						</Link>
						<Link
							href="/legal"
							className="text-xs text-gray-500 hover:text-white transition-colors"
						>
							Legal
						</Link>
					</div>

					<div className="flex flex-col gap-4">
						<h4 className="text-xs font-semibold text-white uppercase tracking-wider">
							Contact
						</h4>
						<Link
							href="mailto:hello@tac.com"
							className="text-xs text-gray-500 hover:text-white transition-colors"
						>
							hello@tac-cargo.com
						</Link>
						<span className="text-xs text-gray-600">
							New Delhi HQ
							<br />
							Imphal Regional Office
						</span>
					</div>
				</div>

				<div className="border-t border-white/5 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
					<div className="text-[10px] text-gray-600 font-mono">
						© {new Date().getFullYear()} TAPAN ASSOCIATE CARGO SYSTEMS
					</div>
					<div className="flex gap-4">
						<a
							href="https://twitter.com"
							target="_blank"
							rel="noopener noreferrer"
							className="text-gray-600 hover:text-white transition-colors"
						>
							<Twitter className="w-4 h-4" />
							<span className="sr-only">Twitter</span>
						</a>
						<a
							href="https://linkedin.com"
							target="_blank"
							rel="noopener noreferrer"
							className="text-gray-600 hover:text-white transition-colors"
						>
							<Linkedin className="w-4 h-4" />
							<span className="sr-only">LinkedIn</span>
						</a>
						<a
							href="https://github.com"
							target="_blank"
							rel="noopener noreferrer"
							className="text-gray-600 hover:text-white transition-colors"
						>
							<Github className="w-4 h-4" />
							<span className="sr-only">GitHub</span>
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}

// --- Main Component ---

export function LandingRefactored() {
	return (
		<div className="min-h-screen bg-[#000205] text-white selection:bg-blue-500/30 selection:text-white overflow-x-hidden font-sans">
			{/* Grain Texture */}
			<div
				className="fixed top-0 left-0 w-full h-full pointer-events-none z-50 opacity-[0.03]"
				style={{
					backgroundImage: `url("${NOISE_SVG}")`,
				}}
			/>

			{/* Ambient Lights */}
			<div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
			<div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

			<Header />

			<main className="relative w-full">
				<HeroSection />
				<BentoGrid />
				<ServicesSection />
				<TrackingSection />
			</main>

			<Footer />
		</div>
	);
}

const NOISE_SVG = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E`;
