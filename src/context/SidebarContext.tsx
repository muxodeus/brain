"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type SidebarContextType = {
  sidebarOpen: boolean;
  sidebarExpanded: boolean;
  compactMode: boolean;
  toggleSidebar: () => void;
  toggleExpanded: () => void;
  toggleCompactMode: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const savedExpanded = localStorage.getItem("sidebarExpanded");
    const savedCompact = localStorage.getItem("sidebarCompact");

    setSidebarExpanded(savedExpanded !== null ? savedExpanded === "true" : !isMobile);
    setCompactMode(savedCompact === "true");
  }, []);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const toggleExpanded = () => {
    setSidebarExpanded((prev) => {
      localStorage.setItem("sidebarExpanded", String(!prev));
      return !prev;
    });
  };
  const toggleCompactMode = () => {
    setCompactMode((prev) => {
      localStorage.setItem("sidebarCompact", String(!prev));
      return !prev;
    });
  };

  return (
    <SidebarContext.Provider
      value={{
        sidebarOpen,
        sidebarExpanded,
        compactMode,
        toggleSidebar,
        toggleExpanded,
        toggleCompactMode,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within SidebarProvider");
  return context;
}