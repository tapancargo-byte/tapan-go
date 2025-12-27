"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	Activity,
	ArrowRight,
	Cpu,
	Globe,
	Hash,
	Home,
	Lock,
	Plane,
	ShieldCheck,
	Ship,
	TerminalSquare,
	User,
	X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// --- Types ---
type LoginState =
	| "LANDING"
	| "LOGIN_MODAL"
	| "BOOT_SEQUENCE"
	| "CHAT_INTERFACE";

export function LoginPageMatrix() {
	const router = useRouter();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [loginState, setLoginState] = useState<LoginState>("LANDING");

	// Prefill credentials
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Matrix Rain Effect
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const resizeCanvas = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};

		resizeCanvas();
		window.addEventListener("resize", resizeCanvas);

		const katakana = "010101XYTAPANCARGO";
		const latin = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		const nums = "0123456789";
		const alphabet = katakana + latin + nums;
		const fontSize = 14;
		const columns = canvas.width / fontSize;
		const drops = Array(Math.floor(columns)).fill(1);

		const drawMatrix = () => {
			ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.font = `${fontSize}px monospace`;

			for (let i = 0; i < drops.length; i++) {
				const text = alphabet.charAt(
					Math.floor(Math.random() * alphabet.length),
				);
				// Matrix Style Colors: Bright Green Lead, Dark Green Trail
				ctx.fillStyle = Math.random() > 0.99 ? "#00FF41" : "#003B00";
				ctx.fillText(text, i * fontSize, drops[i] * fontSize);

				if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
					drops[i] = 0;
				}
				drops[i]++;
			}
		};

		const intervalId = setInterval(drawMatrix, 40);

		return () => {
			clearInterval(intervalId);
			window.removeEventListener("resize", resizeCanvas);
		};
	}, []);

	// Code Stream Effect
	const [codeStreamLines, setCodeStreamLines] = useState<string[]>([
		"> CONNECTING TO IMPHAL HUB [SECURE]",
		"> SYNCING AWB DATABASE...",
		"> CONNECTION ESTABLISHED",
	]);

	useEffect(() => {
		const codes = [
			"> VERIFYING MANIFEST #8992...",
			"> FLIGHT SG-291 LANDED",
			"> UPDATE: NEW DEL - ARRIVED",
			"> SECURE HANDSHAKE: ACK",
			"> ENCRYPTING DATA STREAM...",
			"> PACKET LOSS: 0.0%",
			"> LATENCY: 14ms",
			"> NODE_SYNC: COMPLETE",
		];
		const interval = setInterval(() => {
			setCodeStreamLines((prev) => {
				const newLine = codes[Math.floor(Math.random() * codes.length)];
				return [newLine, ...prev.slice(0, 2)];
			});
		}, 1500);
		return () => clearInterval(interval);
	}, []);

	// Handle Login
	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const loginEmail = email.includes("@")
				? email
				: `${email}@tapango.logistics`;

			const { data, error } = await supabase.auth.signInWithPassword({
				email: loginEmail.trim(),
				password: password,
			});

			if (error || !data.session) {
				setError(error?.message || "ACCESS DENIED");
				setLoading(false);
				return;
			}

			setLoginState("BOOT_SEQUENCE");
		} catch (err) {
			console.error("Login error", err);
			setError("SYSTEM ERROR");
			setLoading(false);
		}
	};

	// Boot Sequence Logic
	const [bootText, setBootText] = useState("");
	const [bootProgress, setBootProgress] = useState(0);

	useEffect(() => {
		if (loginState !== "BOOT_SEQUENCE") return;

		const sequence = [
			"INITIALIZING TAC PROTOCOLS...",
			"AUTHENTICATING USER...",
			"DOWNLOADING DASHBOARD MODULES...",
			"WELCOME TO TAC NETWORK.",
		];

		let currentStep = 0;

		const runBootStep = async () => {
			if (currentStep >= sequence.length) {
				setTimeout(() => {
					router.push("/dashboard");
				}, 1000);
				return;
			}

			const text = sequence[currentStep];
			let charIndex = 0;
			setBootProgress(0);
			setBootText("");

			const typeInterval = setInterval(() => {
				charIndex++;
				setBootText(text.substring(0, charIndex));

				if (Math.random() > 0.5) {
					setBootProgress((prev) => Math.min(prev + 100 / text.length, 100));
				}

				if (charIndex >= text.length) {
					clearInterval(typeInterval);
					setBootProgress(100);
					setTimeout(() => {
						currentStep++;
						runBootStep();
					}, 800);
				}
			}, 30);
		};

		runBootStep();
	}, [loginState, router]);

	if (!mounted) return null;

	// Framer Motion Variants
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
				delayChildren: 0.3,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.8, ease: "circOut" },
		},
	};

	const letterContainerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.08,
				delayChildren: 0.5,
			},
		},
	};

	const letterVariants = {
		hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
		visible: {
			opacity: 1,
			y: 0,
			filter: "blur(0px)",
			transition: { duration: 0.2 },
		},
	};

	return (
		<div className="font-mono h-screen w-screen flex flex-col items-center justify-center relative overflow-hidden bg-black text-[#00FF41]">
			{/* Back to Home Button */}
			<Link href="/">
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 1 }}
					className="fixed top-6 left-6 z-[100]"
				>
					<motion.button
						whileHover={{
							scale: 1.05,
							boxShadow: "0 0 20px rgba(0,255,65,0.4)",
						}}
						whileTap={{ scale: 0.95 }}
						className="flex items-center gap-2 px-4 py-2 bg-black/80 border border-[#00FF41]/50 text-[#00FF41] text-xs font-bold uppercase tracking-widest hover:border-[#00FF41] transition-all group"
					>
						<Home className="w-4 h-4 group-hover:animate-pulse" />
						<span>Back to Home</span>
					</motion.button>
				</motion.div>
			</Link>
			{/* 1. Matrix Rain Canvas (Background) */}
			<canvas
				ref={canvasRef}
				className="absolute inset-0 z-0 w-full h-full block opacity-25"
			/>

			{/* 2. CRT Scanline & Grid Overlay - ENHANCED VISIBILITY */}
			{/* Added mix-blend-mode to avoid washing out text */}
			<div className="absolute inset-0 z-50 w-full h-full pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] mix-blend-multiply" />
			<div
				className="absolute inset-0 z-0 opacity-15 pointer-events-none"
				style={{
					backgroundImage:
						"linear-gradient(to right, #003B00 1px, transparent 1px), linear-gradient(to bottom, #003B00 1px, transparent 1px)",
					backgroundSize: "30px 30px",
					maskImage: "linear-gradient(to bottom, black 20%, transparent 100%)",
					WebkitMaskImage:
						"linear-gradient(to bottom, black 20%, transparent 100%)",
				}}
			/>

			{/* Heavy Vignette for CRT feel - Adjusted opacity for center visibility */}
			<div className="absolute inset-0 z-40 w-full h-full pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.7)_90%)]" />

			{/* 3. Main Landing Content */}
			<AnimatePresence mode="wait">
				{loginState === "LANDING" && (
					<motion.main
						className="relative z-20 flex flex-col items-center justify-center w-full max-w-7xl px-4 text-center space-y-10"
						variants={containerVariants}
						initial="hidden"
						animate="visible"
						exit={{
							opacity: 0,
							scale: 0.95,
							filter: "blur(10px)",
							transition: { duration: 0.5 },
						}}
					>
						{/* System Status Header */}
						<motion.div
							variants={itemVariants}
							className="w-full flex justify-between text-xs md:text-sm text-[#00FF41] opacity-90 mb-4 tracking-[0.2em] uppercase border-b border-[#003B00] pb-2 font-bold max-w-3xl mx-auto shadow-[0_1px_0_rgba(0,255,65,0.2)]"
						>
							<span className="flex items-center gap-2">
								<motion.div
									animate={{ opacity: [1, 0.4, 1] }}
									transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
									className="w-2 h-2 bg-[#00FF41] rounded-full shadow-[0_0_8px_#00FF41]"
								/>
								SYSTEM: ONLINE
							</span>
							<span className="hidden sm:inline opacity-60">
								NODE: IMPHAL_HQ_01
							</span>
							<span className="opacity-60">SECURE_NET_v9.1.5</span>
						</motion.div>

						{/* TAC Data Card Component */}
						<motion.div
							variants={itemVariants}
							className="w-full max-w-lg mx-auto"
						>
							<div className="bg-black/90 border border-[#00FF41] backdrop-blur-md p-1 relative overflow-hidden group shadow-[0_0_20px_rgba(0,255,65,0.15),inset_0_0_15px_rgba(0,255,65,0.05)]">
								{/* Decorative corners */}
								<div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#00FF41]" />
								<div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#00FF41]" />
								<div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#00FF41]" />
								<div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#00FF41]" />

								{/* Card Header */}
								<div className="bg-[#003B00]/30 p-3 flex justify-between items-center border-b border-[#00FF41]/30">
									<div className="flex items-center gap-2">
										<Globe className="w-4 h-4 text-[#00FF41]" />
										<span className="text-sm font-bold tracking-widest text-[#00FF41] drop-shadow-[0_0_5px_rgba(0,255,65,0.5)]">
											TAC NETWORK FEED
										</span>
									</div>
									<span className="text-xs text-[#00FF41] animate-pulse font-bold">
										● LIVE
									</span>
								</div>

								{/* Card Body */}
								<div className="p-4 space-y-4 text-left">
									{/* Stat Row 1 */}
									<div className="flex justify-between items-center text-xs md:text-sm">
										<span className="text-[#00FF41]/80 uppercase font-bold tracking-wider">
											Total Volume
										</span>
										<span className="text-[#00FF41] font-black tracking-wider text-lg drop-shadow-[0_0_8px_rgba(0,255,65,0.4)]">
											12,402 KGS
										</span>
									</div>
									<div className="w-full bg-[#003B00]/50 h-1.5 rounded-full overflow-hidden">
										<motion.div
											className="bg-[#00FF41] h-full shadow-[0_0_10px_#00FF41]"
											initial={{ width: "0%" }}
											animate={{ width: "85%" }}
											transition={{ duration: 1.5, delay: 1, ease: "circOut" }}
										/>
									</div>

									{/* Stat Row 2 */}
									<div className="grid grid-cols-2 gap-4 pt-2">
										<div className="border border-[#00FF41]/30 p-2.5 bg-black/60 relative overflow-hidden">
											<div className="absolute top-0 right-0 p-0.5">
												<Activity className="w-3 h-3 text-[#00FF41]/40" />
											</div>
											<div className="flex items-center gap-2 mb-1 text-[#00FF41]/70 text-[10px] uppercase font-bold tracking-wider">
												<Plane className="w-3 h-3" /> IMF - DEL
											</div>
											<div className="text-lg text-[#00FF41] font-bold tracking-tight drop-shadow-[0_0_5px_rgba(0,255,65,0.6)]">
												ON SCHEDULE
											</div>
										</div>
										<div className="border border-[#00FF41]/30 p-2.5 bg-black/60 relative overflow-hidden">
											<div className="absolute top-0 right-0 p-0.5">
												<Lock className="w-3 h-3 text-[#00FF41]/40" />
											</div>
											<div className="flex items-center gap-2 mb-1 text-[#00FF41]/70 text-[10px] uppercase font-bold tracking-wider">
												<Ship className="w-3 h-3" /> ROAD FREIGHT
											</div>
											<div className="text-lg text-[#00FF41] font-bold tracking-tight drop-shadow-[0_0_5px_rgba(0,255,65,0.6)]">
												RUNNING
											</div>
										</div>
									</div>

									{/* Code Stream */}
									<div className="text-[10px] text-[#00FF41] font-mono h-14 overflow-hidden border-t border-[#00FF41]/20 pt-2 opacity-90 font-medium leading-tight">
										{codeStreamLines.map((line, i) => (
											<motion.div
												key={`code-${line.slice(0, 10)}-${i}`}
												initial={{ opacity: 0, x: -10 }}
												animate={{ opacity: 1 - i * 0.3, x: 0 }}
												transition={{ duration: 0.3 }}
											>
												{line}
											</motion.div>
										))}
									</div>
								</div>
							</div>
						</motion.div>

						{/* Typography - Fixed Truncation using Framer Motion */}
						<motion.div variants={itemVariants} className="space-y-6 py-4">
							<motion.h1
								className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-[-0.05em] text-[#00FF41] flex flex-wrap justify-center gap-x-4 md:gap-x-6 drop-shadow-[0_0_15px_rgba(0,255,65,0.8)]"
								variants={letterContainerVariants}
								initial="hidden"
								animate="visible"
							>
								{/* Word 1: TAPAN */}
								<span className="flex">
									{Array.from("TAPAN").map((char, index) => (
										<motion.span
											key={`char-t-${char}-${index}`}
											variants={letterVariants}
										>
											{char}
										</motion.span>
									))}
								</span>
								{/* Word 2: CARGO */}
								<span className="flex">
									{Array.from("CARGO").map((char, index) => (
										<motion.span
											key={`char-c-${char}-${index}`}
											variants={letterVariants}
										>
											{char}
										</motion.span>
									))}
								</span>
								<motion.span
									animate={{ opacity: [1, 0] }}
									transition={{
										duration: 0.8,
										repeat: Infinity,
										repeatType: "reverse",
										ease: "linear",
									}}
									className="text-[#00FF41] ml-2 transform translate-y-2 md:translate-y-4 inline-block h-[0.8em] w-[0.4em] bg-[#00FF41]"
								/>
							</motion.h1>

							<motion.p
								className="text-[#00FF41] font-bold text-xs sm:text-sm md:text-base max-w-lg mx-auto uppercase tracking-[0.3em] drop-shadow-[0_0_5px_rgba(0,255,65,0.5)]"
								initial={{ opacity: 0 }}
								animate={{ opacity: 0.8 }}
								transition={{ delay: 1.5, duration: 1 }}
							>
								Tapan Associate Cargo
							</motion.p>
						</motion.div>

						{/* CTA */}
						<motion.div variants={itemVariants} className="pt-8">
							<motion.button
								type="button"
								onClick={() => setLoginState("LOGIN_MODAL")}
								whileHover={{
									scale: 1.05,
									boxShadow: "0 0 30px rgba(0,255,65,0.6)",
								}}
								whileTap={{ scale: 0.95 }}
								className="group relative px-12 py-5 bg-black/80 border-2 border-[#00FF41] text-[#00FF41] text-base md:text-lg tracking-[0.2em] uppercase transition-all duration-200 focus:outline-none overflow-hidden"
							>
								{/* Glitch overlay elements */}
								<span className="absolute inset-0 w-full h-full bg-[#00FF41]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-100" />
								<span className="absolute top-0 left-0 w-full h-[2px] bg-[#00FF41] transform -translate-x-full group-hover:animate-[scan_1.5s_linear_infinite]" />

								<span className="relative flex items-center gap-4 font-black z-10">
									<TerminalSquare className="w-5 h-5 group-hover:animate-pulse" />
									Access Portal
								</span>
							</motion.button>
						</motion.div>
					</motion.main>
				)}
			</AnimatePresence>

			{/* 5. Form Modal (Login) - With AnimatePresence */}
			<AnimatePresence>
				{loginState === "LOGIN_MODAL" && (
					<motion.div
						className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					>
						<motion.div
							className="relative w-full max-w-md bg-black border border-[#00FF41] shadow-[0_0_50px_rgba(0,255,65,0.15)]"
							initial={{ scale: 0.9, opacity: 0, y: 20 }}
							animate={{ scale: 1, opacity: 1, y: 0 }}
							exit={{ scale: 0.95, opacity: 0, y: 20 }}
							transition={{ type: "spring", stiffness: 300, damping: 30 }}
						>
							{/* Modal Header */}
							<div className="border-b border-[#00FF41]/30 p-6 flex justify-between items-center bg-[#003B00]/10">
								<h2 className="text-xl font-bold tracking-tight text-[#00FF41] flex items-center gap-2 uppercase">
									<ShieldCheck className="w-5 h-5" /> Secure Login
								</h2>
								<button
									type="button"
									onClick={() => setLoginState("LANDING")}
									className="text-[#003B00] hover:text-[#00FF41] transition-colors"
								>
									<X className="w-6 h-6" />
								</button>
							</div>

							{/* Modal Body */}
							<div className="p-8 space-y-6">
								<div className="flex items-start gap-3 bg-[#00FF41]/5 p-3 border border-[#00FF41]/20 mb-4 rounded-md">
									<div className="mt-0.5 text-[#00FF41] text-lg font-bold">
										!
									</div>
									<p className="text-xs text-[#00FF41]/80 font-medium uppercase tracking-wide leading-relaxed pt-0.5">
										Use your TAC Agent Credentials. All actions are logged.
									</p>
								</div>

								<form onSubmit={handleLogin} className="space-y-6">
									{/* Agent ID */}
									<div className="space-y-2 group">
										<label
											htmlFor="agent-id"
											className="text-[10px] font-bold uppercase tracking-wider text-[#00FF41]/70 ml-1 group-focus-within:text-[#00FF41] transition-colors"
										>
											Agent ID / Email
										</label>
										<div className="relative">
											<User className="absolute left-3 top-3.5 w-4 h-4 text-[#003B00] group-focus-within:text-[#00FF41] transition-colors" />
											<input
												id="agent-id"
												type="text"
												required
												value={email}
												onChange={(e) => setEmail(e.target.value)}
												className="w-full bg-black border border-[#003B00] text-[#00FF41] font-bold text-sm py-3.5 pl-10 pr-3 focus:border-[#00FF41] focus:ring-1 focus:ring-[#00FF41] outline-none transition-all placeholder:text-[#003B00]/50 shadow-inner"
												placeholder="AGT-001"
											/>
										</div>
									</div>

									{/* Terminal Code */}
									<div className="space-y-2 group">
										<label
											htmlFor="terminal-code"
											className="text-[10px] font-bold uppercase tracking-wider text-[#00FF41]/70 ml-1 group-focus-within:text-[#00FF41] transition-colors"
										>
											Terminal Code
										</label>
										<div className="relative">
											<Hash className="absolute left-3 top-3.5 w-4 h-4 text-[#003B00] group-focus-within:text-[#00FF41] transition-colors" />
											<input
												id="terminal-code"
												type="password"
												required
												value={password}
												onChange={(e) => setPassword(e.target.value)}
												className="w-full bg-black border border-[#003B00] text-[#00FF41] font-bold text-sm py-3.5 pl-10 pr-3 focus:border-[#00FF41] focus:ring-1 focus:ring-[#00FF41] outline-none transition-all placeholder:text-[#003B00]/50 shadow-inner"
												placeholder="••••••••"
											/>
										</div>
									</div>

									{error && (
										<motion.div
											initial={{ opacity: 0, height: 0 }}
											animate={{ opacity: 1, height: "auto" }}
											className="text-red-500 text-xs font-mono font-bold uppercase tracking-widest border border-red-900 bg-red-950/20 p-3 rounded flex items-center gap-2"
										>
											<span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
											[ERROR]: {error}
										</motion.div>
									)}

									{/* Submit Button */}
									<div className="pt-4">
										<motion.button
											type="submit"
											disabled={loading}
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
											className="w-full py-4 bg-[#00FF41] text-black font-black tracking-widest uppercase hover:bg-[#00FF41] hover:shadow-[0_0_20px_rgba(0,255,65,0.6)] transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-transparent hover:border-white"
										>
											{loading ? (
												"AUTHENTICATING..."
											) : (
												<>
													Initialize Session{" "}
													<ArrowRight className="w-5 h-5 stroke-[3px]" />
												</>
											)}
										</motion.button>
									</div>
								</form>
							</div>

							{/* Modal Footer */}
							<div className="bg-black border-t border-[#00FF41]/20 p-3 text-center">
								<span className="text-[10px] text-[#003B00] uppercase font-bold">
									TAC Logistics System © {new Date().getFullYear()}
								</span>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* 6. Boot Sequence Screen (Overlay) */}
			<AnimatePresence>
				{loginState === "BOOT_SEQUENCE" && (
					<motion.div
						className="fixed inset-0 z-[70] bg-black flex flex-col items-center justify-center font-mono"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.5 }}
					>
						<div className="w-full max-w-2xl px-8 text-left">
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								className="flex items-center gap-2 mb-4 text-[#003B00] text-xs uppercase tracking-widest font-bold opacity-70"
							>
								<Cpu className="w-4 h-4" /> Kernel Loader v2.0
							</motion.div>
							<div className="text-xl md:text-3xl text-[#00FF41] font-bold drop-shadow-[0_0_15px_rgba(0,255,65,0.6)] leading-relaxed min-h-[4rem]">
								{bootText}
								<span className="inline-block w-3 h-6 bg-[#00FF41] ml-1 animate-pulse" />
							</div>
							<div className="mt-8 w-full bg-[#003B00]/30 h-1.5 relative overflow-hidden rounded-full">
								<motion.div
									className="h-full bg-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.8)]"
									initial={{ width: "0%" }}
									animate={{ width: `${bootProgress}%` }}
									transition={{ ease: "linear", duration: 0.1 }}
								/>
							</div>
							<div className="mt-3 text-right text-[10px] text-[#003B00] font-bold tracking-wider">
								MEMORY CHECK: OK
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
