"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClientPrintButtonProps {
	label?: string;
	className?: string;
}

export function ClientPrintButton({
	label = "Print",
	className,
}: ClientPrintButtonProps) {
	const handlePrint = () => {
		if (typeof window !== "undefined") {
			window.print();
		}
	};

	return (
		<Button onClick={handlePrint} className={className}>
			<Printer className="w-4 h-4 mr-2" />
			{label}
		</Button>
	);
}
