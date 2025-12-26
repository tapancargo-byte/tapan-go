import { Search } from "lucide-react";
import type React from "react";

export default function SearchIcon({
	className = "w-5 h-5",
	...props
}: React.SVGProps<SVGSVGElement>) {
	return <Search className={className} {...props} />;
}
