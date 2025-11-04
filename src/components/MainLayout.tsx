"use client";

import { useSidebar } from "@core/context/SidebarContext";
import Sidebar from "@core/components/Sidebar";
import Header from "@core/components/Header";
import { useEffect, useState } from "react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { sidebarExpanded } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const marginClass = isMobile ? "" : sidebarExpanded ? "ml-64" : "ml-20";

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main
        className={`flex-1 overflow-y-auto transition-all duration-300 ${marginClass}`}
      >
        <Header />
        {children}
      </main>
    </div>
  );
}