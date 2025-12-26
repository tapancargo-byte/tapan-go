"use client";

import {
	CreditCard,
	FileText,
	LayoutDashboard,
	Package,
	Settings,
	User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
} from "@/components/ui/command";

export function CommandMenu() {
	const [open, setOpen] = React.useState(false);
	const router = useRouter();

	React.useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((open) => !open);
			}
		};

		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, []);

	const runCommand = React.useCallback((command: () => unknown) => {
		setOpen(false);
		command();
	}, []);

	return (
		<CommandDialog open={open} onOpenChange={setOpen}>
			<CommandInput placeholder="Type a command or search..." />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>
				<CommandGroup heading="Suggestions">
					<CommandItem
						onSelect={() => runCommand(() => router.push("/dashboard"))}
					>
						<LayoutDashboard className="mr-2 h-4 w-4" />
						<span>Dashboard</span>
					</CommandItem>
					<CommandItem
						onSelect={() => runCommand(() => router.push("/invoices"))}
					>
						<FileText className="mr-2 h-4 w-4" />
						<span>Invoices</span>
					</CommandItem>
					<CommandItem
						onSelect={() => runCommand(() => router.push("/shipments"))}
					>
						<Package className="mr-2 h-4 w-4" />
						<span>Shipments</span>
					</CommandItem>
				</CommandGroup>
				<CommandSeparator />
				<CommandGroup heading="Settings">
					<CommandItem
						onSelect={() => runCommand(() => router.push("/settings"))}
					>
						<User className="mr-2 h-4 w-4" />
						<span>Profile</span>
						<CommandShortcut>⌘P</CommandShortcut>
					</CommandItem>
					<CommandItem
						onSelect={() => runCommand(() => router.push("/settings/billing"))}
					>
						<CreditCard className="mr-2 h-4 w-4" />
						<span>Billing</span>
						<CommandShortcut>⌘B</CommandShortcut>
					</CommandItem>
					<CommandItem
						onSelect={() => runCommand(() => router.push("/settings"))}
					>
						<Settings className="mr-2 h-4 w-4" />
						<span>Settings</span>
						<CommandShortcut>⌘S</CommandShortcut>
					</CommandItem>
				</CommandGroup>
			</CommandList>
		</CommandDialog>
	);
}
