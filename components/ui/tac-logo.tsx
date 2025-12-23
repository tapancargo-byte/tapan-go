"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Box } from "lucide-react";

interface TacLogoProps {
    className?: string;
    collapsed?: boolean;
}

export function TacLogo({ className, collapsed = false }: TacLogoProps) {
    return (
        <div className={cn("flex items-center gap-3", className)}>
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20 shrink-0">
                <Box className="h-5 w-5 text-primary" />
            </div>

            {!collapsed && (
                <div className="flex flex-col justify-center">
                    <span className="font-bold text-xl leading-none tracking-tight">
                        TAC<span className="text-primary">.</span>
                    </span>
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-0.5">
                        Tapan Associate
                    </span>
                </div>
            )}
        </div>
    );
}
