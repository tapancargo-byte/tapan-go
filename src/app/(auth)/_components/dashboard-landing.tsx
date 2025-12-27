"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// Dynamically import Lottie for performance
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export function DashboardAuthOverlay() {
	const [status, setStatus] = useState<"checking" | "allowed" | "denied">(
		"checking",
	);
	const [animationData, setAnimationData] = useState<object | null>(null);
	const router = useRouter();

	useEffect(() => {
		// Load animation data
		fetch(
			"https://raw.githubusercontent.com/the-m-project/tapan-cargo-clean/main/public/assets/secure-logistics.json",
		)
			.then((res) => res.json())
			.then((data) => setAnimationData(data))
			.catch((err) => {
				// biome-ignore lint/suspicious/noConsole: valid error logging
				console.error("Failed to load animation", err);
			});

		const checkSession = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (!session) {
				setStatus("denied");
				setTimeout(() => router.push("/login"), 1500);
			} else {
				setStatus("allowed");
			}
		};

		checkSession();
	}, [router]);

	if (status === "allowed") return null;

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-xl"
		>
			<div className="relative w-full max-w-md p-8 text-center space-y-6">
				{animationData ? (
					<div className="w-64 h-64 mx-auto">
						<Lottie animationData={animationData} loop={true} />
					</div>
				) : (
					<div className="w-64 h-64 mx-auto flex items-center justify-center">
						<Loader2 className="h-12 w-12 animate-spin text-primary/40" />
					</div>
				)}

				<div className="space-y-2">
					<h2 className="text-2xl font-bold tracking-tight">
						{status === "checking"
							? "Authenticating Session"
							: "Access Restricted"}
					</h2>
					<p className="text-muted-foreground">
						{status === "checking"
							? "Verifying secure logistics clearance..."
							: "Redirecting to login portal..."}
					</p>
				</div>

				<div className="flex justify-center gap-1.5">
					{[0, 1, 2].map((i) => (
						<motion.div
							key={i}
							animate={{
								scale: [1, 1.5, 1],
								opacity: [0.3, 1, 0.3],
							}}
							transition={{
								duration: 1,
								repeat: Number.POSITIVE_INFINITY,
								delay: i * 0.2,
							}}
							className="h-1.5 w-1.5 rounded-full bg-primary"
						/>
					))}
				</div>
			</div>
		</motion.div>
	);
}
