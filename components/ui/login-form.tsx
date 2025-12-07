"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

export default function Example() {
  const [email, setEmail] = useState("ops@tapango.logistics");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      setLoading(false);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Login error", err);
      setError("Something went wrong while signing in");
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "flex h-[700px] w-full rounded-xl border border-border bg-background shadow-sm overflow-hidden"
      )}
    >
      <div className="relative hidden w-full md:block">
        <Image
          src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1000&q=80"
          alt="Cargo operations team collaborating"
          fill
          className="object-cover"
          priority={false}
        />
      </div>

      <div className="flex w-full flex-col items-center justify-center px-6">
        <form
          className="flex w-80 flex-col items-center justify-center md:w-96"
          onSubmit={handleSubmit}
        >
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-foreground">
            Sign in
          </h2>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            Welcome back! Please sign in to continue
          </p>

          <div className="mt-8 mb-5 flex w-full items-center gap-4">
            <div className="h-px w-full bg-border" />
            <p className="w-full whitespace-nowrap text-center text-sm text-muted-foreground">
              Sign in with email
            </p>
            <div className="h-px w-full bg-border" />
          </div>

          <div className="flex h-12 w-full items-center gap-2 overflow-hidden rounded-full border border-input bg-background px-6">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              placeholder="Work email"
              className="h-full w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mt-6 flex h-12 w-full items-center gap-2 overflow-hidden rounded-full border border-input bg-background px-6">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <input
              type="password"
              placeholder="Password"
              className="h-full w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="mt-2 w-full text-left text-xs text-destructive">
              {error}
            </p>
          )}

          <div className="mt-4 flex w-full items-center justify-between text-muted-foreground">
            <label className="flex items-center gap-2 text-sm">
              <input
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              className="text-sm underline underline-offset-2 hover:text-primary"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="mt-8 flex h-11 w-full items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>

          <p className="mt-4 text-sm text-muted-foreground">
            Dont have an account?{" "}
            <button
              type="button"
              className="text-primary hover:underline"
            >
              Sign up
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
