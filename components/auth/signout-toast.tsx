"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Hand, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignoutToastProps {
    isVisible: boolean;
    userName: string;
    onClose: () => void;
    duration?: number;
}

export function SignoutToast({
    isVisible,
    userName,
    onClose,
    duration = 3000,
}: SignoutToastProps) {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        if (!isVisible) {
            setProgress(100);
            return;
        }

        // Start progress countdown
        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
            setProgress(remaining);

            if (remaining <= 0) {
                clearInterval(interval);
                onClose();
            }
        }, 50);

        return () => clearInterval(interval);
    }, [isVisible, duration, onClose]);

    // Get display name from email
    const firstName = userName?.split("@")[0]?.split(".")[0] || "User";
    const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -100, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -50, scale: 0.95 }}
                    transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 300,
                        duration: 0.5,
                    }}
                    className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md"
                >
                    <div
                        className={cn(
                            "relative overflow-hidden rounded-2xl",
                            "bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500",
                            "shadow-2xl shadow-purple-500/30",
                            "border border-white/20"
                        )}
                    >
                        {/* Animated background elements */}
                        <div className="absolute inset-0 overflow-hidden">
                            <motion.div
                                animate={{
                                    x: [0, -80, 0],
                                    y: [0, 40, 0],
                                    opacity: [0.3, 0.5, 0.3],
                                }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute top-0 right-1/4 w-28 h-28 bg-white/20 rounded-full blur-2xl"
                            />
                            <motion.div
                                animate={{
                                    x: [0, 60, 0],
                                    y: [0, -30, 0],
                                    opacity: [0.2, 0.4, 0.2],
                                }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                className="absolute bottom-0 left-1/3 w-20 h-20 bg-white/15 rounded-full blur-xl"
                            />
                        </div>

                        {/* Content */}
                        <div className="relative p-5">
                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/20 transition-colors"
                            >
                                <X className="h-4 w-4 text-white/80" />
                            </button>

                            <div className="flex items-start gap-4">
                                {/* Animated signout icon */}
                                <motion.div
                                    initial={{ scale: 0, rotate: 180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{
                                        type: "spring",
                                        damping: 15,
                                        stiffness: 200,
                                        delay: 0.15,
                                    }}
                                    className="relative"
                                >
                                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                                        <motion.div
                                            animate={{ x: [0, 4, 0] }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                        >
                                            <LogOut className="h-7 w-7 text-white" />
                                        </motion.div>
                                    </div>
                                    {/* Wave hand */}
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0, rotate: -20 }}
                                        animate={{
                                            scale: [0, 1.2, 1],
                                            opacity: [0, 1, 1],
                                            rotate: [-20, 10, -10, 10, 0]
                                        }}
                                        transition={{ delay: 0.4, duration: 0.8 }}
                                        className="absolute -top-1 -right-1"
                                    >
                                        <Hand className="h-5 w-5 text-yellow-300" />
                                    </motion.div>
                                </motion.div>

                                {/* Text content */}
                                <div className="flex-1 min-w-0">
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.25, duration: 0.4 }}
                                    >
                                        <h3 className="text-lg font-bold text-white mb-0.5">
                                            Goodbye, {displayName}! 👋
                                        </h3>
                                        <p className="text-white/90 text-sm font-medium mb-2">
                                            You've been signed out successfully
                                        </p>
                                    </motion.div>

                                    {/* Security message */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.45, duration: 0.4 }}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm"
                                    >
                                        <Sparkles className="h-3.5 w-3.5 text-white" />
                                        <span className="text-xs font-medium text-white">
                                            See you next time! Stay safe 🔒
                                        </span>
                                    </motion.div>
                                </div>
                            </div>
                        </div>

                        {/* Animated progress bar */}
                        <div className="h-1 bg-white/20">
                            <motion.div
                                className="h-full bg-white/60"
                                initial={{ width: "100%" }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.05 }}
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Hook for easy usage
export function useSignoutToast() {
    const [toastState, setToastState] = useState<{
        isVisible: boolean;
        userName: string;
    }>({
        isVisible: false,
        userName: "",
    });

    const showToast = (userName: string) => {
        setToastState({
            isVisible: true,
            userName,
        });
    };

    const hideToast = () => {
        setToastState((prev) => ({ ...prev, isVisible: false }));
    };

    return {
        ...toastState,
        showToast,
        hideToast,
    };
}
