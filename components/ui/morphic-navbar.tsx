"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Menu } from "lucide-react";
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

    const sectionIds = ["services", "track", "about", "contact"];

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

  const navItems: { id: string; label: string }[] = [
    { id: "services", label: "Services" },
    { id: "track", label: "Track" },
    { id: "about", label: "About" },
    { id: "contact", label: "Contact" },
  ];

  const navButtonClasses = (id: string) =>
    `flex items-center justify-center px-4 py-2 text-sm transition-all duration-300 first:rounded-l-xl last:rounded-r-xl ${activeSection === id
      ? "bg-foreground text-background font-semibold"
      : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60"
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2" aria-label="Tapan Associate Home">
          <div className="flex flex-col leading-none">
            <span className="text-xl font-bold tracking-tighter text-foreground">TAC.</span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Tapan Associate Cargo</span>
          </div>
        </Link>

        {mode === "landing" && (
          <div className="hidden md:flex flex-1 items-center justify-center">
            <div className="flex items-center justify-between overflow-hidden rounded-xl border border-border bg-background shadow-sm">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={navButtonClasses(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
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
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hidden md:inline-flex h-9 px-4 rounded-none text-muted-foreground hover:text-foreground"
              >
                <Link href="/">
                  Home
                </Link>
              </Button>
            </>
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
                    {navItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleNavClick(item.id)}
                        className={`${navButtonClasses(item.id)} w-full text-left rounded-none`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </>
                )}

                {/* Shared mobile actions */}
                <div className="pt-3 mt-3 border-t border-border/60" />
                {mode === "landing" ? (
                  <Link href="/login" className="block rounded-none px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/60">
                    Login
                  </Link>
                ) : (
                  <>
                    <Link href="/" className="block rounded-none px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/60">
                      Back to site
                    </Link>
                  </>
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
    </nav>
  );
}
