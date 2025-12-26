"use client";

import { Check, Palette } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const THEME_PRESETS = [
	{ value: "default", label: "Default (TweakCN Blue)" },
	{ value: "brutalist", label: "Neo Brutalism" },
	{ value: "tangerine", label: "Tangerine" },
	{ value: "soft-pop", label: "Soft Pop" },
] as const;

type ThemePreset = (typeof THEME_PRESETS)[number]["value"];

export function ThemePresetSwitcher() {
	const [preset, setPreset] = React.useState<ThemePreset>("default");

	// On mount, read from localStorage or default
	React.useEffect(() => {
		const stored = localStorage.getItem("theme-preset") as ThemePreset | null;
		if (stored && THEME_PRESETS.some((p) => p.value === stored)) {
			setPreset(stored);
			document.documentElement.setAttribute("data-theme-preset", stored);
		}
	}, []);

	const handlePresetChange = (newPreset: ThemePreset) => {
		setPreset(newPreset);
		localStorage.setItem("theme-preset", newPreset);

		// Temporarily disable transitions for instant theme switch
		document.documentElement.classList.add("disable-transitions");
		document.documentElement.setAttribute("data-theme-preset", newPreset);

		// Re-enable transitions after a brief delay
		setTimeout(() => {
			document.documentElement.classList.remove("disable-transitions");
		}, 100);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="h-9 w-9">
					<Palette className="h-4 w-4" />
					<span className="sr-only">Switch theme preset</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-48">
				{THEME_PRESETS.map((p) => (
					<DropdownMenuItem
						key={p.value}
						onClick={() => handlePresetChange(p.value)}
						className={cn(
							"flex items-center justify-between",
							preset === p.value && "bg-accent",
						)}
					>
						<span>{p.label}</span>
						{preset === p.value && <Check className="h-4 w-4" />}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export default ThemePresetSwitcher;
