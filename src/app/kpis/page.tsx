"use client";

import { useEffect, useState } from "react";
import { getParamLabel } from "@/utils/getParamLabel";

type KPI = {
  field: string;
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
};

function getParamClass(field: string): string {
  if (field.startsWith("Voltaje")) return "param-voltage";
  if (field.startsWith("Corriente")) return "param-current";
  if (field.startsWith("Potencia Activa")) return "param-p-act";
  if (field.includes("Reactiva")) return "param-p-react";
  if (field.includes("Energía")) return "param-energy";
  if (field.startsWith("Factor")) return "param-pf";
  if (field.startsWith("Frecuencia")) return "param-frequency";
  if (field.includes("THD")) return "param-thd";
  return "param-default";
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
  const [history, setHistory] = useState<Record<string, number[]>>({});

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/kpis");
      const data = await res.json();

      const mapped: KPI[] = [];
      const newHistory: Record<string, number[]> = { ...history };

      ["A", "B", "C", "Total"].forEach((ch) => {
        if (data[ch]) {
          const entries: KPI[] = [
            { field: `voltage_${ch}`, label: `Voltaje ${ch}`, value: data[ch].voltage, unit: "V", min: 210, max: 240 },
            { field: `current_${ch}`, label: `Corriente ${ch}`, value: data[ch].current, unit: "A", min: 0, max: 200 },
            { field: `p_act_${ch}`, label: `Potencia Activa ${ch}`, value: data[ch].p_act, unit: "kW", min: 0, max: 500 },
          ];
          entries.forEach((kpi) => {
            if (!newHistory[kpi.label]) newHistory[kpi.label] = [];
            newHistory[kpi.label] = [...newHistory[kpi.label].slice(-19), kpi.value];
          });
          mapped.push(...entries);
        }
      });

      setKpis(mapped);
      setHistory(newHistory);
    }

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  // Tiles principales
  const kpiTiles = kpis.map((kpi, idx) => {
    const paramClass = getParamClass(kpi.label);
    return (
      <div
        key={`kpi-${idx}`}
        className={`p-4 rounded-lg shadow flex flex-col items-center justify-center text-white border-t-4 border-${paramClass} animate-fadeIn`}
        style={{ animationDelay: `${idx * 50}ms` }}
      >
        <div className="text-sm">{kpi.label}</div>
        <div className={`text-2xl font-bold text-${paramClass}`}>
          {kpi.value} {kpi.unit}
        </div>
      </div>
    );
  });

  // Placeholders hasta 20
  const placeholders = Array.from({ length: Math.max(0, 20 - kpiTiles.length) }, (_, i) => (
    <div
      key={`placeholder-${i}`}
      className="p-4 rounded-lg shadow bg-slate-800 text-white flex flex-col items-center justify-center animate-fadeIn"
      style={{ animationDelay: `${(kpiTiles.length + i) * 50}ms` }}
    >
      <div className="text-sm opacity-75">—</div>
      <div className="text-2xl font-bold">—</div>
    </div>
  ));

  // Última fila: tendencias
  const trendTiles = Object.keys(history)
    .slice(0, 5)
    .map((label, i) => {
      const paramClass = getParamClass(label);
      return (
        <div
          key={`trend-${i}`}
          className={`p-4 rounded-lg shadow bg-slate-800 text-white flex flex-col animate-fadeIn border-t-4 border-${paramClass}`}
          style={{ animationDelay: `${(kpiTiles.length + placeholders.length + i) * 50}ms` }}
        >
          <div className="text-sm mb-2">{label} (tendencia)</div>
          <Sparkline data={history[label]} color={`hsl(var(--${paramClass}))`} />
        </div>
      );
    });

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📊 Dashboard de KPIs</h1>
        <div className="text-xs text-slate-400">
          Última actualización:{" "}
          {new Date().toLocaleString("es-SV", { hour12: false })}
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpiTiles.concat(placeholders)}
      </div>

      {/* Fila de tendencias */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {trendTiles}
      </div>
    </div>
  );
}