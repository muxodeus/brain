"use client";
import { useSidebar } from "@/context/SidebarContext";

export default function Header() {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="p-4 bg-slate-100 dark:bg-slate-800 flex items-center justify-between md:justify-start">
      <button
        onClick={toggleSidebar}
        className="md:hidden px-3 py-2 bg-blue-600 text-white rounded"
      >
        ☰
      </button>
      <h1 className="ml-4 text-xl font-bold">Dashboard</h1>
    </div>
  );
}