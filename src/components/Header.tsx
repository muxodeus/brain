"use client";

import { BellIcon, UserCircleIcon } from "@heroicons/react/24/outline";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Título o buscador */}
      <div className="text-lg font-semibold text-slate-700 dark:text-slate-200">
        Energy Control Center
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-4">
        <button className="relative text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
          <BellIcon className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>
        <div className="flex items-center gap-2">
          <UserCircleIcon className="h-8 w-8 text-slate-400" />
          <span className="text-sm text-slate-600 dark:text-slate-300">
            Usuario
          </span>
        </div>
      </div>
    </header>
  );
}