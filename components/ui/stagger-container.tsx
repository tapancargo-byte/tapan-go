"use client";

import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
  initialDelay?: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: (staggerDelay: number) => ({
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
    },
  }),
};

export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  initialDelay = 0,
  className,
}: StaggerContainerProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      custom={staggerDelay}
      transition={{ delay: initialDelay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
}

export function StaggerItem({
  children,
  className,
  direction = "up",
  distance = 20,
}: StaggerItemProps) {
  const directions = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, ...directions[direction] },
    show: { opacity: 1, x: 0, y: 0 },
  };

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}
