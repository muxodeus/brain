"use client";

import { useEffect, useState } from "react";

type KPI = {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
};

function getStatusColor(value: number, min: number, max: number) {
  if (value < min * 0.9 || value > max * 1.1) return "bg-red-600";
  if (value < min || value > max) return "bg-yellow-500";
  return "bg-green-600";
}

// Sparkline simple con SVG
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = ((d - min) / (max - min || 1)) * 30;
      return `${x},${30 - y}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 100 30" className="w-full h-8">
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
    </svg>
  );
}

export default function KPIsPage() {
  const [kpis, setKpis] = useState<KPI[]>([]);

useEffect(() => {
  async function fetchData() {
    const res = await fetch("/api/kpis");
    const data = await res.json();

    const mapped: KPI[] = [];

    ["A", "B", "C", "Total"].forEach((ch) => {
      if (data[ch]) {
        mapped.push(
          { label: `Voltaje ${ch}`, value: data[ch].voltage, unit: "V", min: 210, max: 240 },
          { label: `Corriente ${ch}`, value: data[ch].current, unit: "A", min: 0, max: 200 },
          { label: `Potencia Activa ${ch}`, value: data[ch].p_act, unit: "kW", min: 0, max: 500 },
          { label: `Factor de Potencia ${ch}`, value: data[ch].pf, unit: "", min: 0.85, max: 1 },
          { label: `THD Corriente ${ch}`, value: data[ch].ithd, unit: "%", min: 0, max: 10 },
          { label: `THD Voltaje ${ch}`, value: data[ch].vthd, unit: "%", min: 0, max: 5 }
        );
      }
    });

    setKpis(mapped);
  }

  fetchData();
  const interval = setInterval(fetchData, 2000);
  return () => clearInterval(interval);
}, []);

  // Construcción de tiles
  const tiles: JSX.Element[] = [];

  kpis.forEach((kpi, idx) => {
    tiles.push(
      <div
        key={`kpi-${idx}`}
        className={`p-4 rounded-lg shadow flex flex-col items-center justify-center text-white ${getStatusColor(
          kpi.value,
          kpi.min,
          kpi.max
        )}`}
      >
        <div className="text-sm">{kpi.label}</div>
        <div className="text-2xl font-bold">
          {kpi.value} {kpi.unit}
        </div>
      </div>
    );
  });

  // Rellenar hasta 25 cuadros
  while (tiles.length < 25) {
    tiles.push(
      <div
        key={`placeholder-${tiles.length}`}
        className="p-4 rounded-lg shadow bg-slate-800 text-white flex flex-col items-center justify-center"
      >
        <div className="text-sm opacity-75">—</div>
        <div className="text-2xl font-bold">—</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📊 Dashboard de KPIs</h1>
        <div className="text-xs text-slate-400">
          Última actualización: {new Date().toLocaleString("es-SV", { hour12: false })}
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {tiles}
      </div>
    </div>
  );
}