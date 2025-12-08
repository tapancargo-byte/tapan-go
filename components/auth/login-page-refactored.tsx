"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLogo } from "@/components/ui/brand-logo";
import { MorphicNavbar } from "@/components/ui/morphic-navbar";
import { LoginVisualPanel } from "@/components/auth/login-visual-panel";
import { Loader2, Mail, Lock, Github, Globe, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { LocationScope } from "@/types/auth";

function BoxCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-card rounded-3xl shadow-md border border-slate-200 dark:border-border p-6",
        className
      )}
    >
      {children}
    </div>
  );
}

export function LoginPageRefactored() {
  const [email, setEmail] = useState("admin@tapango.logistics");
  const [password, setPassword] = useState("Test@1498");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedScope, setSelectedScope] = useState<LocationScope>("imphal");
  const router = useRouter();

  // Auto-detect scope based on email (legacy logic preserved)
  useEffect(() => {
    if (email.includes("delhi")) {
      setSelectedScope("newdelhi");
    } else if (email.includes("admin")) {
      setSelectedScope("imphal");
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error || !data.session) {
        setError(error?.message || "Invalid email or password");
        setLoading(false);
        return;
      }

      // Store location preference
      try {
        if (typeof localStorage !== "undefined") {
            localStorage.setItem("tapango-location-scope", selectedScope);
            if (selectedScope !== "all") {
                localStorage.setItem("tapango-user-home-location", selectedScope);
            }
        }
      } catch (e) {
        // Ignore storage errors
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Login error", err);
      setError("Something went wrong while signing in");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background flex flex-col relative overflow-hidden">
       {/* Navbar */}
       <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border/40">
           <MorphicNavbar mode="login" />
       </header>

       {/* Background decorations matching landing page */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-100/40 dark:bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-indigo-100/40 dark:bg-accent/5 rounded-full blur-3xl" />
       </div>

       {/* Main Content */}
       <div className="flex-1 flex items-center justify-center p-4 pt-20 relative z-10">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5 }}
             className="w-full max-w-5xl grid lg:grid-cols-2 bg-white dark:bg-card shadow-2xl border border-slate-200 dark:border-border min-h-[600px]"
           >
              {/* Left: Animation Panel */}
              <div className="hidden lg:block relative bg-slate-50 dark:bg-muted/20 p-6 border-r border-slate-100 dark:border-border">
                 <div className="h-full w-full relative overflow-hidden bg-white dark:bg-card border border-slate-200 dark:border-border">
                     <LoginVisualPanel />
                 </div>
              </div>

              {/* Right: Login Form */}
              <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white dark:bg-card">
                 <div className="mb-10">
                     <h1 className="text-2xl font-bold text-slate-900 dark:text-foreground mb-2">Welcome Back</h1>
                     <p className="text-muted-foreground text-sm">
                         Sign in to access your dashboard.
                     </p>
                 </div>
                 
                 <form onSubmit={handleSubmit} className="space-y-6">
                     <div className="space-y-2">
                         <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide ml-1">Email Address</Label>
                         <div className="relative">
                             <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                             <Input 
                                id="email" 
                                type="email" 
                                placeholder="name@tapango.logistics" 
                                className="pl-10 h-10 rounded-none bg-slate-50 dark:bg-muted/50 border-slate-200 dark:border-border focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-all text-sm"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                             />
                         </div>
                     </div>

                     <div className="space-y-2">
                         <div className="flex justify-between items-center ml-1">
                             <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide">Password</Label>
                             <Link href="#" className="text-xs text-blue-600 dark:text-primary hover:underline">
                                 Forgot Password?
                             </Link>
                         </div>
                         <div className="relative">
                             <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                             <Input 
                                id="password" 
                                type="password" 
                                placeholder="••••••••" 
                                className="pl-10 h-10 rounded-none bg-slate-50 dark:bg-muted/50 border-slate-200 dark:border-border focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-all text-sm"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                             />
                         </div>
                     </div>

                     {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-red-500" />
                            {error}
                        </div>
                     )}

                     <Button 
                        type="submit" 
                        className="w-full h-10 rounded-none bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm transition-all"
                        disabled={loading}
                     >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing In...
                            </>
                        ) : (
                            "Sign In"
                        )}
                     </Button>
                 </form>

                 <ul className="mt-6 space-y-2 text-xs text-muted-foreground">
                   <li className="flex items-center gap-2">
                     <i className="fa-solid fa-shield-halved text-primary text-sm" aria-hidden="true" />
                     <span>Secure access to your corridor operations.</span>
                   </li>
                   <li className="flex items-center gap-2">
                     <i className="fa-solid fa-route text-primary text-sm" aria-hidden="true" />
                     <span>Optimized for the Imphal ⇄ New Delhi corridor.</span>
                   </li>
                   <li className="flex items-center gap-2">
                     <i className="fa-solid fa-headset text-primary text-sm" aria-hidden="true" />
                     <span>Ops support ready if you run into issues.</span>
                   </li>
                 </ul>

                 <p className="mt-8 text-center text-xs text-muted-foreground">
                     Don't have an account?{" "}
                     <Link href="#" className="font-semibold text-blue-600 dark:text-primary hover:underline">
                         Contact Admin
                     </Link>
                 </p>
              </div>
           </motion.div>
       </div>
    </div>
  );
}
