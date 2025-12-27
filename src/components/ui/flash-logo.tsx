"use client";

import { Zap } from "lucide-react";

export function FlashLogo({ className = "" }: { className?: string }) {
	return (
		<div className={`flex items-center gap-1 ${className}`}>
			{/* Icon: The Flash Bolt */}
			<div className="relative w-8 h-8 flex items-center justify-center bg-primary text-black transform skew-x-[-10deg]">
				<Zap className="w-5 h-5 fill-current" />
			</div>

			{/* Text: FLASH Typography */}
			<div className="flex flex-col leading-none">
				<span className="font-black italic tracking-tighter text-2xl transform skew-x-[-10deg]">
					FLASH
				</span>
			</div>
		</div>
	);
}
