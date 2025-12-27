"use client";

import React from "react";
import { AboutSection } from "./landing/about-section";
import { CTA } from "./landing/cta";
import { Footer } from "./landing/footer";
import { Hero } from "./landing/hero";
import { Navbar } from "./landing/navbar";
import { NetworkMap } from "./landing/network-map";
import { Services } from "./landing/services";
import { TrackingHUD } from "./landing/tracking-hud";
import { TrustTicker } from "./landing/trust-ticker";

export function LandingRedesign() {
	return (
		<div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-black">
			<Navbar />
			<main>
				<Hero />
				<TrustTicker />
				<AboutSection />
				<Services />
				<NetworkMap />
				<TrackingHUD />
				<CTA />
			</main>
			<Footer />
		</div>
	);
}
