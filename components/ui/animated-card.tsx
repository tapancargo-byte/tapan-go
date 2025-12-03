"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCardProps extends Omit<HTMLMotionProps<"div">, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  delay?: number;
  hoverScale?: number;
  enableHover?: boolean;
}

export function AnimatedCard({
  children,
  className,
  delay = 0,
  hoverScale = 1.02,
  enableHover = true,
  ...props
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay,
      }}
      whileHover={
        enableHover
          ? {
              scale: hoverScale,
              transition: { duration: 0.2 },
            }
          : undefined
      }
      className={cn(
        "rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm p-6",
        "transition-shadow duration-300",
        "hover:shadow-lg hover:shadow-brand/10",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface FadeInProps extends Omit<HTMLMotionProps<"div">, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
}

export function FadeIn({
  children,
  className,
  delay = 0,
  direction = "up",
  distance = 20,
  ...props
}: FadeInProps) {
  const directions = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface ScaleInProps extends Omit<HTMLMotionProps<"div">, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  delay?: number;
}

export function ScaleIn({
  children,
  className,
  delay = 0,
  ...props
}: ScaleInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
        delay,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
