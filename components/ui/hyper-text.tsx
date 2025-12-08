"use client";

import type { ElementType, HTMLAttributes } from "react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type CharacterSet = string[] | readonly string[];

interface HyperTextProps extends HTMLAttributes<HTMLElement> {
  children: string;
  className?: string;
  duration?: number;
  delay?: number;
  as?: ElementType;
  startOnView?: boolean;
  animateOnHover?: boolean;
  characterSet?: CharacterSet;
}

const DEFAULT_CHARACTER_SET = Object.freeze(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
) as readonly string[];

const getRandomInt = (max: number): number => Math.floor(Math.random() * max);

export function HyperText({
  children,
  className,
  duration = 800,
  delay = 0,
  as: Component = "div",
  startOnView = false,
  animateOnHover = true,
  characterSet = DEFAULT_CHARACTER_SET,
  ...props
}: HyperTextProps) {
  const [displayText, setDisplayText] = useState<string[]>(() =>
    children.split("")
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const iterationCount = useRef(0);
  const elementRef = useRef<HTMLElement | null>(null);

  const handleAnimationTrigger = () => {
    if (animateOnHover && !isAnimating) {
      iterationCount.current = 0;
      setIsAnimating(true);
    }
  };

  useEffect(() => {
    setDisplayText(children.split(""));
  }, [children]);

  useEffect(() => {
    if (!startOnView) {
      const startTimeout = window.setTimeout(() => {
        setIsAnimating(true);
      }, delay);

      return () => window.clearTimeout(startTimeout);
    }

    let timeoutId: number | undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timeoutId = window.setTimeout(() => {
            setIsAnimating(true);
          }, delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "-30% 0px -30% 0px" }
    );

    const el = elementRef.current;
    if (el) {
      observer.observe(el);
    }

    return () => {
      observer.disconnect();
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [delay, startOnView]);

  useEffect(() => {
    if (!isAnimating) return;

    const maxIterations = children.length;
    const startTime = performance.now();
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      iterationCount.current = progress * maxIterations;

      setDisplayText((currentText) =>
        currentText.map((letter, index) =>
          letter === " " || letter === "\n"
            ? letter
            : index <= iterationCount.current
              ? children[index]
              : characterSet[getRandomInt(characterSet.length)]
        )
      );

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [children, duration, isAnimating, characterSet]);

  const ComponentTag = Component as ElementType;

  return (
    <ComponentTag
      ref={elementRef as any}
      className={cn(
        "inline-flex flex-wrap overflow-hidden align-baseline",
        className
      )}
      onMouseEnter={handleAnimationTrigger}
      {...props}
    >
      {displayText.map((letter, index) => {
        if (letter === "\n") {
          return <span key={index} className="basis-full w-full h-0" />;
        }

        return (
          <span
            key={index}
            className={cn("font-mono", letter === " " ? "w-3" : "")}
          >
            {letter.toUpperCase()}
          </span>
        );
      })}
    </ComponentTag>
  );
}
