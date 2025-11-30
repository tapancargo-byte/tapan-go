import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FinancialHeroProps {
  title: React.ReactNode;
  description: React.ReactNode;
  buttonText?: string;
  buttonLink?: string;
  imageUrl1?: string;
  imageUrl2?: string;
  /** Optional override for the right-hand visual (e.g. Lottie). */
  rightContent?: React.ReactNode;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const cardsVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut" as const,
      staggerChildren: 0.3,
    },
  },
};

const cardItemVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
};

/**
 * Reusable hero section with animated text and a right-hand visual.
 * The visual can be either two overlapped images (imageUrl1/2) or a custom rightContent node.
 */
export const FinancialHero = ({
  title,
  description,
  buttonText,
  buttonLink,
  imageUrl1,
  imageUrl2,
  rightContent,
  className,
}: FinancialHeroProps) => {
  const gridBackgroundStyle: React.CSSProperties = {
    backgroundImage:
      "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px)",
    backgroundSize: "3rem 3rem",
  };

  return (
    <section
      className={cn(
        "relative w-full overflow-hidden bg-background text-foreground",
        className
      )}
    >
      <div className="absolute inset-0" style={gridBackgroundStyle} />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />

      <motion.div
        className="relative container mx-auto flex min-h-[80vh] flex-col items-center gap-12 px-6 py-20 lg:flex-row lg:items-center lg:justify-between"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Left: Text Content */}
        <div className="flex w-full flex-col items-center text-center lg:w-1/2 lg:items-start lg:text-left">
          <motion.h1
            className="text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl"
            variants={itemVariants}
          >
            {title}
          </motion.h1>
          <motion.div
            className="mt-4 max-w-xl text-sm text-foreground/80 md:text-base"
            variants={itemVariants}
          >
            {description}
          </motion.div>
          {buttonText && buttonLink && (
            <motion.div variants={itemVariants} className="mt-6">
              <Button asChild size="sm" className="h-9 px-4 text-xs md:text-sm">
                <a href={buttonLink}>
                  {buttonText}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </motion.div>
          )}
        </div>

        {/* Right: Visual */}
        <motion.div
          className="relative flex w-full items-center justify-center lg:w-1/2"
          variants={cardsVariants}
        >
          {rightContent ? (
            <motion.div
              className="relative h-72 w-full max-w-lg md:h-96"
              variants={cardItemVariants}
            >
              {rightContent}
            </motion.div>
          ) : (
            <>
              {imageUrl2 && (
                <motion.img
                  src={imageUrl2}
                  alt="Financial Card Back"
                  variants={cardItemVariants}
                  whileHover={{
                    y: -10,
                    rotate: -5,
                    transition: { duration: 0.3 },
                  }}
                  className="absolute h-48 translate-x-24 transform rounded-2xl object-cover shadow-2xl md:h-80 rotate-[-6deg]"
                />
              )}
              {imageUrl1 && (
                <motion.img
                  src={imageUrl1}
                  alt="Financial Card Front"
                  variants={cardItemVariants}
                  whileHover={{
                    y: -10,
                    rotate: 5,
                    transition: { duration: 0.3 },
                  }}
                  className="absolute h-48 -translate-x-16 transform rounded-2xl object-cover shadow-2xl md:h-80 rotate-[6deg]"
                />
              )}
            </>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
};
