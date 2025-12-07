"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import loginAnimation from "@/public/assets/login.json";

export function LoginVisualPanel() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const handler = (event: MediaQueryListEvent) => setReduceMotion(event.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div className="h-full w-full">
      {/* Animation container - larger to match form height */}
      <div className="relative h-full w-full border border-[var(--glass-border)] bg-[var(--card-glass)] shadow-lg overflow-hidden backdrop-blur-xl">
        <div className="relative h-full w-full bg-[radial-gradient(circle_at_top,_hsl(var(--primary))_0,_transparent_65%)]/30">
          {!reduceMotion ? (
            <Lottie animationData={loginAnimation} loop autoplay className="w-full h-full" />
          ) : (
            <img
              src="/assets/login-poster.png"
              alt="Login illustration"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}
        </div>
      </div>
      
      {/* Subtle branding text */}
      <div className="hidden" />
    </div>
  );
}
