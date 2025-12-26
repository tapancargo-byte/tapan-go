"use client";

import { Eye, EyeOff, Loader2, MapPin, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	clearLocationCache,
	type DetectedLocation,
	detectUserLocation,
} from "@/lib/location-service";
import { supabase } from "@/lib/supabaseClient";
import type { LocationScope } from "@/types/auth";

export function LoginForm() {
	const [email, setEmail] = useState("admin@tapango.logistics");
	const [password, setPassword] = useState("Test@1498");
	const [selectedScope, setSelectedScope] = useState<LocationScope>("imphal");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);
	const [scopeManuallySet, setScopeManuallySet] = useState(false);
	const [detectingLocation, setDetectingLocation] = useState(false);
	const [detectedLocation, setDetectedLocation] =
		useState<DetectedLocation | null>(null);
	const router = useRouter();

	// Auto-detect location based on IP using ipapi.co
	useEffect(() => {
		if (scopeManuallySet) return;

		const detectLocation = async () => {
			setDetectingLocation(true);
			const location = await detectUserLocation();
			if (location) {
				setDetectedLocation(location);
				setSelectedScope(location.scope);
			}
			setDetectingLocation(false);
		};

		const timeoutId = setTimeout(detectLocation, 500);
		return () => clearTimeout(timeoutId);
	}, [scopeManuallySet]);

	// Handler for re-detecting location
	const handleAutoDetect = async () => {
		setScopeManuallySet(false);
		setDetectingLocation(true);
		clearLocationCache();
		const location = await detectUserLocation(true);
		if (location) {
			setDetectedLocation(location);
			setSelectedScope(location.scope);
		}
		setDetectingLocation(false);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
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

			localStorage.setItem("tapango-location-scope", selectedScope);
			if (selectedScope !== "all") {
				localStorage.setItem("tapango-user-home-location", selectedScope);
			}

			setLoading(false);
			router.push("/dashboard");
			router.refresh();
		} catch (err) {
			console.error("Login error", err);
			setError("Something went wrong while signing in");
			setLoading(false);
		}
	};

	return (
		<form className="space-y-6" onSubmit={handleSubmit}>
			{/* Auto-detected location badge - clean and minimal */}
			{(detectedLocation || detectingLocation) && (
				<div className="flex items-center justify-between px-4 py-3 bg-primary/5 border border-primary/10 rounded-xl">
					<div className="flex items-center gap-3">
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
										{detectedLocation.city || detectedLocation.region},{" "}
										{detectedLocation.country}
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

			{/* Email */}
			<div className="space-y-2">
				<Label htmlFor="email" className="text-sm font-medium">
					Email
				</Label>
				<Input
					id="email"
					type="email"
					autoComplete="email"
					placeholder="you@company.com"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="h-11 bg-background"
				/>
			</div>

			{/* Password */}
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<Label htmlFor="password" className="text-sm font-medium">
						Password
					</Label>
					<Link
						href="/support"
						className="text-xs text-muted-foreground hover:text-primary transition-colors"
					>
						Forgot password?
					</Link>
				</div>
				<div className="relative">
					<Input
						id="password"
						type={showPassword ? "text" : "password"}
						autoComplete="current-password"
						placeholder="Enter your password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="h-11 pr-10 bg-background"
					/>
					<button
						type="button"
						onClick={() => setShowPassword((prev) => !prev)}
						className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
						aria-label={showPassword ? "Hide password" : "Show password"}
					>
						{showPassword ? (
							<EyeOff className="h-4 w-4" />
						) : (
							<Eye className="h-4 w-4" />
						)}
					</button>
				</div>
			</div>

			{/* Error */}
			{error && (
				<div className="p-3 bg-destructive/10 border border-destructive/20">
					<p className="text-sm text-destructive">{error}</p>
				</div>
			)}

			{/* Submit */}
			<Button
				type="submit"
				className="w-full h-11 font-medium"
				disabled={loading || !email.trim() || !password}
			>
				{loading ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Signing in...
					</>
				) : (
					"Sign in"
				)}
			</Button>

			{/* Demo hint - very subtle */}
		</form>
	);
}
