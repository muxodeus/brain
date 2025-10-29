"use client";

import { useEffect, useState } from "react";
import Highcharts from "highcharts";
import dynamic from "next/dynamic";
import { cleanChannelName } from "@/config/channelAliases";
import { paramAliases } from "@/config/paramAliases";

const HighchartsReact = dynamic(() => import("highcharts-react-official"), { ssr: false });

// Inicializar módulos SOLO en cliente
if (typeof window !== "undefined") {
  const Exporting = require("highcharts/modules/exporting");
  const ExportData = require("highcharts/modules/export-data");
  const FullScreen = require("highcharts/modules/full-screen");

  if (Exporting.default) Exporting.default(Highcharts);
  if (ExportData.default) ExportData.default(Highcharts);
  if (FullScreen.default) FullScreen.default(Highcharts);
}

type ParamMeta = { field: string; label: string; unit: string };

type Props = {
  site: string;
  meter: string;
  param: string;
  range: string;
  allParams: ParamMeta[];
  onParamChange: (newParam: string) => void;
};

const CHANNELS = ["A", "B", "C", "Total"];

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

  useEffect(() => {
    async function fetchData() {
      const qs = new URLSearchParams({ param, range, meter, site, channel }).toString();
      const res = await fetch(`/api/trends?${qs}`);
      const data = await res.json();
      setSeries(Array.isArray(data.series) ? data.series : []);
      setStats(data.stats || {});
    }
    fetchData();
  }, [site, meter, param, range, channel]);

  const meta = allParams.find((p) => p.field === param) || paramAliases[param] || { label: param, unit: "" };

  const options: Highcharts.Options = {
    chart: { zoomType: "x", backgroundColor: "#0f172a" },
    title: { text: `${meta.label} (${cleanChannelName(channel)})`, style: { color: "#e2e8f0" } },
    xAxis: { type: "datetime", labels: { style: { color: "#94a3b8" } } },
    yAxis: { title: { text: meta.unit || "" }, labels: { style: { color: "#94a3b8" } } },
    tooltip: { shared: true, valueDecimals: 2, valueSuffix: ` ${meta.unit || ""}` },
    legend: { enabled: false },
    series: [
      {
        type: "line",
        name: meta.label,
        data: series.map((d) => [new Date(d.time).getTime(), d.value]),
        color: "#38bdf8",
      },
    ],
    exporting: { enabled: true },
  };

  return (
    <div className="bg-slate-900 p-4 rounded-lg shadow text-slate-200">
      {/* Header con selects */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">
          {meta.label} ({cleanChannelName(channel)})
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
            {CHANNELS.map((c) => (
              <option key={c} value={c}>
                {cleanChannelName(c)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Gráfico */}
      <HighchartsReact highcharts={Highcharts} options={options} />

      {/* Mini‑cards */}
      <div className="grid grid-cols-5 gap-2 text-xs mt-3">
        <div className="bg-slate-800 p-2 rounded border-t-4 border-emerald-500">
          Min: {stats.min ?? "—"} {meta.unit}
        </div>
        <div className="bg-slate-800 p-2 rounded border-t-4 border-blue-500">
          P5: {stats.p5 ?? "—"} {meta.unit}
        </div>
        <div className="bg-slate-800 p-2 rounded border-t-4 border-sky-500">
          Prom: {stats.mean ?? "—"} {meta.unit}
        </div>
        <div className="bg-slate-800 p-2 rounded border-t-4 border-orange-500">
          P95: {stats.p95 ?? "—"} {meta.unit}
        </div>
        <div className="bg-slate-800 p-2 rounded border-t-4 border-rose-500">
          Max: {stats.max ?? "—"} {meta.unit}
        </div>
      </div>
    </div>
  );
}