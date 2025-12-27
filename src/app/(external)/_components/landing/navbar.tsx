"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { TacLogo } from "@/components/ui/tac-logo";
import { cn } from "@/lib/utils";

export function Navbar() {
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 20);
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<div className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full pointer-events-none">
			<nav
				className={cn(
					"pointer-events-auto flex items-center justify-between px-6 md:px-12 py-4 transition-all duration-300 w-full border-b",
					scrolled
						? "bg-background border-border shadow-2xl"
						: "bg-background/0 border-transparent",
				)}
			>
				{/* Brand */}
				<div className="flex items-center gap-4">
					<Link
						href="/"
						className="group flex items-center gap-2"
						aria-label="Tapan Associate Cargo - Home"
					>
						<TacLogo className="h-10 transition-transform group-hover:skew-x-[-5deg]" />
					</Link>
				</div>

				{/* Links (Desktop) */}
				<div className="hidden md:flex items-center gap-10">
					{["About", "Services", "Network", "Track"].map((item) => (
						<Link
							key={item}
							href={`#${item.toLowerCase()}`}
							className="text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors font-mono"
						>
							{item}
						</Link>
					))}
				</div>

				{/* Actions */}
				<div className="flex items-center gap-4">
					<ThemeToggle />
					<Link href="/login" className="hidden sm:block">
						<Button
							variant="ghost"
							size="sm"
							className="font-mono font-bold uppercase text-xs tracking-wider rounded-none hover:bg-primary hover:text-black"
						>
							Portal
						</Button>
					</Link>
					<Button
						size="sm"
						asChild
						className="rounded-none px-6 font-bold uppercase tracking-wider bg-primary hover:bg-white text-black hover:text-black border border-transparent hover:border-black transition-all skew-x-[-10deg]"
					>
						<Link href="/quote">
							<span className="skew-x-[10deg]">Get Quote</span>
						</Link>
					</Button>
				</div>
			</nav>
		</div>
	);
}
