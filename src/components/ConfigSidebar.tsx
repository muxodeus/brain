"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type MenuItem = {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
};

const menu: MenuItem[] = [
  { label: "Overview", href: "/" },
  { label: "Tendencias", href: "/tendencias" },
  {
    label: "Configuración",
    children: [
      { label: "General", href: "/config/general" },
      { label: "Medidores", href: "/config/meters" },
      { label: "Parámetros", href: "/config/params" },
      { label: "Rangos de tiempo", href: "/config/ranges" },
      { label: "Dashboards", href: "/config/dashboards" },
      { label: "AI & Insights", href: "/config/ai" },
      { label: "Debug", href: "/config/debug" }
    ]
  }
];

export default function ConfigSidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>(["Configuración"]);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  return (
    <aside className="w-64 bg-slate-900 p-4 flex flex-col">
      <h1 className="text-lg font-bold mb-6">PQGenius</h1>
      <nav className="flex-1 space-y-2">
        {menu.map((item) =>
          item.children ? (
            <div key={item.label}>
              <button
                onClick={() => toggleMenu(item.label)}
                className="w-full flex justify-between items-center px-3 py-2 rounded text-sm text-slate-200 hover:bg-slate-800"
              >
                {item.label}
                <span>{openMenus.includes(item.label) ? "▾" : "▸"}</span>
              </button>
              {openMenus.includes(item.label) && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`block px-3 py-1 rounded text-sm ${
                        pathname?.startsWith(child.href)
                          ? "bg-slate-700 text-white"
                          : "text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link
              key={item.href}
              href={item.href!}
              className={`block px-3 py-2 rounded text-sm ${
                pathname === item.href
                  ? "bg-slate-700 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              {item.label}
            </Link>
          )
        )}
      </nav>
    </aside>
  );
}