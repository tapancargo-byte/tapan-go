"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid reading theme on the server to prevent SVG mismatches.
  // Render a neutral placeholder until mounted, so server and first client HTML match.
  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        disabled
        className="w-10 h-10 flex items-center justify-center border border-border hover:bg-muted transition-colors"
      >
        <span className="w-4 h-4" />
      </button>
    );
  }

  const currentTheme = theme === "system" ? resolvedTheme : theme;

  const handleToggle = () => {
    const next = currentTheme === "dark" ? "light" : "dark";
    setTheme(next ?? "dark");
  };

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={handleToggle}
      className="w-10 h-10 flex items-center justify-center border border-border hover:bg-muted transition-colors"
    >
      {currentTheme === "dark" ? (
        <Sun className="w-4 h-4 text-foreground" />
      ) : (
        <Moon className="w-4 h-4 text-foreground" />
      )}
    </button>
  );
}
