"use client";

import { motion } from "framer-motion";

export function NetworkMapVisual() {
  const nodes = [
    { x: 150, y: 75, r: 8, label: "HUB" }, // Center (Guwahati/Hub)
    { x: 50, y: 40, r: 5, label: "DEL" },  // Delhi
    { x: 250, y: 50, r: 5, label: "IMF" }, // Imphal
    { x: 220, y: 110, r: 5, label: "IXB" }, // Siliguri (Bagdogra)
    { x: 80, y: 120, r: 5, label: "CCU" },  // Kolkata
  ];

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-pop/80 dark:bg-background/80 p-4">
      {/* Radar Scan Effect Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
         <div className="h-[200px] w-[200px] rounded-full border border-emerald-500/30 animate-[ping_4s_ease-out_infinite]" />
         <div className="absolute h-[140px] w-[140px] rounded-full border border-emerald-500/30 animate-[ping_4s_ease-out_infinite_1s]" />
      </div>

      <svg
        className="relative h-full w-full max-w-[300px]"
        viewBox="0 0 300 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Connection Lines */}
        {nodes.slice(1).map((node, i) => (
          <motion.line
            key={i}
            x1={nodes[0].x}
            y1={nodes[0].y}
            x2={node.x}
            y2={node.y}
            stroke="currentColor"
            className="text-slate-700"
            strokeWidth="2"
            strokeDasharray="4 4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, delay: i * 0.2 }}
          />
        ))}

        {/* Active Pulse Lines */}
        {nodes.slice(1).map((node, i) => (
          <motion.line
            key={`pulse-${i}`}
            x1={nodes[0].x}
            y1={nodes[0].y}
            x2={node.x}
            y2={node.y}
            stroke="#10b981"
            strokeWidth="1.5"
            strokeDasharray="0 1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1, 1], 
              opacity: [0, 1, 0],
              strokeDashoffset: [0, -50]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              delay: i * 0.5,
              ease: "linear"
            }}
          />
        ))}

        {/* Moving pulses from hub to nodes */}
        {nodes.slice(1).map((node, i) => (
          <circle
            key={`moving-${i}`}
            r={4}
            fill="#10b981"
            opacity={0.9}
          >
            <animateMotion
              dur="3s"
              repeatCount="indefinite"
              begin={`${i * 0.5}s`}
              path={`M ${nodes[0].x} ${nodes[0].y} L ${node.x} ${node.y}`}
            />
          </circle>
        ))}

        {/* Nodes */}
        {nodes.map((node, i) => (
          <g key={i} transform={`translate(${node.x}, ${node.y})`}>
            <motion.circle
              r={node.r}
              fill={i === 0 ? "#10b981" : "#334155"}
              stroke={i === 0 ? "#059669" : "#475569"}
              strokeWidth="2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: i * 0.1 }}
            />
            {/* Label */}
            <text
              y={node.r + 12}
              textAnchor="middle"
              className="fill-muted-foreground text-[10px] font-mono font-bold tracking-wider"
              style={{ fontSize: "8px" }}
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
