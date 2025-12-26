"use client";

import { Box } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

interface UnifiedLogoProps {
    className?: string;
    collapsed?: boolean;
    subtext?: string;
    onClick?: () => void;
}

export function UnifiedLogo({
    className,
    collapsed = false,
    subtext = "Tapan Associate Cargo",
    onClick,
}: UnifiedLogoProps) {
    const Comp = onClick ? "button" : "div";

    return (
        <Comp
            type={onClick ? "button" : undefined}
            className={cn(
                "flex items-center gap-3 group bg-transparent border-none p-0 text-left transition-all duration-300",
                onClick && "cursor-pointer",
                className,
            )}
            onClick={onClick}
        >
            <div
                className={cn(
                    "h-11 w-11 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20 transition-all duration-300 shrink-0",
                    onClick && "group-hover:bg-primary/20",
                    collapsed && "h-10 w-10",
                )}
            >
                <Box
                    className={cn(
                        "h-6 w-6 text-primary transition-all duration-300",
                        collapsed && "h-5 w-5",
                    )}
                />
            </div>

            <div
                className={cn(
                    "flex flex-col justify-center transition-all duration-300 origin-left overflow-hidden whitespace-nowrap",
                    collapsed ? "w-0 opacity-0 scale-x-0" : "w-auto opacity-100 scale-x-100",
                )}
            >
                <span className="font-bold text-2xl leading-none tracking-tight">
                    TAC<span className="text-primary">.</span>
                </span>
                {subtext && (
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">
                        {subtext}
                    </span>
                )}
            </div>
        </Comp>
    );
}
