"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  HomeIcon,
  ChartBarIcon,
  CpuChipIcon,
  Cog6ToothIcon,
  UserIcon,
  BoltIcon,
  BoltSlashIcon,
  ChartPieIcon,
  Squares2X2Icon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { HiOutlineShare } from "react-icons/hi";
import { MdPriceChange } from "react-icons/md";

type MenuItem = {
  name: string;
  href?: string;
  icon: any;
  badge?: number;
  children?: MenuItem[];
};

const menuItems: MenuItem[] = [
  { name: "Overview", href: "/overview", icon: HomeIcon },
  { name: "Tendencias", href: "/tendencias", icon: ChartBarIcon },
  { name: "Centro de Energía", href: "/consumos", icon: BoltIcon, badge: 3 },
  { name: "Dashboard", href: "/kpis", icon: Squares2X2Icon },
  { name: "Estadísticas", href: "/stats", icon: ChartPieIcon },
  { name: "Perturbaciones", href: "/perturbaciones", icon:BoltSlashIcon },
  { name: "AI", href: "/ai", icon: CpuChipIcon },
  { name: "Alarmas", href: "/alarmas", icon: ExclamationTriangleIcon, badge: 3 },
  { name: "Unifilar", href: "/unifilar", icon: HiOutlineShare },
  {
    name: "Configuración",
    icon: Cog6ToothIcon,
    children: [
      {
        name: "Medidores",
        icon: BoltIcon,
        children: [
          { name: "Configurar medidores", href: "/configuracion/medidores", icon: BoltIcon },
          { name: "Plantillas de modelos", href: "/configuracion/medidores/plantillas", icon: CpuChipIcon },
          { name: "Gateways", href: "/configuracion/gateways", icon: GlobeAltIcon },
        ],
      },
      { name: "Tarifas", href: "/configuracion/tarifas", icon: MdPriceChange },
      { name: "Usuarios", href: "/configuracion/users", icon: UserIcon, badge: 1 },

    ],
  },
];

const roleMenus: Record<string, MenuItem[]> = {
  admin: menuItems,
  engineer: menuItems.filter((m) => m.name !== "Configuración"),
  viewer: menuItems.filter((m) =>
    ["Overview", "Dashboard", "Estadísticas"].includes(m.name)
  ),
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser } = useAuth();

  const [openConfig, setOpenConfig] = useState(false);
  const [openMedidores, setOpenMedidores] = useState(false);

  const handleLogout = async () => {
    setUser(null);
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
  };

  const renderMenu = (items: MenuItem[], level = 0) => (
    <ul className={`${level > 0 ? "ml-2 md:ml-6" : ""} mt-1 space-y-1`}>
      {items.map((item) => {
        const isConfig = item.name === "Configuración";
        const isMedidores = item.name === "Medidores";

        return (
          <li key={item.name}>
            {item.href ? (
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  pathname === item.href
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-gray-200 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="hidden md:inline">{item.name}</span>
                {item.badge && item.badge > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ) : (
              <div className="flex flex-col">
                <button
                  onClick={() => {
                    if (isConfig) setOpenConfig((v) => !v);
                    if (isMedidores) setOpenMedidores((v) => !v);
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-gray-200 hover:bg-gray-800 hover:text-white"
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className="hidden md:inline">{item.name}</span>
                  {(isConfig && (
                    <span className="ml-auto">{openConfig ? "▲" : "▼"}</span>
                  )) ||
                    (isMedidores && (
                      <span className="ml-auto">{openMedidores ? "▲" : "▼"}</span>
                    ))}
                </button>

                {item.children &&
                  ((isConfig && openConfig) ||
                    (isMedidores && openMedidores) ||
                    (!isConfig && !isMedidores)) &&
                  renderMenu(item.children, level + 1)}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside className="h-screen w-20 md:w-64 bg-gray-950 text-gray-100 flex flex-col border-r border-gray-800 shadow-lg">
{/* Header */}
<div className="p-4 border-b border-gray-800 text-center">
  <img
    src="/logo.png"
    alt="PQGenius Logo"
    className="h-12 w-auto mx-auto mb-2 animate-fadeIn"
  />
  <h1 className="text-2xl font-bold text-orange-400 animate-pulse">
    PQGenius
  </h1>
  <p className="text-sm text-gray-400 animate-slideUp">
    Energía y Analítica en Tiempo Real
  </p>
</div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4">
        {!user ? (
          <div className="text-center text-gray-400">
            <p className="mb-2">Menú colapsado</p>
            <Link href="/" className="text-indigo-400 hover:underline">
              Inicie sesión
            </Link>
          </div>
        ) : (
          <>
            {renderMenu(roleMenus[user.role] || [])}

            <div className="mt-6 space-y-2">
              <div className="px-3 py-2 rounded-lg bg-gray-900 text-gray-300">
                <p className="text-sm">
                  Usuario: <span className="text-white">{user.email}</span>
                </p>
                <p className="text-sm">
                  Rol: <span className="text-white capitalize">{user.role}</span>
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-semibold text-white"
              >
                Cerrar sesión
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}