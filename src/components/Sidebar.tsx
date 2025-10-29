"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  ChartBarIcon,
  ArrowsRightLeftIcon,
  CpuChipIcon,
  Cog6ToothIcon,
  UserIcon,
  ServerIcon,
  BoltIcon,
  ChartPieIcon,
  Squares2X2Icon,
  GlobeAltIcon
} from "@heroicons/react/24/outline";
import { MdPriceChange } from "react-icons/md";

type MenuItem = {
  name: string;
  href?: string;
  icon: any;
  children?: MenuItem[];
};

const menuItems: MenuItem[] = [
  { name: "Overview", href: "/overview", icon: HomeIcon },
  { name: "Tendencias", href: "/tendencias", icon: ChartBarIcon },
  { name: "Centro de Energía", href: "/consumos", icon: BoltIcon },
  { name: "Compare", href: "/compare", icon: ArrowsRightLeftIcon },
  { name: "AI", href: "/ai", icon: CpuChipIcon },
  { name: "Dashboard", href: "/kpis", icon: Squares2X2Icon }, // 👈 actualizado
  { name: "Estadísticas", href: "/stats", icon: ChartPieIcon },
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
          { name: "Gateways", href: "/configuracion/gateways", icon: GlobeAltIcon }, // 👈 nuevo
        ],
      },
      { name: "Usuarios", href: "/config/users", icon: UserIcon },
      { name: "Diagnóstico InfluxDB", href: "/config/diagnostico-influx", icon: ServerIcon },
      { name: "Tarifas", href: "/configuracion/tarifas", icon: MdPriceChange },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const renderMenu = (items: MenuItem[], level = 0) => (
    <ul className={`${level > 0 ? "ml-2 md:ml-6" : ""} mt-1 space-y-1`}>
      {items.map((item) => (
        <li key={item.name}>
          {item.href ? (
            <Link
              href={item.href}
              className={`flex items-center gap-2 p-2 rounded-md hover:bg-slate-800 ${
                pathname === item.href ? "bg-slate-800 text-white" : ""
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="hidden md:inline">{item.name}</span>
            </Link>
          ) : (
            <div className="flex flex-col">
              <div className="flex items-center gap-2 p-2 text-slate-400">
                <item.icon className="h-5 w-5" />
                <span className="hidden md:inline">{item.name}</span>
              </div>
              {item.children && renderMenu(item.children, level + 1)}
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside className="h-screen w-20 md:w-64 bg-slate-900 text-slate-200 flex flex-col">
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-lg font-bold text-white hidden md:block">PQGenius</h1>
        <p className="text-xs text-slate-400 hidden md:block">Industrial Analytics</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4">{renderMenu(menuItems)}</div>
    </aside>
  );
}