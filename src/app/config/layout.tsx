"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ConfiguracionLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const links = [
    { href: "/configuracion/medidores", label: "Medidores", icon: "⚡" },
    { href: "/configuracion/tarifas", label: "Tarifas", icon: "💲" },
    { href: "/configuracion/usuarios", label: "Usuarios", icon: "👤" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-900 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 border-r border-white/10 p-4 space-y-4">
        <h2 className="text-xl font-bold mb-6">⚙️ Configuración</h2>
        <nav className="space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-3 py-2 rounded 
                ${pathname === link.href ? "bg-teal-600 text-white" : "hover:bg-slate-700 text-white/70"}`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}