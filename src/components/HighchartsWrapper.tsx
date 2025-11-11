// brain/src/components/HighchartsWrapper.tsx
"use client";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useEffect } from "react";

// Tema visual global
Highcharts.setOptions({
  chart: {
    backgroundColor: "transparent",
    style: { fontFamily: "Inter, sans-serif" },
  },
  title: { style: { color: "#fff", fontWeight: "600" } },
  xAxis: {
    labels: { style: { color: "#cbd5e1" } },
    lineColor: "#475569",
    gridLineColor: "#334155",
  },
  yAxis: {
    labels: { style: { color: "#cbd5e1" } },
    title: { style: { color: "#fff" } },
    gridLineColor: "#334155",
    min: 0,
  },
  legend: {
    itemStyle: { color: "#cbd5e1" },
    itemHoverStyle: { color: "#06b6d4" },
  },
  tooltip: {
    backgroundColor: "#0b1220",
    borderColor: "#06b6d4",
    style: { color: "#fff" },
  },
  plotOptions: {
    column: { borderRadius: 4, borderColor: "transparent" },
    line: { lineWidth: 2, marker: { radius: 3 } },
    scatter: { marker: { radius: 5, symbol: "circle" } },
  },
  colors: ["#60a5fa", "#f97316", "#ef4444", "#22c55e", "#06b6d4", "#fbbf24"],
  accessibility: { enabled: false },
});

// Zona horaria local
Highcharts.setOptions({
  time: { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
});

type Props = {
  options: Highcharts.Options;
  height?: number;
};

export default function HighchartsWrapper({ options, height = 400 }: Props) {
  useEffect(() => {
    const exporting = require("highcharts/modules/exporting");
    const exportData = require("highcharts/modules/export-data");
    const fullscreen = require("highcharts/modules/full-screen");

    if (typeof exporting === "function") exporting(Highcharts);
    else if (exporting && typeof exporting.default === "function") exporting.default(Highcharts);

    if (typeof exportData === "function") exportData(Highcharts);
    else if (exportData && typeof exportData.default === "function") exportData.default(Highcharts);

    if (typeof fullscreen === "function") fullscreen(Highcharts);
    else if (fullscreen && typeof fullscreen.default === "function") fullscreen.default(Highcharts);
  }, []);

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={{
        ...options,
        chart: {
          ...options.chart,
          height,
        },
      }}
    />
  );
}