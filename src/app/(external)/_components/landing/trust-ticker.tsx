"use client";

import { motion } from "framer-motion";

const stats = [
	"15+ YEARS OF EXCELLENCE",
	"99.9% ON-TIME DELIVERY",
	"ISO 9001:2015 CERTIFIED",
	"PAN-INDIA NETWORK COVERAGE",
	"24/7 SUPPORT OPERATIONS",
	"ZERO DAMAGE RECORD 2024",
	"TRUSTED BY 500+ ENTERPRISES",
];

export function TrustTicker() {
	return (
		<div className="w-full bg-primary text-primary-foreground py-4 overflow-hidden border-y border-white/10 relative z-20">
			<div className="flex whitespace-nowrap">
				<motion.div
					animate={{ x: "-50%" }}
					transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
					className="flex gap-12 items-center"
				>
					{[...stats, ...stats, ...stats, ...stats].map((item, i) => (
						<div
							key={`ticker-${item}-${i}`}
							className="flex items-center gap-12"
						>
							<span className="text-sm font-black tracking-[0.2em] font-mono uppercase opacity-90">
								{item}
							</span>
							<span className="text-primary-foreground/40 text-lg font-black">
								/
							</span>
						</div>
					))}
				</motion.div>
			</div>
		</div>
	);
}
