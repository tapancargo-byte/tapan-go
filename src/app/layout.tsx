import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import type React from "react";
import "./globals.css";

import {
	DM_Sans,
	Inter,
	JetBrains_Mono,
	Source_Serif_4,
	Space_Grotesk,
} from "next/font/google";
import { CommandMenu } from "@/components/command-menu";
import { TapanAssociateProvider } from "@/components/layout/tapan-associate-context";
import { ThemeProvider } from "@/components/theme-provider";
import { LocationProvider } from "@/lib/location-context";
import { SignoutToastProvider } from "@/lib/signout-toast-context";

// Initialize fonts
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const sourceSerif = Source_Serif_4({
	subsets: ["latin"],
	weight: ["400", "600", "700"],
	variable: "--font-serif",
});
const spaceGrotesk = Space_Grotesk({
	subsets: ["latin"],
	variable: "--font-heading",
});
const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
});

export const metadata: Metadata = {
	title: "TAC - Tapan Associate Cargo | Enterprise Logistics Solutions",
	description:
		"Enterprise-grade cargo & logistics solutions powered by technology. Real-time tracking, AI-powered support, and seamless delivery across the globe.",
	generator: "v0.app",
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
	),
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	themeColor: "#0f172a",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${inter.variable} ${dmSans.variable} ${sourceSerif.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}
			>
				<ThemeProvider>
					<LocationProvider>
						<SignoutToastProvider>
							<TapanAssociateProvider>
								{children}
								<CommandMenu />
							</TapanAssociateProvider>
						</SignoutToastProvider>
					</LocationProvider>
				</ThemeProvider>
				<Analytics />
			</body>
		</html>
	);
}
