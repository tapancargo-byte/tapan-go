"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, MapPin, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface LoginSuccessToastProps {
	isVisible: boolean;
	userName: string;
	location: string;
	branchName: string;
	onClose: () => void;
	duration?: number;
}

export function LoginSuccessToast({
	isVisible,
	userName,
	location,
	branchName,
	onClose,
	duration = 4000,
}: LoginSuccessToastProps) {
	const [progress, setProgress] = useState(100);

	useEffect(() => {
		if (!isVisible) {
			setProgress(100);
			return;
		}

		// Start progress countdown
		const startTime = Date.now();
		const interval = setInterval(() => {
			const elapsed = Date.now() - startTime;
			const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
			setProgress(remaining);

			if (remaining <= 0) {
				clearInterval(interval);
				onClose();
			}
		}, 50);

		return () => clearInterval(interval);
	}, [isVisible, duration, onClose]);

	// Get first name for a more personal touch
	const firstName = userName.split("@")[0].split(".")[0];
	const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					initial={{ opacity: 0, y: -100, scale: 0.9, rotateX: 45 }}
					animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
					exit={{ opacity: 0, y: -50, scale: 0.95 }}
					transition={{
						type: "spring",
						damping: 25,
						stiffness: 300,
						duration: 0.6,
					}}
					className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md"
				>
					<div
						className={cn(
							"relative overflow-hidden rounded-2xl",
							"bg-card border-border shadow-2xl",
							"border border-border/50",
						)}
					>
						{/* Animated background sparkles */}
						<div className="absolute inset-0 overflow-hidden">
							<motion.div
								animate={{
									x: [0, 100, 0],
									y: [0, -50, 0],
									opacity: [0.3, 0.6, 0.3],
								}}
								transition={{
									duration: 3,
									repeat: Infinity,
									ease: "easeInOut",
								}}
								className="absolute top-0 left-1/4 w-32 h-32 bg-white/20 rounded-full blur-2xl"
							/>
							<motion.div
								animate={{
									x: [0, -80, 0],
									y: [0, 30, 0],
									opacity: [0.2, 0.5, 0.2],
								}}
								transition={{
									duration: 4,
									repeat: Infinity,
									ease: "easeInOut",
									delay: 0.5,
								}}
								className="absolute bottom-0 right-1/4 w-24 h-24 bg-white/15 rounded-full blur-xl"
							/>
						</div>

						{/* Content */}
						<div className="relative p-5">
							{/* Close button */}
							<button
								onClick={onClose}
								className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/20 transition-colors"
							>
								<X className="h-4 w-4 text-muted-foreground" />
							</button>

							<div className="flex items-start gap-4">
								{/* Animated success icon */}
								<motion.div
									initial={{ scale: 0, rotate: -180 }}
									animate={{ scale: 1, rotate: 0 }}
									transition={{
										type: "spring",
										damping: 15,
										stiffness: 200,
										delay: 0.2,
									}}
									className="relative"
								>
									<div className="w-14 h-14 rounded-full bg-chart-2/10 flex items-center justify-center">
										<CheckCircle2 className="h-8 w-8 text-chart-2" />
									</div>
									{/* Sparkle decorations */}
									<motion.div
										initial={{ scale: 0, opacity: 0 }}
										animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
										transition={{ delay: 0.5, duration: 0.4 }}
										className="absolute -top-1 -right-1"
									>
										<Sparkles className="h-5 w-5 text-chart-3" />
									</motion.div>
								</motion.div>

								{/* Text content */}
								<div className="flex-1 min-w-0">
									<motion.div
										initial={{ opacity: 0, x: 20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: 0.3, duration: 0.4 }}
									>
										<h3 className="text-lg font-bold text-foreground mb-0.5">
											Welcome back, {displayName}! 🎉
										</h3>
										<p className="text-muted-foreground text-sm font-medium mb-2">
											Login successful — redirecting to dashboard
										</p>
									</motion.div>

									{/* Location badge */}
									<motion.div
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.5, duration: 0.4 }}
										className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/50"
									>
										<MapPin className="h-3.5 w-3.5 text-accent-foreground" />
										<span className="text-xs font-medium text-accent-foreground">
											{location} • {branchName}
										</span>
									</motion.div>
								</div>
							</div>
						</div>

						{/* Animated progress bar */}
						<div className="h-1 bg-muted">
							<motion.div
								className="h-full bg-chart-2/40"
								initial={{ width: "100%" }}
								animate={{ width: `${progress}%` }}
								transition={{ duration: 0.05 }}
							/>
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

// Hook for easy usage
export function useLoginSuccessToast() {
	const [toastState, setToastState] = useState<{
		isVisible: boolean;
		userName: string;
		location: string;
		branchName: string;
	}>({
		isVisible: false,
		userName: "",
		location: "",
		branchName: "",
	});

	const showToast = (
		userName: string,
		location: string,
		branchName: string,
	) => {
		setToastState({
			isVisible: true,
			userName,
			location,
			branchName,
		});
	};

	const hideToast = () => {
		setToastState((prev) => ({ ...prev, isVisible: false }));
	};

	return {
		...toastState,
		showToast,
		hideToast,
	};
}
