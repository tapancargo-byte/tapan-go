import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-primary/90",
				destructive:
					"bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
				outline:
					"border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
				secondary:
					"bg-secondary text-secondary-foreground hover:bg-secondary/80",
				ghost:
					"hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
				link: "text-primary underline-offset-4 hover:underline",
				// Enhanced variants for logistics domain
				success:
					"bg-success text-success-foreground hover:bg-success/90 focus-visible:ring-success/20",
				warning:
					"bg-warning text-warning-foreground hover:bg-warning/90 focus-visible:ring-warning/20",
				info: "bg-info text-info-foreground hover:bg-info/90 focus-visible:ring-info/20",
			},
			size: {
				default: "h-10 px-4 py-2 has-[>svg]:px-3",
				sm: "h-9 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
				lg: "h-11 rounded-md px-6 has-[>svg]:px-4",
				xl: "h-12 rounded-lg px-8 text-base has-[>svg]:px-6",
				xs: "h-8 rounded px-2 text-xs has-[>svg]:px-1.5",
				icon: "size-10",
				"icon-sm": "size-9",
				"icon-xs": "size-8",
				"icon-lg": "size-11",
				"icon-xl": "size-12",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

type ButtonProps = React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			className,
			variant = "default",
			size = "default",
			asChild = false,
			...props
		},
		ref,
	) => {
		const Comp = asChild ? Slot : "button";

		return (
			<Comp
				ref={ref}
				data-slot="button"
				data-variant={variant}
				data-size={size}
				className={cn(buttonVariants({ variant, size, className }))}
				{...props}
			/>
		);
	},
);

Button.displayName = "Button";

export { Button, buttonVariants };
