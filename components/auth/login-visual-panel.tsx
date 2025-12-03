"use client";

import Lottie from "lottie-react";
import loginAnimation from "@/public/assets/login.json";

export function LoginVisualPanel() {
  return (
    <div className="relative hidden lg:block bg-background">
      <div className="relative flex h-full items-center justify-center">
        <div className="relative w-full max-w-xl">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
            <Lottie
              animationData={loginAnimation}
              loop
              autoplay
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
