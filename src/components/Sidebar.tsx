"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  ChartBarIcon,
  BoltIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const nav = [
  { href: "/overview", label: "Overview", icon: HomeIcon },
  { href: "/tendencias", label: "Tendencias", icon: ChartBarIcon },
  { href: "/tiempo-real", label: "Tiempo Real", icon: BoltIcon },
  { href: "/ai", label: "AI", icon: Cog6ToothIcon },
  { href: "/settings", label: "Configuración", icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-slate-800">
        <div className="text-lg font-bold text-slate-100">PQGenius</div>
        <div className="text-xs text-slate-400">Panel de Análisis Energético</div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-3 space-y-2">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              pathname === item.href
                ? "bg-slate-800 text-sky-400"
                : "text-slate-300 hover:bg-slate-800 hover:text-sky-300"
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Footer del sidebar */}
      <div className="p-3 border-t border-slate-800 text-xs text-slate-500">
        v1.0 • Dark mode Derechos Reservados - PQ Solutions,LLC
      </div>
    </aside>
  );
}