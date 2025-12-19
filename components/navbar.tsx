"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"

const ThemeToggleNoSSR = dynamic(() => import("@/components/theme-toggle").then((m) => m.ThemeToggle), {
  ssr: false,
  loading: () => (
    <button
      type="button"
      aria-label="Toggle theme"
      disabled
      className="w-10 h-10 flex items-center justify-center border border-border hover:bg-muted transition-colors"
    >
      <span className="w-4 h-4" />
    </button>
  ),
})

const navLinks = [
  { label: "Services", href: "#services" },
  { label: "Solutions", href: "#solutions" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    handleScroll()
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-background/80 backdrop-blur-xl shadow-sm border-b border-border" : "bg-transparent",
      )}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-foreground flex items-center justify-center">
              <span className="text-background font-bold text-lg tracking-tighter">T</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-foreground tracking-tight leading-none">TAC</span>
              <span className="text-[9px] text-muted-foreground tracking-[0.2em] uppercase">Cargo Solutions</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="relative text-sm text-muted-foreground hover:text-foreground transition-colors group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-foreground transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggleNoSSR />
            <Button className="bg-foreground hover:bg-foreground/90 text-background px-6 h-10 text-sm font-medium rounded-none">
              Login
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
