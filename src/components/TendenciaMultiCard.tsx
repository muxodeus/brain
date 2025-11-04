"use client";

import { useEffect, useState } from "react";
import Highcharts from "highcharts";
import dynamic from "next/dynamic";
import { cleanChannelName } from "@/config/channelAliases";
import { getParamLabel } from "@/utils/getParamLabel";

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

type Props = {
  site: string;
  meter: string;
  param: string; // ej. "voltage_mean"
  range: string;
};

const CHANNELS = ["A", "B", "C", "Total"];

// 🔧 Mapeo param → clase Tailwind
function getParamClass(field: string): string {
  if (field.startsWith("voltage")) return "param-voltage";
  if (field.startsWith("current")) return "param-current";
  if (field.startsWith("p_act") || field.startsWith("p_app")) return "param-p-act";
  if (field.startsWith("p_react")) return "param-p-react";
  if (field.startsWith("energy")) return "param-energy";
  if (field.startsWith("pf")) return "param-pf";
  if (field.startsWith("freq")) return "param-frequency";
  if (field.includes("thd")) return "param-thd";
  return "param-default";
}

export default function TendenciaMultiCard({ site, meter, param, range }: Props) {
  const [seriesData, setSeriesData] = useState<Record<string, { time: string; value: number }[]>>({});

  useEffect(() => {
    async function fetchData() {
      const allSeries: Record<string, { time: string; value: number }[]> = {};
      for (const ch of CHANNELS) {
        const qs = new URLSearchParams({ param, range, meter, site, channel: ch }).toString();
        const res = await fetch(`/api/trends?${qs}`);
        const data = await res.json();
        allSeries[ch] = Array.isArray(data.series) ? data.series : [];
      }
      setSeriesData(allSeries);
    }
    fetchData();
  }, [site, meter, param, range]);

  const { label, unit } = getParamLabel(param);
  const paramClass = getParamClass(param);

  const options: Highcharts.Options = {
    chart: {
      backgroundColor: "#0f172a",
      zooming: { type: "x" }, // ✅ reemplazo de zoomType
    },
    title: { text: `${label} (A, B, C, Total)`, style: { color: "#e2e8f0" } },
    xAxis: {
      type: "datetime",
      labels: { style: { color: "#94a3b8" } },
      crosshair: true, // opcional, línea guía vertical
    },
    yAxis: {
      title: { text: unit || "" },
      labels: { style: { color: "#94a3b8" } },
    },
    tooltip: { shared: true, valueDecimals: 2, valueSuffix: ` ${unit || ""}` },
    legend: { enabled: true, itemStyle: { color: "#e2e8f0" } },
    series: CHANNELS.map((ch, idx) => ({
      type: "line",
      name: `${label} ${cleanChannelName(ch)}`,
      data: (seriesData[ch] || []).map((d) => [new Date(d.time).getTime(), d.value]),
      color: `hsl(var(--${paramClass}))`,
      dashStyle: idx === 0 ? "Solid" : idx === 1 ? "ShortDash" : idx === 2 ? "Dot" : "Dash",
    })),
    exporting: { enabled: true },
  };

  return (
    <div className="bg-slate-900 p-4 rounded-lg shadow text-slate-200">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
}