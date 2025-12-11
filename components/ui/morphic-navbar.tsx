"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface MorphicNavbarProps {
  mode?: "landing" | "login";
  onNavClick?: (sectionId: string) => void;
}

export function MorphicNavbar({ mode = "landing", onNavClick }: MorphicNavbarProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mode !== "landing") return;
    if (typeof window === "undefined") return;

    const sectionIds = ["services", "tracking", "contact"];

    const handleScroll = () => {
      let closestId: string | null = null;
      let minDistance = Infinity;
      const headerOffset = 80;

      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const distance = Math.abs(rect.top - headerOffset);
        if (distance < minDistance) {
          minDistance = distance;
          closestId = id;
        }
      });

      if (closestId) {
        setActiveSection(closestId);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [mode]);

  const handleNavClick = (id: string) => {
    if (mode === "landing") {
      setActiveSection(id);
      setMobileOpen(false);
    }
    if (onNavClick) {
      onNavClick(id);
    }
  };

  const navButtonClasses = (id: string) =>
    `rounded-none px-3 py-1.5 text-sm transition-colors ${
      activeSection === id
        ? "bg-foreground text-background"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
    }`;

  return (
    <div className="relative">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <BrandLogo size="md" className="h-12 md:h-14 lg:h-16" />

        {mode === "landing" && (
          <nav className="hidden md:flex items-center gap-6">
            <button
              type="button"
              onClick={() => handleNavClick("services")}
              className={navButtonClasses("services")}
            >
              Services
            </button>
            <button
              type="button"
              onClick={() => handleNavClick("tracking")}
              className={navButtonClasses("tracking")}
            >
              Track
            </button>
            <button
              type="button"
              onClick={() => handleNavClick("contact")}
              className={navButtonClasses("contact")}
            >
              Contact
            </button>
          </nav>
        )}

        <div className="flex items-center gap-2">
          {/* Hide theme toggle and action buttons on mobile to declutter */}
          <div className="hidden md:inline-flex">
            <ThemeToggle />
          </div>
          {mode === "landing" ? (
            <Button asChild size="sm" className="hidden md:inline-flex h-9 px-4 rounded-none">
              <Link href="/login">Login</Link>
            </Button>
          ) : (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden md:inline-flex h-8 px-4 text-xs rounded-none"
            >
              <Link href="/">Back to site</Link>
            </Button>
          )}

          {/* Mobile hamburger with Sheet for both modes */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center justify-center border border-border bg-background/80 p-2 text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85%] max-w-sm p-0">
              <nav className="px-6 py-6 space-y-2 text-sm">
                {mode === "landing" && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleNavClick("services")}
                      className={`${navButtonClasses("services")} w-full text-left`}
                    >
                      Services
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick("tracking")}
                      className={`${navButtonClasses("tracking")} w-full text-left`}
                    >
                      Track
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick("contact")}
                      className={`${navButtonClasses("contact")} w-full text-left`}
                    >
                      Contact
                    </button>
                  </>
                )}

                {/* Shared mobile actions */}
                <div className="pt-3 mt-3 border-t border-border/60" />
                {mode === "landing" ? (
                  <Link href="/login" className="block rounded-none px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/60">Login</Link>
                ) : (
                  <Link href="/" className="block rounded-none px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/60">Back to site</Link>
                )}
                {/* Theme toggle inside menu on mobile */}
                <div className="mt-2">
                  <ThemeToggle />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      
    </div>
  );
}
