"use client";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

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
  const options: Highcharts.Options = {
    chart: {
      type: "line",
      backgroundColor: "transparent",
      zooming: { type: "x" }, // ✅ reemplazo de zoomType
    },
    title: {
      text: title,
      style: { color: "#fff" },
    },
    xAxis: {
      type: "datetime",
      labels: { style: { color: "#aaa" } },
      gridLineColor: "#333",
      crosshair: true, // ✅ crosshair ahora en el eje
    },
    yAxis: {
      title: { text: unit ? `${title} (${unit})` : title },
      labels: { style: { color: "#aaa" } },
      gridLineColor: "#333",
      crosshair: false, // opcional
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

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}