"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiOutlineShare } from "react-icons/hi";
import {
  HomeIcon,
  ChartBarIcon,
  CpuChipIcon,
  Cog6ToothIcon,
  UserIcon,
  BoltIcon,
  ChartPieIcon,
  Squares2X2Icon,
  GlobeAltIcon,
  DocumentChartBarIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
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
  { name: "AI", href: "/ai", icon: CpuChipIcon },
  { name: "Alarmas", href: "/alarmas", icon: ExclamationTriangleIcon, badge: 3 },
  { name: "Unifilar", href: "/unifilar", icon: HiOutlineShare },
  { name: "Reportes", href: "/reportes", icon: DocumentChartBarIcon },
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
      { name: "Usuarios", href: "/config/users", icon: UserIcon, badge: 1 },
      { name: "Tarifas", href: "/configuracion/tarifas", icon: MdPriceChange },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [openConfig, setOpenConfig] = useState(false);
  const [openMedidores, setOpenMedidores] = useState(false);

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
                {/* Botón para Configuración y Medidores */}
                <button
                  onClick={() => {
                    if (isConfig) setOpenConfig(!openConfig);
                    if (isMedidores) setOpenMedidores(!openMedidores);
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

                {/* Renderizar hijos solo si está abierto */}
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
      <div className="p-4 border-b border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-orange-400 via-amber-400 to-red-500 bg-clip-text text-transparent hidden md:block animate-slow-pulse glow-orange">
            PQGenius
          </h1>
          <p className="text-base font-medium text-orange-300 hidden md:block tracking-wide">
            Panel de Análisis Energético Industrial
          </p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar no-scrollbar">
        {renderMenu(menuItems)}
      </div>
    </aside>
  );
}