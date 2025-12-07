"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, MapPin, Loader2 } from "lucide-react";
import { LOCATIONS, LOCATION_SCOPES, type Location, type LocationScope } from "@/types/auth";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const [email, setEmail] = useState("admin@tapango.logistics");
  const [password, setPassword] = useState("Test@1498");
  const [selectedScope, setSelectedScope] = useState<LocationScope>("imphal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Auto-select location based on email
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
      
      localStorage.setItem("tapango-location-scope", selectedScope);
      if (selectedScope !== 'all') {
        localStorage.setItem("tapango-user-home-location", selectedScope);
      }
      
      setLoading(false);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Login error", err);
      setError("Something went wrong while signing in");
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Location Selection - Clean pill buttons */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5" />
          Branch Location
        </Label>
        <div className="flex gap-2">
          {LOCATION_SCOPES.filter(s => s.value !== 'all').map((scope) => (
            <button
              key={scope.value}
              type="button"
              onClick={() => setSelectedScope(scope.value)}
              className={cn(
                "flex-1 py-2.5 px-4 text-sm font-medium transition-all duration-200",
                "border focus:outline-none focus:ring-2 focus:ring-primary/20",
                selectedScope === scope.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
              )}
            >
              <span className="font-mono text-xs mr-1.5">
                {LOCATIONS[scope.value as Location].code}
              </span>
              {LOCATIONS[scope.value as Location].name}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setSelectedScope('all')}
          className={cn(
            "w-full py-2 px-4 text-xs font-medium transition-all duration-200",
            "border focus:outline-none focus:ring-2 focus:ring-primary/20",
            selectedScope === 'all'
              ? "bg-primary/10 text-primary border-primary/30"
              : "bg-transparent text-muted-foreground border-transparent hover:text-foreground"
          )}
        >
          View all locations
        </button>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 bg-background"
        />
      </div>

      {/* Password */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <Link
            href="/support"
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 pr-10 bg-background"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        className="w-full h-11 font-medium"
        disabled={loading || !email.trim() || !password}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>
      
      {/* Demo hint - very subtle */}
    </form>
  );
}
