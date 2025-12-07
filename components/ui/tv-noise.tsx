"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TVNoiseProps {
  className?: string;
  opacity?: number;
  intensity?: number;
  speed?: number;
}

export default function TVNoise({
  className,
  opacity = 0.03,
  intensity = 0.1,
  speed = 60,
}: TVNoiseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const [isVisible, setIsVisible] = useState(false);

  // Only start animation when visible using IntersectionObserver
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reduce frame rate for performance
    const frameDelay = 1000 / Math.min(speed, 30);

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width * window.devicePixelRatio;
      const height = rect.height * window.devicePixelRatio;

      // Only update canvas if we have valid dimensions
      if (
        width > 0 &&
        height > 0 &&
        Number.isFinite(width) &&
        Number.isFinite(height)
      ) {
        canvas.width = width;
        canvas.height = height;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };

    const animate = () => {
      const { width, height } = canvas;

      // Skip animation if canvas has invalid dimensions
      if (
        width <= 0 ||
        height <= 0 ||
        !Number.isFinite(width) ||
        !Number.isFinite(height)
      ) {
        setTimeout(() => {
          if (animationFrameRef.current) {
            animationFrameRef.current = requestAnimationFrame(animate);
          }
        }, frameDelay);
        return;
      }

      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;

      // Generate random noise
      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random();

        if (noise < intensity) {
          const value = Math.floor(Math.random() * 255);
          data[i] = value; // Red
          data[i + 1] = value; // Green
          data[i + 2] = value; // Blue
          data[i + 3] = Math.floor(Math.random() * 100 + 50); // Alpha (transparency)
        } else {
          data[i + 3] = 0; // Fully transparent
        }
      }

      ctx.putImageData(imageData, 0, 0);

      // Schedule next frame
      setTimeout(() => {
        if (animationFrameRef.current) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      }, frameDelay);
    };

    // Initialize
    resizeCanvas();
    animationFrameRef.current = requestAnimationFrame(animate);

    // Handle resize
    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [intensity, speed, isVisible]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "pointer-events-none absolute inset-0 w-full h-full z-10",
        className
      )}
      style={{
        opacity,
        mixBlendMode: "overlay",
      }}
    />
  );
}
