"use client";

import Lottie from "lottie-react";
import { useEffect, useState } from "react";
import { UnifiedLogo } from "@/components/ui/unified-logo";
import loginAnimation from "@/public/assets/login.json";

export function LoginVisualPanel() {
	const [reduceMotion, setReduceMotion] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
		setReduceMotion(mq.matches);
		const handler = (event: MediaQueryListEvent) =>
			setReduceMotion(event.matches);
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);

	return (
		<div className="h-full w-full">
			{/* Animation container - full bleed */}
			<div className="relative h-full w-full overflow-hidden">
				<div className="relative h-full w-full bg-muted/50">
					{!reduceMotion ? (
						<div className="h-full w-full flex items-center justify-center p-8">
							<Lottie
								animationData={loginAnimation}
								loop
								autoplay
								className="w-full h-auto max-w-md"
							/>
						</div>
					) : (
						<div className="h-full w-full flex flex-col items-center justify-center px-10 text-center">
							<UnifiedLogo className="opacity-90" />
							<div className="mt-5 text-xs tracking-widest uppercase text-muted-foreground">
								Secure Corridor Operations
							</div>
							<div className="mt-2 text-2xl font-semibold text-foreground">
								Sign in to continue
							</div>
							<div className="mt-2 text-sm text-muted-foreground">
								Reduced motion is enabled on your device.
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Subtle branding text */}
			<div className="hidden" />
		</div>
	);
}
