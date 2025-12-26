"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ComponentProps, ReactNode } from "react";

interface FooterSectionProps extends ComponentProps<"div"> {
	title: string;
	children: ReactNode;
}

export function FooterSection({
	title,
	children,
	className,
	...props
}: FooterSectionProps) {
	const shouldReduceMotion = useReducedMotion();

	return (
		<motion.div
			initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
			whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.5 }}
			className={className}
		>
			<div {...props}>
				<h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
					{title}
				</h3>
				<div className="space-y-3">{children}</div>
			</div>
		</motion.div>
	);
}
