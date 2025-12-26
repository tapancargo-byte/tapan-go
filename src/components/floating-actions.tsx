"use client";

import {
	ArrowRight,
	Bot,
	CheckCircle2,
	Clock,
	Search,
	Send,
	Ticket,
	X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ActivePanel = "chat" | "ticket" | "track" | null;

export function FloatingActions() {
	const [activePanel, setActivePanel] = useState<ActivePanel>(null);
	const [chatMessages, setChatMessages] = useState([
		{
			role: "bot",
			message: "Hello! I'm TAC's AI assistant. How can I help you today?",
		},
	]);
	const [chatInput, setChatInput] = useState("");

	const togglePanel = (panel: ActivePanel) => {
		setActivePanel(activePanel === panel ? null : panel);
	};

	const handleSendMessage = () => {
		if (chatInput.trim()) {
			setChatMessages([
				...chatMessages,
				{ role: "user", message: chatInput },
				{
					role: "bot",
					message:
						"Thank you for your message! Our team will assist you shortly. Is there anything else I can help you with?",
				},
			]);
			setChatInput("");
		}
	};

	return (
		<>
			{/* Floating Action Buttons */}
			<div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
				{/* Quick Track */}
				<button
					onClick={() => togglePanel("track")}
					aria-label="Quick track shipment"
					className={cn(
						"w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110",
						activePanel === "track"
							? "bg-primary text-primary-foreground"
							: "bg-card text-foreground hover:shadow-xl",
					)}
				>
					<Search className="w-5 h-5" />
				</button>

				{/* Support Ticket */}
				<button
					onClick={() => togglePanel("ticket")}
					aria-label="Support tickets"
					className={cn(
						"w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110",
						activePanel === "ticket"
							? "bg-primary text-primary-foreground"
							: "bg-card text-foreground hover:shadow-xl",
					)}
				>
					<Ticket className="w-5 h-5" />
				</button>

				{/* AI Chatbot */}
				<button
					onClick={() => togglePanel("chat")}
					aria-label="AI chat assistant"
					className={cn(
						"w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110",
						activePanel === "chat"
							? "bg-primary text-primary-foreground"
							: "bg-primary text-primary-foreground hover:shadow-xl",
					)}
				>
					<Bot className="w-5 h-5" />
				</button>
			</div>

			{/* AI Chat Panel */}
			<div
				className={cn(
					"fixed bottom-24 right-6 z-50 w-[380px] bg-card rounded-2xl shadow-2xl border border-border overflow-hidden transition-all duration-300",
					activePanel === "chat"
						? "opacity-100 translate-y-0"
						: "opacity-0 translate-y-4 pointer-events-none",
				)}
			>
				<div className="bg-primary p-4 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
							<Bot className="w-5 h-5 text-primary-foreground" />
						</div>
						<div>
							<p className="text-primary-foreground font-semibold text-sm">
								TAC AI Assistant
							</p>
							<p className="text-primary-foreground/70 text-xs">
								Always here to help
							</p>
						</div>
					</div>
					<button
						onClick={() => setActivePanel(null)}
						className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
					>
						<X className="w-5 h-5" />
					</button>
				</div>
				<div className="h-80 overflow-y-auto p-4 space-y-4 bg-muted/30">
					{chatMessages.map((msg, i) => (
						<div
							key={i}
							className={cn(
								"flex",
								msg.role === "user" ? "justify-end" : "justify-start",
							)}
						>
							<div
								className={cn(
									"max-w-[80%] px-4 py-3 rounded-2xl text-sm",
									msg.role === "user"
										? "bg-primary text-primary-foreground rounded-br-sm"
										: "bg-background text-foreground rounded-bl-sm border border-border",
								)}
							>
								{msg.message}
							</div>
						</div>
					))}
				</div>
				<div className="p-4 bg-background border-t border-border">
					<div className="flex gap-2">
						<Input
							value={chatInput}
							onChange={(e) => setChatInput(e.target.value)}
							placeholder="Type your message..."
							className="rounded-xl border-border h-11"
							onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
						/>
						<Button
							onClick={handleSendMessage}
							className="bg-primary hover:bg-primary/90 rounded-xl h-11 px-4 text-primary-foreground"
						>
							<Send className="w-4 h-4" />
						</Button>
					</div>
				</div>
			</div>

			{/* Support Ticket Panel */}
			<div
				className={cn(
					"fixed bottom-24 right-6 z-50 w-[380px] bg-card rounded-2xl shadow-2xl border border-border overflow-hidden transition-all duration-300",
					activePanel === "ticket"
						? "opacity-100 translate-y-0"
						: "opacity-0 translate-y-4 pointer-events-none",
				)}
			>
				<div className="bg-primary p-4 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
							<Ticket className="h-5 w-5 text-primary-foreground" />
						</div>
						<div>
							<p className="text-primary-foreground font-semibold text-sm">
								Support Tickets
							</p>
							<p className="text-primary-foreground/70 text-xs">
								Create or view tickets
							</p>
						</div>
					</div>
					<button
						onClick={() => setActivePanel(null)}
						className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
					>
						<X className="w-5 h-5" />
					</button>
				</div>
				<div className="p-4 space-y-4">
					{/* Existing Tickets */}
					<div className="space-y-3">
						<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
							Recent Tickets
						</p>
						<div className="bg-muted/30 rounded-xl p-3 border border-border">
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm font-medium text-foreground">
									#TKT-2024
								</span>
								<span className="flex items-center gap-1 text-xs px-2 py-1 bg-chart-2/10 text-chart-2 rounded-full">
									<CheckCircle2 className="w-3 h-3" />
									Resolved
								</span>
							</div>
							<p className="text-xs text-muted-foreground">
								Delivery inquiry - Mumbai
							</p>
						</div>
						<div className="bg-muted/30 rounded-xl p-3 border border-border">
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm font-medium text-foreground">
									#TKT-2025
								</span>
								<span className="flex items-center gap-1 text-xs px-2 py-1 bg-chart-3/10 text-chart-3 rounded-full">
									<Clock className="w-3 h-3" />
									In Progress
								</span>
							</div>
							<p className="text-xs text-muted-foreground">
								International shipment status
							</p>
						</div>
					</div>

					{/* Create New Ticket */}
					<div className="pt-4 border-t border-border">
						<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
							New Ticket
						</p>
						<Input
							placeholder="Subject"
							className="rounded-xl border-border mb-3 h-11"
						/>
						<Textarea
							placeholder="Describe your issue..."
							className="rounded-xl border-border resize-none mb-3"
							rows={3}
						/>
						<Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-11">
							Submit Ticket
							<ArrowRight className="w-4 h-4 ml-2" />
						</Button>
					</div>
				</div>
			</div>

			{/* Quick Track Panel */}
			<div
				className={cn(
					"fixed bottom-24 right-6 z-50 w-[380px] bg-card rounded-2xl shadow-2xl border border-border overflow-hidden transition-all duration-300",
					activePanel === "track"
						? "opacity-100 translate-y-0"
						: "opacity-0 translate-y-4 pointer-events-none",
				)}
			>
				<div className="bg-primary p-4 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
							<Search className="w-5 h-5 text-primary-foreground" />
						</div>
						<div>
							<p className="text-primary-foreground font-semibold text-sm">
								Quick Track
							</p>
							<p className="text-primary-foreground/70 text-xs">
								Instant shipment lookup
							</p>
						</div>
					</div>
					<button
						onClick={() => setActivePanel(null)}
						className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
					>
						<X className="w-5 h-5" />
					</button>
				</div>
				<div className="p-4 space-y-4">
					<div>
						<label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
							Consignment Number
						</label>
						<Input
							placeholder="e.g., TAC-2025-12345"
							className="rounded-xl border-border h-12 text-base"
						/>
					</div>
					<Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-12">
						<Search className="w-4 h-4 mr-2" />
						Track Shipment
					</Button>
					<p className="text-xs text-center text-muted-foreground">
						Results will appear in a modal window
					</p>
				</div>
			</div>
		</>
	);
}
