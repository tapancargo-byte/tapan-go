"use client";

import { Instagram, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";
import { TacLogo } from "@/components/ui/tac-logo";

export function Footer() {
	return (
		<footer className="bg-background border-t border-border pt-24 pb-12">
			<div className="max-w-7xl mx-auto px-6">
				<div className="grid md:grid-cols-12 gap-12 mb-16">
					{/* Brand Column */}
					<div className="md:col-span-4 space-y-8">
						<div className="flex items-center gap-2">
							<TacLogo />
						</div>
						<p className="text-muted-foreground leading-relaxed font-mono text-sm max-w-xs">
							Redefining cargo logistics with precision technology and
							human-centric service since 2009.
						</p>
						<div className="flex gap-2">
							<a
								href="https://linkedin.com/company/tapan-cargo"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center justify-center rounded-none w-10 h-10 text-muted-foreground hover:text-black hover:bg-primary border border-border hover:border-primary transition-all"
								aria-label="LinkedIn"
							>
								<Linkedin className="w-4 h-4" />
							</a>
							<a
								href="https://twitter.com/tapancargo"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center justify-center rounded-none w-10 h-10 text-muted-foreground hover:text-black hover:bg-primary border border-border hover:border-primary transition-all"
								aria-label="Twitter"
							>
								<Twitter className="w-4 h-4" />
							</a>
							<a
								href="https://instagram.com/tapancargo"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center justify-center rounded-none w-10 h-10 text-muted-foreground hover:text-black hover:bg-primary border border-border hover:border-primary transition-all"
								aria-label="Instagram"
							>
								<Instagram className="w-4 h-4" />
							</a>
						</div>
					</div>

					{/* Spacer */}
					<div className="hidden md:block md:col-span-2" />

					{/* Links Columns */}
					<div className="md:col-span-2">
						<h4 className="font-bold mb-6 font-heading uppercase tracking-widest text-sm">
							Services
						</h4>
						<ul className="space-y-4 text-sm text-muted-foreground font-mono">
							<li>
								<Link
									href="/services/air"
									className="hover:text-primary transition-colors"
								>
									Air Expedite
								</Link>
							</li>
							<li>
								<Link
									href="/services/surface"
									className="hover:text-primary transition-colors"
								>
									Surface Heavy
								</Link>
							</li>
							<li>
								<Link
									href="/services/warehouse"
									className="hover:text-primary transition-colors"
								>
									Warehousing
								</Link>
							</li>
							<li>
								<Link
									href="/services/customs"
									className="hover:text-primary transition-colors"
								>
									Customs Brokerage
								</Link>
							</li>
						</ul>
					</div>

					<div className="md:col-span-2">
						<h4 className="font-bold mb-6 font-heading uppercase tracking-widest text-sm">
							Company
						</h4>
						<ul className="space-y-4 text-sm text-muted-foreground font-mono">
							<li>
								<Link
									href="/about"
									className="hover:text-primary transition-colors"
								>
									About Us
								</Link>
							</li>
							<li>
								<Link
									href="/network"
									className="hover:text-primary transition-colors"
								>
									Network Maps
								</Link>
							</li>
							<li>
								<Link
									href="/careers"
									className="hover:text-primary transition-colors"
								>
									Careers
								</Link>
							</li>
							<li>
								<Link
									href="/contact"
									className="hover:text-primary transition-colors"
								>
									Contact
								</Link>
							</li>
						</ul>
					</div>

					<div className="md:col-span-2">
						<h4 className="font-bold mb-6 font-heading uppercase tracking-widest text-sm">
							Legal
						</h4>
						<ul className="space-y-4 text-sm text-muted-foreground font-mono">
							<li>
								<Link
									href="/privacy"
									className="hover:text-primary transition-colors"
								>
									Privacy Policy
								</Link>
							</li>
							<li>
								<Link
									href="/terms"
									className="hover:text-primary transition-colors"
								>
									Terms of Carriage
								</Link>
							</li>
							<li>
								<Link
									href="/iso"
									className="hover:text-primary transition-colors"
								>
									ISO Certifications
								</Link>
							</li>
						</ul>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
					<p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
						© {new Date().getFullYear()} Tapan Associate Cargo. All rights
						reserved.
					</p>
					<div className="flex items-center gap-3 text-xs text-muted-foreground font-mono opacity-70">
						<span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
						<span className="tracking-widest">SYSTEM ONLINE</span>
					</div>
				</div>
			</div>
		</footer>
	);
}
