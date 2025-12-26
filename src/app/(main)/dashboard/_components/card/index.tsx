import type React from "react";
import { Bullet } from "@/components/ui/bullet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardCardProps
	extends Omit<React.ComponentProps<typeof Card>, "title"> {
	title: string;
	addon?: React.ReactNode;
	intent?: "default" | "success";
	children: React.ReactNode;
}

export default function DashboardCard({
	title,
	addon,
	intent = "default",
	children,
	className,
	...props
}: DashboardCardProps) {
	return (
		<Card className={className} {...props}>
			<CardHeader className="flex items-center justify-between">
				<CardTitle className="flex items-center gap-2.5">
					<Bullet variant={intent} />
					{title}
				</CardTitle>
				{addon && <div>{addon}</div>}
			</CardHeader>

			<CardContent className="flex-1 relative">{children}</CardContent>
		</Card>
	);
}
