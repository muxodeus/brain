"use client";

import { useEffect, useState } from "react";
import { cleanChannelName } from "@/config/channelAliases";
import { getParamLabel } from "@/utils/getParamLabel";
import HighchartsWrapper from "./HighchartsWrapper";

type ParamMeta = { field: string; label: string; unit: string; color?: string };

type Props = {
  site: string;
  meter: string;
  param: string;
  range: string; // "-1h" | "-24h" | "-7d" | "-30d"
  allParams: ParamMeta[];
  onParamChange: (newParam: string) => void;
};

export default function TendenciaCard({
  site,
  meter,
  param,
  range,
  allParams,
  onParamChange,
}: Props) {
  const [channel, setChannel] = useState<string>("A");
  const [series, setSeries] = useState<{ time: string; value: number }[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});

  // Calcular estadísticas
  function calcStats(s: { time: string; value: number }[]) {
    if (!s.length) return { min: NaN, p5: NaN, mean: NaN, p95: NaN, max: NaN };
    const values = s.map((d) => d.value).slice().sort((a, b) => a - b);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const min = values[0];
    const max = values[values.length - 1];
    const p5 = values[Math.floor(values.length * 0.05)];
    const p95 = values[Math.floor(values.length * 0.95)];
    return { min, p5, mean, p95, max };
  }

  // Fetch al mock API con soporte de rangos y canales
useEffect(() => {
  async function fetchData() {
    const res = await fetch(`/api/mockdata?site=${site}&meter=${meter}&range=${range}`);
    const data = await res.json();
    const seriesData = data[param]?.[channel] || data[param]?.Total || [];
    setSeries(seriesData);
    setStats(calcStats(seriesData));
  }
  fetchData();
  const id = setInterval(fetchData, 60000);
  return () => clearInterval(id);
}, [site, meter, param, range, channel]);

  const { label, unit } = getParamLabel(param);
  const paramColor = allParams.find((p) => p.field === param)?.color || "#64748b";

  // Opciones Highcharts: el eje X se ajusta por timestamps del API
  const options: Highcharts.Options = {
    chart: { backgroundColor: "#0f172a", zooming: { type: "x" } },
    title: { text: `${label} (${cleanChannelName(channel)})`, style: { color: "#e2e8f0" } },
    xAxis: {
      type: "datetime",
      labels: { style: { color: "#94a3b8" } },
      crosshair: true,
    },
    yAxis: {
      title: { text: unit || "" },
      labels: { style: { color: "#94a3b8" } },
    },
    tooltip: { shared: true, valueDecimals: 2, valueSuffix: ` ${unit || ""}` },
    legend: { enabled: false },
    exporting: { enabled: true },
    series: [
      {
        type: "line",
        name: label,
        data: series.map((d) => [new Date(d.time).getTime(), d.value]),
        color: paramColor,
        lineWidth: 2,
      },
    ],
  };

  return (
    <div className="bg-slate-900 p-4 rounded-lg shadow text-slate-200">
      {/* Header con selects */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">
          {label} ({cleanChannelName(channel)})
        </h3>
        <div className="flex gap-2">
          <select
            value={param}
            onChange={(e) => onParamChange(e.target.value)}
            className="bg-slate-800 text-slate-200 rounded px-2 py-1 text-sm"
          >
            {allParams.map((p) => (
              <option key={p.field} value={p.field}>
                {p.label}
              </option>
            ))}
          </select>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="bg-slate-800 text-slate-200 rounded px-2 py-1 text-sm"
          >
            {["A", "B", "C", "Total"].map((c) => (
              <option key={c} value={c}>
                {cleanChannelName(c)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Gráfico */}
      <HighchartsWrapper options={options} height={300} />

      {/* Mini‑cards con colores por estadístico y “Prom” */}
      <div className="grid grid-cols-5 gap-2 text-xs mt-3">
        {[
          { key: "min", label: "Min", color: "#3b82f6" },
          { key: "p5", label: "P5", color: "#22c55e" },
          { key: "mean", label: "Prom", color: "#f97316" },
          { key: "p95", label: "P95", color: "#9333ea" },
          { key: "max", label: "Max", color: "#ef4444" },
        ].map((stat) => (
          <div
            key={stat.key}
            className="bg-slate-800 p-2 rounded border-t-4"
            style={{ borderTopColor: stat.color }}
          >
            {stat.label}: {Number.isFinite(stats[stat.key]) ? stats[stat.key].toFixed(2) : "—"} {unit}
          </div>
        ))}
      </div>
    </div>
  );
}