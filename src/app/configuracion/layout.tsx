"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ConfiguracionLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const links = [
    { href: "/configuracion/medidores", label: "Medidores", icon: "⚡" },
    { href: "/configuracion/tarifas", label: "Tarifas", icon: "💲" },
    { href: "/configuracion/users", label: "Usuarios", icon: "👤" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-900 text-white">


      {/* Contenido principal */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}