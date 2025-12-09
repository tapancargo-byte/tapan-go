"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type SidebarContextType = {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setCollapsed: (value: boolean) => void;
  isMobile: boolean;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);
  const setCollapsed = (value: boolean) => setIsCollapsed(value);

  return (
    <SidebarContext.Provider
      value={{ isCollapsed, toggleSidebar, setCollapsed, isMobile }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
