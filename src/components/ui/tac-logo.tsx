import React from "react";
import { cn } from "@/lib/utils";

interface TacLogoProps {
	className?: string;
}

export function TacLogo({ className }: TacLogoProps) {
	return (
		<div
			className={cn(
				"flex flex-col justify-center select-none leading-none",
				className,
			)}
		>
			<span className="font-heading font-black tracking-tighter text-3xl uppercase text-foreground">
				TAC
			</span>
			<span className="font-mono font-bold text-[0.5rem] tracking-[0.2em] uppercase text-muted-foreground">
				Tapan Associate Cargo
			</span>
		</div>
	);
}
