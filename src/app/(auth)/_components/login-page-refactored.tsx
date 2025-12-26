"use client";

import * as Sentry from "@sentry/nextjs";
import { motion, useReducedMotion } from "framer-motion";
import {
	ArrowRight,
	Loader2,
	Lock,
	Mail,
	MapPin,
	RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
	LoginSuccessToast,
	useLoginSuccessToast,
} from "@/components/auth/login-success-toast";
import { LoginVisualPanel } from "@/components/auth/login-visual-panel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MorphicNavbar } from "@/components/ui/morphic-navbar";
import { GridPattern } from "@/components/ui/grid-pattern";
import {
	clearLocationCache,
	type DetectedLocation,
	detectUserLocation,
} from "@/lib/location-service";
import { supabase } from "@/lib/supabaseClient";
import type { LocationScope } from "@/types/auth";

export function LoginPageRefactored() {
	const [email, setEmail] = useState("admin@tapango.logistics");
	const [password, setPassword] = useState("Test@1498");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selectedScope, setSelectedScope] = useState<LocationScope>("imphal");
	const [scopeManuallySet, setScopeManuallySet] = useState(false);
	const [detectingLocation, setDetectingLocation] = useState(false);
	const [detectedLocation, setDetectedLocation] =
		useState<DetectedLocation | null>(null);
	const loginToast = useLoginSuccessToast();
	const router = useRouter();
	const _shouldReduceMotion = useReducedMotion();

	// Load stored preference from localStorage
	useEffect(() => {
		try {
			const stored = localStorage.getItem("tapango-location-scope");
			if (stored === "imphal" || stored === "newdelhi" || stored === "all") {
				setSelectedScope(stored as LocationScope);
				setScopeManuallySet(true);
			}
		} catch {
			// Ignore storage errors
		}
	}, []);

	// Auto-detect location based on IP using ipapi.co
	useEffect(() => {
		// Skip if user has manually set scope or has stored preference
		if (scopeManuallySet) return;

		const detectLocation = async () => {
			setDetectingLocation(true);
			try {
				const location = await detectUserLocation();
				if (location) {
					setDetectedLocation(location);
					setSelectedScope(location.scope);
				}
			} catch (error) {
				console.warn("Failed to auto-detect location:", error);
			} finally {
				setDetectingLocation(false);
			}
		};

		// Delay slightly to avoid blocking initial render
		const timeoutId = setTimeout(detectLocation, 500);
		return () => clearTimeout(timeoutId);
	}, [scopeManuallySet]);

	// Handler for re-detecting location
	const handleAutoDetect = async () => {
		setScopeManuallySet(false);
		setDetectingLocation(true);
		clearLocationCache();
		try {
			const location = await detectUserLocation(true);
			if (location) {
				setDetectedLocation(location);
				setSelectedScope(location.scope);
			}
		} catch (error) {
			console.warn("Failed to auto-detect location:", error);
		} finally {
			setDetectingLocation(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		Sentry.addBreadcrumb({
			category: "auth.login",
			message: "User submitted login form",
			level: "info",
			data: { scope: selectedScope },
		});

		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email: email.trim(),
				password,
			});

			if (error || !data.session) {
				setError(error?.message || "Invalid email or password");
				setLoading(false);
				return;
			}

			// Store location preference
			try {
				if (typeof localStorage !== "undefined") {
					localStorage.setItem("tapango-location-scope", selectedScope);
					if (selectedScope !== "all") {
						localStorage.setItem("tapango-user-home-location", selectedScope);
					}
				}
			} catch (_e) {
				// Ignore
			}

			// Get location display info
			const locationDisplay = detectedLocation
				? `${detectedLocation.city || detectedLocation.region}, ${detectedLocation.country}`
				: selectedScope === "imphal"
					? "Imphal, India"
					: "New Delhi, India";

			const branchDisplay =
				selectedScope === "imphal"
					? "Imphal (IMF)"
					: selectedScope === "newdelhi"
						? "New Delhi (DEL)"
						: "All Locations";

			// Show success toast
			loginToast.showToast(email, locationDisplay, branchDisplay);

			// Delay redirect to show toast animation
			Sentry.addBreadcrumb({
				category: "auth.login",
				message: "Login successful",
				level: "info",
				data: { scope: selectedScope },
			});

			setTimeout(() => {
				router.push("/dashboard");
				router.refresh();
			}, 2000);
		} catch (err) {
			console.error("Login error", err);
			Sentry.captureException(err, {
				tags: { component: "login-page", operation: "auth.signInWithPassword" },
			});
			setError("Something went wrong while signing in");
			setLoading(false);
		}
	};

	return (
		<>
			{/* Login Success Toast */}
			<LoginSuccessToast
				isVisible={loginToast.isVisible}
				userName={loginToast.userName}
				location={loginToast.location}
				branchName={loginToast.branchName}
				onClose={loginToast.hideToast}
				duration={4000}
			/>

			<div className="min-h-screen w-full bg-background text-foreground flex flex-col relative overflow-hidden selection:bg-primary/20 selection:text-primary">
				{/* Premium Background Mesh */}
				<div className="absolute inset-0 z-0 pointer-events-none">
					<div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-primary/5 rounded-full blur-[120px]" />
					<div className="absolute bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-primary/5 rounded-full blur-[100px]" />
					<GridPattern
						width={40}
						height={40}
						x={-1}
						y={-1}
						className="opacity-[0.03]"
					/>
				</div>

				<MorphicNavbar mode="login" />

				<div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10 pt-24">
					<motion.div
						initial={{ opacity: 0, scale: 0.98 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.5, ease: "easeOut" }}
						className="w-full max-w-[1100px]"
					>
						<Card className="grid lg:grid-cols-2 overflow-hidden rounded-[2.5rem] border-border shadow-2xl bg-card h-[700px] ring-1 ring-border/10">
							{/* Left: Animation Panel */}
							<div className="relative hidden lg:flex flex-col border-r border-border/10">
								<div className="absolute inset-0">
									<LoginVisualPanel />
								</div>

								{/* Overlay: Floating Glass Card */}
								<div className="absolute bottom-6 left-6 right-6 z-20">
									<div className="bg-background/20 border border-border p-6 rounded-2xl shadow-xl">
										<h3 className="text-xl font-bold tracking-tight mb-2 text-foreground">
											Secure Logistics Platform
										</h3>
										<p className="text-muted-foreground text-sm leading-relaxed">
											Manage your Imphal-Delhi shipments with real-time tracking
											and enterprise-grade security.
										</p>
									</div>
								</div>
							</div>

							{/* Right: Login Form */}
							<div className="flex flex-col justify-center p-8 md:p-12 lg:p-16 h-full relative">
								<div className="max-w-md w-full mx-auto space-y-8">
									<div className="space-y-2 text-center lg:text-left">
										<h1 className="text-3xl font-bold tracking-tight">
											Welcome back
										</h1>
										<p className="text-muted-foreground">
											Enter your credentials to access the workspace.
										</p>
									</div>

									<form onSubmit={handleSubmit} className="space-y-6">
										{/* Auto-detected location badge - clean and minimal */}
										{(detectedLocation || detectingLocation) && (
											<div className="flex items-center justify-between px-4 py-3 bg-primary/5 border border-primary/10 rounded-xl">
												<div className="flex items-center gap-2">
													<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
														<MapPin className="h-4 w-4 text-primary" />
													</div>
													<div>
														{detectingLocation ? (
															<div className="flex items-center gap-2">
																<Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
																<span className="text-sm text-muted-foreground">
																	Detecting location...
																</span>
															</div>
														) : detectedLocation ? (
															<>
																<p className="text-sm font-medium">
																	{detectedLocation.city ||
																		detectedLocation.region}
																	, {detectedLocation.country}
																</p>
																<p className="text-xs text-muted-foreground">
																	Branch:{" "}
																	{selectedScope === "imphal"
																		? "Imphal (IMF)"
																		: selectedScope === "newdelhi"
																			? "New Delhi (DEL)"
																			: "All Locations"}
																</p>
															</>
														) : null}
													</div>
												</div>
												{!detectingLocation && (
													<button
														type="button"
														onClick={handleAutoDetect}
														className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
													>
														<RefreshCw className="h-3 w-3" />
														Refresh
													</button>
												)}
											</div>
										)}

										<div className="space-y-4">
											<div className="space-y-2">
												<Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
													Email
												</Label>
												<div className="relative">
													<Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
													<Input
														type="email"
														className="pl-11 h-12 bg-background border-input focus:ring-2 focus:ring-primary/20 transition-all text-base"
														placeholder="name@tapango.logistics"
														value={email}
														onChange={(e) => setEmail(e.target.value)}
														required
													/>
												</div>
											</div>

											<div className="space-y-2">
												<div className="flex items-center justify-between">
													<Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
														Password
													</Label>
													<Link
														href="#"
														className="text-xs text-primary font-medium hover:underline"
													>
														Forgot password?
													</Link>
												</div>
												<div className="relative">
													<Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
													<Input
														type="password"
														className="pl-11 h-12 bg-background border-input focus:ring-2 focus:ring-primary/20 transition-all text-base tracking-widest"
														placeholder="••••••••"
														value={password}
														onChange={(e) => setPassword(e.target.value)}
														required
													/>
												</div>
											</div>
										</div>

										{error && (
											<div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium flex items-center gap-2">
												<div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
												{error}
											</div>
										)}

										<Button
											size="xl"
											type="submit"
											disabled={loading}
											className="w-full text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300"
										>
											{loading ? (
												<Loader2 className="h-5 w-5 animate-spin" />
											) : (
												<>
													Sign In <ArrowRight className="ml-2 h-5 w-5" />
												</>
											)}
										</Button>
									</form>

									<p className="text-center text-sm text-muted-foreground">
										Don't have an account?{" "}
										<Link
											href="#"
											className="font-bold text-foreground hover:text-primary transition-colors"
										>
											Contact Admin
										</Link>
									</p>
								</div>
							</div>
						</Card>
					</motion.div>
				</div>
			</div>
		</>
	);
}
