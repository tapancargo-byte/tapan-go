import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import ArrowRightIcon from "@/components/icons/arrow-right";
import { GridPattern } from "@/components/ui/grid-pattern";
import { ShinyButton } from "@/components/ui/shiny-button";
import { TextAnimate } from "@/components/ui/text-animate";

interface FinancialHeroProps {
  title: React.ReactNode;
  description: React.ReactNode;
  /** Optional small label above the title, e.g. a HUD-style overline. */
  overline?: React.ReactNode;
  /** Optional row of stat chips rendered between the title and description. */
  stats?: React.ReactNode;
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
  overline,
  stats,
  buttonText,
  buttonLink,
  imageUrl1,
  imageUrl2,
  rightContent,
  className,
}: FinancialHeroProps) => {
  return (
    <section
      className={cn(
        "relative w-full overflow-hidden bg-background text-foreground",
        className
      )}
    >
      <div className="absolute inset-0 bg-background" />
      <GridPattern className="text-border/20" width={56} height={56} x={-1} y={-1} />

      <motion.div
        className="relative mx-auto flex w-full max-w-6xl min-h-[70vh] flex-col items-center gap-8 px-6 py-16 sm:gap-10 sm:py-20 md:px-10 md:py-24 lg:flex-row lg:items-start lg:justify-between lg:gap-12"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Left: Text Content */}
        <div className="flex w-full max-w-2xl flex-col items-center text-center lg:w-1/2 lg:items-start lg:text-left">
          {overline && (
            <motion.div variants={itemVariants} className="mb-3 w-full">
              {overline}
            </motion.div>
          )}
          <motion.h1
            className="text-3xl font-semibold tracking-tight md:text-5xl lg:text-[3.5rem] lg:leading-[1.05]"
            variants={itemVariants}
          >
            {typeof title === "string" ? (
              <TextAnimate
                as="span"
                by="word"
                animation="blurInUp"
                duration={0.8}
                className="inline-block"
              >
                {title}
              </TextAnimate>
            ) : (
              title
            )}
          </motion.h1>
          {stats && (
            <motion.div variants={itemVariants} className="mt-4 w-full">
              {stats}
            </motion.div>
          )}
          <motion.div
            className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/80 sm:text-base md:text-lg"
            variants={itemVariants}
          >
            {description}
          </motion.div>
          {buttonText && buttonLink && (
            <motion.div
              variants={itemVariants}
              className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:justify-start"
            >
              <ShinyButton className="h-10 px-5 text-xs md:text-sm font-semibold shadow-sm transition-all duration-200 hover:shadow-md">
                <a href={buttonLink} className="inline-flex items-center">
                  {buttonText}
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </a>
              </ShinyButton>
            </motion.div>
          )}
        </div>

        {/* Right: Visual */}
        <motion.div
          className="relative flex w-full max-w-3xl items-center justify-center lg:w-[55%] lg:justify-end"
          variants={cardsVariants}
        >
          {rightContent ? (
            <motion.div
              className="relative w-full"
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
                  className="absolute h-48 translate-x-24 transform object-cover shadow-2xl md:h-80 rotate-[-6deg]"
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
                  className="absolute h-48 -translate-x-16 transform object-cover shadow-2xl md:h-80 rotate-[6deg]"
                />
              )}
            </>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
};
