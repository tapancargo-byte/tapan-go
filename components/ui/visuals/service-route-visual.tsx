"use client";

import { motion } from "framer-motion";

export function ServiceRouteVisual() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-pop/80 dark:bg-background/80 p-4">
      {/* Abstract Map Background */}
      <svg
        className="absolute inset-0 h-full w-full text-foreground/10 dark:text-foreground/20"
        viewBox="0 0 400 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <pattern
          id="grid-pattern"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
      </svg>

      {/* Route Path */}
      <svg
        className="relative h-full w-full max-w-[300px]"
        viewBox="0 0 300 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Path Line */}
        <motion.path
          d="M 20,75 C 80,75 100,40 150,40 C 200,40 220,75 280,75"
          stroke="currentColor"
          className="text-foreground/40 dark:text-foreground/50"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Active Path Animation */}
        <motion.path
          d="M 20,75 C 80,75 100,40 150,40 C 200,40 220,75 280,75"
          stroke="#10b981" // Emerald-500
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: 1, 
            opacity: 1,
            transition: { 
              duration: 2.5, 
              ease: "easeInOut", 
              repeat: Infinity,
              repeatType: "loop",
              repeatDelay: 1 
            } 
          }}
        />

        {/* Start Node (Delhi) */}
        <g transform="translate(20, 75)">
          <circle r="6" fill="#10b981" />
          <circle r="12" stroke="#10b981" strokeWidth="1.5" opacity="0.4">
             <animate attributeName="r" values="8;16;8" dur="3s" repeatCount="indefinite" />
             <animate attributeName="opacity" values="0.6;0;0.6" dur="3s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* End Node (Imphal) */}
        <g transform="translate(280, 75)">
          <circle r="6" fill="#10b981" />
          <circle r="12" stroke="#10b981" strokeWidth="1.5" opacity="0.4">
             <animate attributeName="r" values="8;16;8" dur="3s" repeatCount="indefinite" begin="1.5s" />
             <animate attributeName="opacity" values="0.6;0;0.6" dur="3s" repeatCount="indefinite" begin="1.5s" />
          </circle>
        </g>

        {/* Moving Cargo Packet */}
        <circle
          r="8"
          fill="#10b981"
          opacity="0.18"
        >
          <animateMotion
            path="M 20,75 C 80,75 100,40 150,40 C 200,40 220,75 280,75"
            dur="2.5s"
            repeatCount="indefinite"
            rotate="auto"
          />
          <animate
            attributeName="r"
            values="6;10;6"
            dur="2.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.22;0.08;0.22"
            dur="2.5s"
            repeatCount="indefinite"
          />
        </circle>
        <circle
          r="4"
          fill="#fff"
          filter="drop-shadow(0 0 4px #10b981)"
        >
          <animateMotion
            path="M 20,75 C 80,75 100,40 150,40 C 200,40 220,75 280,75"
            dur="2.5s"
            repeatCount="indefinite"
            rotate="auto"
          />
        </circle>
      </svg>

      {/* Overlay Labels */}
      <div className="absolute inset-0 flex items-end justify-between px-8 pb-6 pointer-events-none">
        <div className="rounded bg-background/80 px-2 py-1 text-[0.6rem] font-mono uppercase tracking-wider border border-border/50 backdrop-blur-sm">
          DEL
        </div>
        <div className="rounded bg-background/80 px-2 py-1 text-[0.6rem] font-mono uppercase tracking-wider border border-border/50 backdrop-blur-sm">
          IMF
        </div>
      </div>
    </div>
  );
}
