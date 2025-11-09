"use client";

import dynamic from "next/dynamic";
import { useHighcharts } from "@core/hooks/useHighcharts";

const HighchartsReact = dynamic(() => import("highcharts-react-official"), {
  ssr: false,
});

type Serie = {
  name: string;              // Nombre del medidor (ej. "Medidor A")
  data: [number, number][];  // Pares [timestamp, valor]
  color?: string;            // Color opcional
};

type Props = {
  title: string;   // Título de la gráfica (ej. "Voltaje")
  series: Serie[]; // Varias series, cada una de un medidor
  unit?: string;   // Unidad del parámetro (ej. "V", "A", "kW")
};

export default function OverlayChart({ title, series, unit }: Props) {
  const Highcharts = useHighcharts(); // ✅ Hook que carga Highcharts dinámicamente

  const options: any = {
    chart: {
      type: "line",
      backgroundColor: "transparent",
      zooming: { type: "x" },
    },
    title: {
      text: title,
      style: { color: "#fff" },
    },
    xAxis: {
      type: "datetime",
      labels: { style: { color: "#aaa" } },
      gridLineColor: "#333",
      crosshair: true,
    },
    yAxis: {
      title: { text: unit ? `${title} (${unit})` : title },
      labels: { style: { color: "#aaa" } },
      gridLineColor: "#333",
    },
    legend: {
      itemStyle: { color: "#ccc" },
    },
    tooltip: {
      shared: true,
      backgroundColor: "#1e293b",
      style: { color: "#fff" },
      valueSuffix: unit ? ` ${unit}` : "",
    },
    plotOptions: {
      series: {
        marker: { enabled: false },
        events: {
          legendItemClick: function () {
            return true;
          },
        },
      },
    },
    series: series.map((s) => ({
      type: "line",
      name: s.name,
      data: s.data,
      color: s.color,
    })),
    credits: { enabled: false },
  };

  return Highcharts ? (
    <HighchartsReact highcharts={Highcharts} options={options} />
  ) : (
    <p className="text-sm text-slate-500">Cargando gráfico...</p>
  );
}