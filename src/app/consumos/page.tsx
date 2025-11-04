"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Highcharts from "highcharts";
import type { TooltipFormatterContextObject } from "highcharts";


// Highcharts v12+ modules
import "highcharts/modules/heatmap";
import "highcharts/modules/exporting";
import "highcharts/modules/export-data";

const HighchartsReact = dynamic(() => import("highcharts-react-official"), {
  ssr: false,
});

type KPI = { label: string; value: string };

// Hook utilitario para sincronizar rango rápido y fechas
function useSyncedRange() {
  const [range, setRange] = useState("7d");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // Si el usuario selecciona fechas manuales, desactiva el rango rápido
  useEffect(() => {
    if (from && to) setRange("");
  }, [from, to]);

  // Si el usuario selecciona un rango rápido, limpia fechas
  const selectRange = (r: string) => {
    setRange(r);
    setFrom("");
    setTo("");
  };

  return { range, from, to, setFrom, setTo, selectRange };
}

// Función para generar categorías legibles en el eje X
function generateCategories(range: string, from?: string, to?: string): string[] {
  const categories: string[] = [];
  const now = new Date();

  if (from && to) {
    const start = new Date(from);
    const end = new Date(to);
    const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    if (diffDays <= 1) {
      for (let h = 0; h < 24; h++) categories.push(`${h.toString().padStart(2, "0")}:00`);
    } else {
      for (let d = 0; d < diffDays; d++) {
        const date = new Date(start);
        date.setDate(start.getDate() + d);
        categories.push(date.toLocaleDateString("es-ES", { day: "numeric", month: "short" }));
      }
    }
    return categories;
  }

  if (range === "24h") {
    for (let h = 0; h < 24; h++) categories.push(`${h.toString().padStart(2, "0")}:00`);
  } else if (range === "7d") {
    for (let d = 6; d >= 0; d--) {
      const date = new Date();
      date.setDate(now.getDate() - d);
      categories.push(date.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" }));
    }
  } else if (range === "1m" || range === "30d") {
    for (let d = 29; d >= 0; d--) {
      const date = new Date();
      date.setDate(now.getDate() - d);
      categories.push(date.toLocaleDateString("es-ES", { day: "numeric", month: "short" }));
    }
  } else if (range === "6m") {
    for (let m = 5; m >= 0; m--) {
      const date = new Date();
      date.setMonth(now.getMonth() - m);
      categories.push(date.toLocaleDateString("es-ES", { month: "short", year: "2-digit" }));
    }
  }

  return categories;
}

export default function ConsumosPage() {
  const { range, from, to, setFrom, setTo, selectRange } = useSyncedRange();
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [consumoOptions, setConsumoOptions] = useState<Highcharts.Options>({});
  const [demandaOptions, setDemandaOptions] = useState<Highcharts.Options>({});
  const [heatmapOptions, setHeatmapOptions] = useState<Highcharts.Options>({});

  const fmt = (n: any) => {
    const num = typeof n === "string" ? parseFloat(n) : n;
    if (num === null || num === undefined || isNaN(num)) return "—";
    return num < 1000 ? num.toFixed(2) : num.toLocaleString("en-US", { maximumFractionDigits: 0 });
  };

  const generateHeatmapData = (days: number, hours: number) => {
    const data: [number, number, number][] = [];
    for (let day = 0; day < days; day++) {
      for (let hour = 0; hour < hours; hour++) {
        data.push([hour, day, Math.floor(Math.random() * 100)]);
      }
    }
    return data;
  };

  useEffect(() => {
    // points: número de datos en series; para 24h → 24, para 7d → 7, etc.
    let points = 7;

    if (from && to) {
      const start = new Date(from);
      const end = new Date(to);
      const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      points = diffDays <= 1 ? 24 : diffDays; // 1 día → 24 horas
    } else {
      if (range === "24h") points = 24;
      else if (range === "7d") points = 7;
      else if (range === "1m" || range === "30d") points = 30;
      else if (range === "6m") points = 6; // para meses en gráfico de barra/linea, 6 puntos
    }

    setKpis([
      { label: "Consumo total", value: `${(Math.random() * 20000).toFixed(0)} kWh` },
      { label: "Demanda máxima", value: `${(Math.random() * 500).toFixed(0)} kW` },
      { label: "Factor de carga", value: `${(60 + Math.random() * 30).toFixed(0)}%` },
      { label: "Costo estimado", value: `$${(Math.random() * 2000).toFixed(0)}` },
    ]);

    // Consumo
    setConsumoOptions({
      chart: { type: "column", backgroundColor: "transparent", height: 300 },
      title: { text: "Consumo energético", style: { color: "#fff" } },
      xAxis: {
        categories: generateCategories(range, from, to),
        labels: { style: { color: "#ccc" } },
      },
      yAxis: { title: { text: "kWh", style: { color: "#ccc" } }, labels: { style: { color: "#ccc" } } },
      tooltip: {
        headerFormat: "<span style='font-size:10px'>{point.key}</span><br/>",
        pointFormat: "<span style='color:{series.color}'>{series.name}</span>: <b>{point.y} kWh</b> <span>(CST)</span><br/>",
        shared: true,
        useHTML: true,
      },
      exporting: { enabled: true },
      series: [
        {
          type: "column",
          name: "Consumo",
          data: Array.from({ length: points }, () => Math.floor(Math.random() * 100)),
          color: "#38bdf8",
        },
      ],
    });

    // Demanda
    setDemandaOptions({
      chart: { type: "line", backgroundColor: "transparent", height: 300 },
      title: { text: "Demanda", style: { color: "#fff" } },
      xAxis: {
        categories: generateCategories(range, from, to),
        labels: { style: { color: "#ccc" } },
      },
      yAxis: { title: { text: "kW", style: { color: "#ccc" } }, labels: { style: { color: "#ccc" } } },
      tooltip: {
        headerFormat: "<span style='font-size:10px'>{point.key}</span><br/>",
        pointFormat: "<span style='color:{series.color}'>{series.name}</span>: <b>{point.y} kW</b> <span>(CST)</span><br/>",
        shared: true,
        useHTML: true,
      },
      exporting: { enabled: true },
      series: [
        {
          type: "line",
          name: "Demanda",
          data: Array.from({ length: points }, () => Math.floor(Math.random() * 100)),
          color: "#f472b6",
        },
      ],
    });

    // Heatmap: mantiene 24 horas por fila, y filas = días (no meses)
    const heatmapDays =
      from && to
        ? Math.max(1, Math.ceil((new Date(to).getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24)))
        : range === "24h"
        ? 1
        : range === "7d"
        ? 7
        : range === "1m" || range === "30d"
        ? 30
        : 30; // para 6m, el heatmap no es mensual; usamos 30 días reciente como referencia

    setHeatmapOptions({
      chart: { type: "heatmap", backgroundColor: "transparent", height: 400 },
      title: { text: "Mapa de calor de consumos", style: { color: "#fff" } },
      xAxis: {
        categories: Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`),
        labels: { style: { color: "#ccc" } },
        title: { text: "Hora del día", style: { color: "#ccc" } },
      },
      yAxis: {
        categories: Array.from({ length: heatmapDays }, (_, i) => `Día ${i + 1}`),
        title: { text: "Días", style: { color: "#ccc" } },
        labels: { style: { color: "#ccc" } },
        reversed: true,
      },
      colorAxis: {
        min: 0,
        stops: [
          [0, "#f0f9ff"],
          [0.5, "#bae6fd"],
          [1, "#38bdf8"],
        ],
      },
tooltip: {
  formatter: function (this: TooltipFormatterContextObject) {
    const hour = this.series.xAxis.categories[this.x as number];
    const day = this.series.yAxis.categories[this.y as number];
    return `<b>${this.point?.value ?? this.y} kWh</b><br/>${hour} - ${day} <span>(CST)</span>`;
  },
  useHTML: true,
},
exporting: { enabled: true },
series: [
  {
    type: "heatmap",
    name: "Consumo",
    borderWidth: 2,
    borderColor: "#1e293b",
    borderRadius: 6,
    data: generateHeatmapData(heatmapDays, 24),
  },
],
    });
  }, [range, from, to]);

  // ✅ Aquí va el return del componente
  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">🔆 Consumos energéticos</h1>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Selector de rango estilo Overview */}
          <div className="flex gap-2">
            {["24h", "7d", "1m", "6m"].map((r) => (
              <button
                key={r}
                onClick={() => selectRange(r)}
                className={`px-3 py-1 rounded ${
                  range === r
                    ? "bg-teal-500 text-white"
                    : "bg-slate-700 text-white opacity-70 hover:bg-slate-600"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Selector de rango de fechas */}
          <div className="flex gap-2 items-center">
            <label className="text-sm text-slate-400">Desde:</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="bg-slate-800 text-white p-2 rounded"
            />
            <label className="text-sm text-slate-400">Hasta:</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="bg-slate-800 text-white p-2 rounded"
            />
          </div>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-slate-800 p-4 rounded-lg shadow text-center">
            <div className="text-sm text-slate-400">{kpi.label}</div>
            <div className="text-xl font-bold">{fmt(kpi.value)}</div>
          </div>
        ))}
      </div>

      {/* Consumo en barras */}
      <div className="bg-slate-800 p-4 rounded-lg">
        <HighchartsReact highcharts={Highcharts} options={consumoOptions} />
      </div>

      {/* Demanda en línea */}
      <div className="bg-slate-800 p-4 rounded-lg">
        <HighchartsReact highcharts={Highcharts} options={demandaOptions} />
      </div>

      {/* Heatmap */}
      <div className="bg-slate-800 p-4 rounded-lg">
        <HighchartsReact highcharts={Highcharts} options={heatmapOptions} />
      </div>
    </div>
  );
}